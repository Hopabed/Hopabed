import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { User } from '../models/User.js';
import { env } from '../config/env.js';
import { sha512 } from 'js-sha512';
import {
  sendBookingConfirmationEmail,
  sendHostBookingAlertEmail,
  sendPaymentFailureEmail,
} from '../services/emailService.js';

const router = Router();

// PayU hash generation format: sha512(key|txnid|amount|productinfo|firstname|email|udf1|udf2|udf3|udf4|udf5||||||SALT)
router.post('/payu-init', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({ bookingId: z.string() }).parse(req.body);
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const booking = await Booking.findOne({ _id: input.bookingId, guest: userId });
    if (!booking) {
      res.status(404).json({ success: false, error: { message: 'Booking not found' } });
      return;
    }

    if (booking.paymentStatus === 'PAID') {
      res.status(400).json({ success: false, error: { message: 'Booking is already paid' } });
      return;
    }

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, error: { message: 'User not found' } });
      return;
    }

    // Generate unique PayU reference ID starting with HB_
    const txnid = 'HB_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();
    const amount = booking.totalAmount.toFixed(2);
    const productinfo = `Booking ${booking._id}`;
    const firstname = user.name.split(' ')[0] || 'Guest';
    const email = user.email;

    const key = env.PAYU_MERCHANT_KEY;
    const salt = env.PAYU_MERCHANT_SALT;
    const isTest = env.PAYU_ENV !== 'production';
    const payuUrl = isTest ? 'https://test.payu.in/_payment' : 'https://secure.payu.in/_payment';
    
    // Hash sequence
    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${salt}`;
    const hash = sha512(hashString);

    // Create or update the Payment record in our DB for this booking (handles payment retries safely)
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: userId,
          amount: booking.totalAmount,
          currency: 'INR',
          paymentGateway: 'payu',
          orderId: txnid,
          status: 'pending',
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({ 
      success: true, 
      data: { 
        payuUrl,
        key,
        txnid, 
        amount, 
        productinfo,
        firstname,
        email,
        phone: '9999999999',
        surl: `${env.API_URL}/api/payments/payu-success`,
        furl: `${env.API_URL}/api/payments/payu-failure`,
        hash
      } 
    });
  } catch (error) {
    next(error);
  }
});

// PayU Success Redirect (Form POST from PayU) - Not the final source of truth
router.post('/payu-success', async (req, res, next) => {
  try {
    const frontendUrl = env.FRONTEND_URL;
    // We just redirect to the frontend. We don't mark as confirmed here.
    res.redirect(`${frontendUrl}/bookings?success=true`);
  } catch (error) {
    console.error('PayU success redirect error:', error);
    res.redirect(`${env.FRONTEND_URL}/bookings?error=internal_error`);
  }
});

// PayU Failure Redirect
router.post('/payu-failure', async (req, res, next) => {
  try {
    const frontendUrl = env.FRONTEND_URL;
    res.redirect(`${frontendUrl}/bookings?error=payment_failed`);
  } catch (error) {
    res.redirect(`${env.FRONTEND_URL}/bookings?error=internal_error`);
  }
});

// PayU Webhook - The real source of truth
router.post('/payu-webhook', async (req, res, next) => {
  try {
    const { txnid, amount, productinfo, firstname, email, status, hash } = req.body;
    
    const key = env.PAYU_MERCHANT_KEY;
    const salt = env.PAYU_MERCHANT_SALT;
    
    // Verify reverse hash: sha512(SALT|status|||||||||||email|firstname|productinfo|amount|txnid|key)
    const reverseHashString = `${salt}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${key}`;
    const calculatedHash = sha512(reverseHashString);

    const hashBuf = Buffer.from(typeof hash === 'string' ? hash : '', 'utf-8');
    const calcBuf = Buffer.from(calculatedHash, 'utf-8');

    if (hashBuf.length !== calcBuf.length || !crypto.timingSafeEqual(hashBuf, calcBuf)) {
      console.error('PayU Webhook Signature mismatch for txnid:', txnid);
      res.status(400).send('Invalid signature');
      return;
    }

    const payment = await Payment.findOne({ orderId: txnid });
    if (!payment) {
      res.status(404).send('Payment not found');
      return;
    }

    // Amount verification MUST happen before idempotency status guard
    if (parseFloat(amount) !== payment.amount) {
      console.error('Amount mismatch in webhook for txnid:', txnid);
      res.status(400).send('Amount mismatch');
      return;
    }

    // Atomic idempotency guard: only transition if status is not already in a terminal state
    const targetStatus = status === 'success' ? 'captured' : (status === 'pending' ? 'pending' : 'failed');
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: { $nin: ['captured', 'failed', 'refunded'] },
      },
      {
        $set: {
          status: targetStatus,
          'metadata.payuWebhookResponse': req.body,
        },
      },
      { new: true }
    );

    if (!updatedPayment) {
      res.status(200).send('Already processed');
      return;
    }

    if (status === 'success') {
      const booking = await Booking.findById(payment.booking)
        .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
        .populate<{ property: { title: string } }>('property', 'title')
        .populate<{ room: { name: string; type?: string } }>('room', 'name type')
        .populate<{ host: { user: { name: string; email: string } } }>({
          path: 'host',
          populate: { path: 'user', select: 'name email' },
        });

      if (booking && booking.paymentStatus !== 'PAID') {
        booking.paymentStatus = 'PAID';
        booking.status = 'confirmed';
        await booking.save();

        const guestName = booking.guest?.name || firstname || 'Guest';
        const guestEmail = booking.guest?.email || email;
        const propertyTitle = booking.property?.title || productinfo || 'Hopebed Property';
        const roomName = (booking.room as any)?.name || (booking.room as any)?.type || 'Standard Room';
        const stayPassUrl = `${env.FRONTEND_URL}/bookings`;

        if (guestEmail) {
          sendBookingConfirmationEmail({
            guestName,
            guestEmail,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
            stayPassUrl,
          }).catch((err) => console.error('[Webhook] Guest confirmation email error:', err));
        }

        const hostUser = (booking.host as any)?.user;
        if (hostUser?.email) {
          sendHostBookingAlertEmail({
            hostName: hostUser.name || 'Host',
            hostEmail: hostUser.email,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            guestName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
          }).catch((err) => console.error('[Webhook] Host booking alert email error:', err));
        }
      }
    } else {
      const booking = await Booking.findById(payment.booking)
        .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
        .populate<{ property: { title: string } }>('property', 'title');

      if (booking && booking.guest?.email) {
        sendPaymentFailureEmail({
          guestName: booking.guest.name || firstname || 'Guest',
          guestEmail: booking.guest.email || email,
          bookingId: String(booking._id),
          propertyTitle: booking.property?.title || 'Hopebed Property',
          amount: payment.amount,
        }).catch((err) => console.error('[Webhook] Payment failure email error:', err));
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('PayU webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Server-to-Server Verification
router.post('/payu-verify', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({ bookingId: z.string() }).parse(req.body);
    const userId = req.auth?.userId;
    
    const payment = await Payment.findOne({ booking: input.bookingId, user: userId }).sort({ createdAt: -1 });
    if (!payment) {
      res.status(404).json({ success: false, error: { message: 'Payment not found' } });
      return;
    }

    const key = env.PAYU_MERCHANT_KEY;
    const salt = env.PAYU_MERCHANT_SALT;
    const txnid = payment.orderId;
    const command = 'verify_payment';
    
    // Hash format for verification: sha512(key|command|var1|salt)
    const hashStr = `${key}|${command}|${txnid}|${salt}`;
    const hash = sha512(hashStr);

    const isTest = env.PAYU_ENV !== 'production';
    const verifyUrl = isTest ? 'https://test.payu.in/merchant/postservice?form=2' : 'https://info.payu.in/merchant/postservice.php?form=2';

    const verifyForm = new URLSearchParams();
    verifyForm.append('key', key);
    verifyForm.append('command', command);
    verifyForm.append('hash', hash);
    if(txnid) {
        verifyForm.append('var1', txnid);
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: verifyForm.toString()
    });

    const body = (await response.json()) as any;
    
    if (body.status === 1 && body.transaction_details && body.transaction_details[txnid || '']) {
      const txDetails = body.transaction_details[txnid || ''];
      
      // Update DB if verify status is successful but DB is pending
      if (txDetails.status === 'success' && payment.status !== 'captured') {
        payment.status = 'captured';
        await payment.save();
        await Booking.findByIdAndUpdate(payment.booking, { paymentStatus: 'PAID', status: 'confirmed' });
      } else if (txDetails.status === 'failure' && payment.status === 'pending') {
        payment.status = 'failed';
        await payment.save();
      }

      res.status(200).json({ success: true, data: { status: txDetails.status } });
    } else {
      res.status(400).json({ success: false, error: { message: 'Verification failed' } });
    }
  } catch (error) {
    next(error);
  }
});

// Server-to-Server Refund (Admin ONLY)
router.post('/payu-refund', requireAuth, requireRole('admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({ bookingId: z.string(), amount: z.number().optional() }).parse(req.body);
    
    const payment = await Payment.findOne({ booking: input.bookingId, status: 'captured' });
    if (!payment) {
      res.status(404).json({ success: false, error: { message: 'Valid payment not found for refund' } });
      return;
    }

    const booking = await Booking.findById(payment.booking);
    if (!booking) {
      res.status(404).json({ success: false, error: { message: 'Booking not found' } });
      return;
    }

    const refundAmount = input.amount || payment.amount;
    const txnid = payment.paymentId || payment.orderId; // Usually need the PayU ID (mihpayid), but fallback to txnid
    const cancelRefundToken = 'REF_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();

    const key = env.PAYU_MERCHANT_KEY;
    const salt = env.PAYU_MERCHANT_SALT;
    const command = 'cancel_refund_transaction';
    
    // Hash format: sha512(key|command|var1|salt)
    const hashStr = `${key}|${command}|${txnid}|${salt}`;
    const hash = sha512(hashStr);

    const isTest = env.PAYU_ENV !== 'production';
    const url = isTest ? 'https://test.payu.in/merchant/postservice?form=2' : 'https://info.payu.in/merchant/postservice.php?form=2';

    const params = new URLSearchParams();
    params.append('key', key);
    params.append('command', command);
    params.append('hash', hash);
    if(txnid) {
        params.append('var1', txnid);
    }
    params.append('var2', cancelRefundToken);
    params.append('var3', refundAmount.toString());

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString()
    });

    const body = (await response.json()) as any;
    if (body.status === 1) {
      payment.status = 'refunded';
      payment.metadata = { ...payment.metadata, refundResponse: body };
      await payment.save();
      
      booking.status = 'cancelled';
      booking.paymentStatus = 'REFUNDED';
      await booking.save();
      
      res.status(200).json({ success: true, data: { message: 'Refund initiated successfully', refundId: body.request_id } });
    } else {
      res.status(400).json({ success: false, error: { message: body.msg || 'Refund failed' } });
    }
  } catch (error) {
    next(error);
  }
});
// ----------------------------------------------------------------------------
// RAZORPAY INTEGRATION
// ----------------------------------------------------------------------------

import Razorpay from 'razorpay';

// Initialize Razorpay instance lazily to avoid crashing if keys are missing
const getRazorpayInstance = () => {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured.');
  }
  return new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
};

router.post('/razorpay-init', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({ bookingId: z.string() }).parse(req.body);
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const booking = await Booking.findOne({ _id: input.bookingId, guest: userId });
    if (!booking) {
      res.status(404).json({ success: false, error: { message: 'Booking not found' } });
      return;
    }

    if (booking.paymentStatus === 'PAID') {
      res.status(400).json({ success: false, error: { message: 'Booking is already paid' } });
      return;
    }

    const amountInPaise = Math.round(booking.totalAmount * 100);
    if (amountInPaise < 100) {
      res.status(400).json({ success: false, error: { message: 'Amount must be at least 1 INR' } });
      return;
    }

    const razorpay = getRazorpayInstance();
    const receipt = `RCP_${booking._id.toString().slice(-8)}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
    });

    // Create or update pending payment
    await Payment.findOneAndUpdate(
      { booking: booking._id },
      {
        $set: {
          user: userId,
          amount: booking.totalAmount,
          currency: 'INR',
          paymentGateway: 'razorpay',
          orderId: order.id,
          status: 'pending',
        },
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error: any) {
    console.error('Razorpay init error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Failed to initialize Razorpay payment' } });
  }
});

router.post('/razorpay-verify', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
      bookingId: z.string(),
    }).parse(req.body);

    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Unauthorized' } });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = input;

    // Verify Signature: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    if (!env.RAZORPAY_KEY_SECRET) {
      res.status(500).json({ success: false, error: { message: 'Razorpay secret not configured' } });
      return;
    }

    const generatedSignature = crypto
      .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      res.status(400).json({ success: false, error: { message: 'Invalid payment signature' } });
      return;
    }

    const payment = await Payment.findOne({ orderId: razorpay_order_id, user: userId });
    if (!payment) {
      res.status(404).json({ success: false, error: { message: 'Payment record not found' } });
      return;
    }

    if (payment.status !== 'captured') {
      payment.status = 'captured';
      payment.paymentId = razorpay_payment_id;
      await payment.save();

      const booking = await Booking.findById(bookingId)
        .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
        .populate<{ property: { title: string } }>('property', 'title')
        .populate<{ room: { name: string; type?: string } }>('room', 'name type')
        .populate<{ host: { user: { name: string; email: string } } }>({
          path: 'host',
          populate: { path: 'user', select: 'name email' },
        });

      if (booking && booking.paymentStatus !== 'PAID') {
        await Booking.updateOne(
          { _id: bookingId }, 
          { $set: { paymentStatus: 'PAID', status: 'confirmed' } }
        );

        const guestName = booking.guest?.name || 'Guest';
        const guestEmail = booking.guest?.email;
        const propertyTitle = booking.property?.title || 'Hopebed Property';
        const roomName = (booking.room as any)?.name || (booking.room as any)?.type || 'Standard Room';
        const stayPassUrl = `${env.FRONTEND_URL}/bookings`;

        if (guestEmail) {
          sendBookingConfirmationEmail({
            guestName,
            guestEmail,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
            stayPassUrl,
          }).catch((err) => console.error('[Razorpay] Guest confirmation email error:', err));
        }

        const hostUser = (booking.host as any)?.user;
        if (hostUser?.email) {
          sendHostBookingAlertEmail({
            hostName: hostUser.name || 'Host',
            hostEmail: hostUser.email,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            guestName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
          }).catch((err) => console.error('[Razorpay] Host booking alert email error:', err));
        }
      }
    }

    res.status(200).json({ success: true, data: { status: 'success' } });
  } catch (error: any) {
    console.error('Razorpay verification error:', error);
    res.status(500).json({ success: false, error: { message: error.message || 'Internal verification error' } });
  }
});

// Razorpay Webhook - The real source of truth for Razorpay payments
router.post('/razorpay-webhook', async (req: any, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const rawBody = req.rawBody; // Captured via express.json verify in index.ts
    const secret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

    if (!signature || !rawBody || !secret) {
      res.status(400).send('Missing signature, body, or secret configuration');
      return;
    }

    const expectedSignature = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (expectedSignature !== signature) {
      console.error('Razorpay Webhook Signature mismatch');
      res.status(400).send('Invalid signature');
      return;
    }

    const { event, payload } = req.body;
    let orderId: string | undefined;
    let paymentId: string | undefined;
    let amount: number | undefined;

    if (event === 'payment.captured' || event === 'payment.authorized') {
      orderId = payload.payment?.entity?.order_id;
      paymentId = payload.payment?.entity?.id;
      amount = payload.payment?.entity?.amount ? payload.payment.entity.amount / 100 : undefined;
    } else if (event === 'order.paid') {
      orderId = payload.order?.entity?.id;
      paymentId = payload.payment?.entity?.id; // Note: 'order.paid' payload may have payment entity nested
      amount = payload.order?.entity?.amount ? payload.order.entity.amount / 100 : undefined;
    } else if (event === 'payment.failed') {
      orderId = payload.payment?.entity?.order_id;
      paymentId = payload.payment?.entity?.id;
      amount = payload.payment?.entity?.amount ? payload.payment.entity.amount / 100 : undefined;
    } else {
      res.status(200).send('Event ignored');
      return;
    }

    if (!orderId) {
      res.status(400).send('Order ID missing in payload');
      return;
    }

    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      res.status(404).send('Payment not found');
      return;
    }

    if (amount !== undefined && amount !== payment.amount) {
      console.error(`Amount mismatch in Razorpay webhook for order: ${orderId}`);
      res.status(400).send('Amount mismatch');
      return;
    }

    const isSuccess = event === 'payment.captured' || event === 'order.paid';
    const targetStatus = isSuccess ? 'captured' : 'failed';

    // Atomic idempotency guard
    const updatedPayment = await Payment.findOneAndUpdate(
      {
        _id: payment._id,
        status: { $nin: ['captured', 'failed', 'refunded'] },
      },
      {
        $set: {
          status: targetStatus,
          paymentId: paymentId || payment.paymentId,
          'metadata.razorpayWebhookResponse': req.body,
        },
      },
      { new: true }
    );

    if (!updatedPayment) {
      res.status(200).send('Already processed');
      return;
    }

    if (isSuccess) {
      const booking = await Booking.findById(payment.booking)
        .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
        .populate<{ property: { title: string } }>('property', 'title')
        .populate<{ room: { name: string; type?: string } }>('room', 'name type')
        .populate<{ host: { user: { name: string; email: string } } }>({
          path: 'host',
          populate: { path: 'user', select: 'name email' },
        });

      if (booking && booking.paymentStatus !== 'PAID') {
        booking.paymentStatus = 'PAID';
        booking.status = 'confirmed';
        await booking.save();

        const guestName = booking.guest?.name || 'Guest';
        const guestEmail = booking.guest?.email;
        const propertyTitle = booking.property?.title || 'Hopebed Property';
        const roomName = (booking.room as any)?.name || (booking.room as any)?.type || 'Standard Room';
        const stayPassUrl = `${env.FRONTEND_URL}/bookings`;

        if (guestEmail) {
          sendBookingConfirmationEmail({
            guestName,
            guestEmail,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
            stayPassUrl,
          }).catch((err) => console.error('[Webhook] Guest confirmation email error:', err));
        }

        const hostUser = (booking.host as any)?.user;
        if (hostUser?.email) {
          sendHostBookingAlertEmail({
            hostName: hostUser.name || 'Host',
            hostEmail: hostUser.email,
            bookingId: String(booking._id),
            propertyTitle,
            roomName,
            guestName,
            checkIn: booking.checkIn.toISOString(),
            checkOut: booking.checkOut.toISOString(),
            totalAmount: booking.totalAmount,
          }).catch((err) => console.error('[Webhook] Host booking alert email error:', err));
        }
      }
    } else {
      const booking = await Booking.findById(payment.booking)
        .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
        .populate<{ property: { title: string } }>('property', 'title');

      if (booking && booking.guest?.email) {
        sendPaymentFailureEmail({
          guestName: booking.guest.name || 'Guest',
          guestEmail: booking.guest.email,
          bookingId: String(booking._id),
          propertyTitle: booking.property?.title || 'Hopebed Property',
          amount: payment.amount,
        }).catch((err) => console.error('[Webhook] Payment failure email error:', err));
      }
    }

    res.status(200).send('Webhook processed');
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.status(500).send('Internal Server Error');
  }
});

export default router;
