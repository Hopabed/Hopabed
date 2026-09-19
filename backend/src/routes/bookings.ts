import { Router } from 'express';
import { Types } from 'mongoose';
import { Booking } from '../models/Booking.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import { Payment } from '../models/Payment.js';
import { env } from '../config/env.js';
import { Host } from '../models/Host.js';
import { sha512 } from 'js-sha512';

const router = Router();

router.get('/:id/verify-pass', async (req, res, next) => {
  try {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Invalid or missing booking ID.' } });
      return;
    }
    const booking = await Booking.findById(bookingId)
      .populate('property', 'title city locality primaryImage address')
      .populate('guest', 'name email mobile phone')
      .populate('room', 'name roomType')
      .lean();

    if (!booking) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking pass not found.' } });
      return;
    }

    const isVerified = booking.paymentStatus === 'PAID' && booking.status !== 'cancelled' && booking.status !== 'rejected';

    res.json({
      success: true,
      data: {
        booking: {
          id: String(booking._id),
          status: booking.status,
          paymentStatus: booking.paymentStatus,
          guestName: (booking.guest as any)?.name || 'Guest',
          guestEmail: (booking.guest as any)?.email || '',
          guestPhone: (booking.guest as any)?.mobile || (booking.guest as any)?.phone || '',
          propertyTitle: (booking.property as any)?.title || 'Hopebed Property',
          propertyAddress: (booking.property as any)?.address || '',
          city: (booking.property as any)?.city || '',
          locality: (booking.property as any)?.locality || '',
          primaryImage: (booking.property as any)?.primaryImage || '',
          roomName: (booking.room as any)?.name || 'Standard Room',
          roomType: (booking.room as any)?.roomType || '',
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          nights: booking.nights,
          guests: booking.guests,
          roomCount: booking.roomCount,
          totalAmount: booking.totalAmount,
          currency: booking.currency || 'INR',
          createdAt: booking.createdAt,
          isVerified,
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/:id/check-in', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Invalid booking ID.' } });
      return;
    }
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } });
      return;
    }
    
    // Authorization check
    if (req.auth?.role !== 'admin') {
      const hostDoc = await Host.findOne({ user: req.auth?.userId });
      if (!hostDoc || String(hostDoc._id) !== String(booking.host)) {
        res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You do not have permission to check-in this booking.' } });
        return;
      }
    }

    booking.status = 'checked_in';
    await booking.save();
    res.json({ success: true, message: 'Guest checked in successfully', status: booking.status });
  } catch (error) {
    next(error);
  }
});

router.get('/', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookings = await Booking.find({ guest: req.auth?.userId })
      .populate('property', 'title city locality primaryImage address')
      .populate('room', 'name roomType')
      .sort({ checkIn: -1 })
      .lean();
    res.json({ success: true, data: { bookings } });
  } catch (error) { next(error); }
});

router.get('/:id', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) { res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } }); return; }
    const booking = await Booking.findOne({ _id: bookingId, guest: req.auth?.userId }).populate('property', 'title city locality primaryImage address').populate('room', 'name roomType').lean();
    if (!booking) { res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } }); return; }
    res.json({ success: true, data: { booking } });
  } catch (error) { next(error); }
});

router.post('/:id/cancel', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!Types.ObjectId.isValid(bookingId)) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } });
      return;
    }

    const booking = await Booking.findOne({ _id: bookingId, guest: req.auth?.userId })
      .populate<{ guest: { name: string; email: string } }>('guest', 'name email')
      .populate<{ property: { title: string } }>('property', 'title')
      .populate<{ host: { user: { name: string; email: string } } }>({
        path: 'host',
        populate: { path: 'user', select: 'name email' },
      });

    if (!booking) {
      res.status(404).json({ success: false, error: { code: 'BOOKING_NOT_FOUND', message: 'Booking not found.' } });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, error: { code: 'ALREADY_CANCELLED', message: 'Booking is already cancelled.' } });
      return;
    }

    // --- Phase 8: Cancellation & Refund Engine ---
    const now = new Date();
    const checkInDate = new Date(booking.checkIn);
    const diffHours = (checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    let refundPercentage = 0;
    if (diffHours >= 168) { // > 7 days (168 hours)
      refundPercentage = 1;
    } else if (diffHours >= 48) { // > 48 hours
      refundPercentage = 0.5;
    }

    if (booking.paymentStatus === 'PAID' && refundPercentage > 0) {
      const payment = await Payment.findOne({ booking: booking._id, status: 'captured' });
      if (payment) {
        const refundAmount = Number((booking.totalAmount * refundPercentage).toFixed(2));
        
        if (payment.paymentGateway === 'razorpay') {
          try {
            const authStr = Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64');
            const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${payment.paymentId}/refund`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${authStr}`
              },
              body: JSON.stringify({
                amount: Math.round(refundAmount * 100), // Razorpay expects paise
                speed: 'normal'
              })
            });
            const refundBody = (await refundRes.json()) as any;
            if (refundRes.ok && (refundBody.status === 'processed' || refundBody.status === 'pending')) {
              payment.status = 'refunded';
              payment.metadata = { ...payment.metadata, refundResponse: refundBody };
              await payment.save();
              booking.paymentStatus = 'REFUNDED';
            } else {
              console.error('[BookingRoute] Razorpay Refund Failed:', refundBody);
            }
          } catch(err) {
            console.error('[BookingRoute] Razorpay Refund Request Error:', err);
          }
        } else {
          // Legacy PayU fallback
          const txnid = payment.paymentId || payment.orderId;
          const cancelRefundToken = 'REF_' + Math.random().toString(36).substring(2, 10).toUpperCase() + '_' + Date.now();
          const key = env.PAYU_MERCHANT_KEY;
          const salt = env.PAYU_MERCHANT_SALT;
          const command = 'cancel_refund_transaction';
          const hashStr = `${key}|${command}|${txnid}|${salt}`;
          const hash = sha512(hashStr);

          const url = env.PAYU_ENV !== 'production' ? 'https://test.payu.in/merchant/postservice?form=2' : 'https://info.payu.in/merchant/postservice.php?form=2';
          const params = new URLSearchParams();
          params.append('key', key);
          params.append('command', command);
          params.append('hash', hash);
          if(txnid) params.append('var1', txnid);
          params.append('var2', cancelRefundToken);
          params.append('var3', refundAmount.toString());

          try {
            const refundRes = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString() });
            const refundBody = (await refundRes.json()) as any;
            if (refundBody.status === 1) {
              payment.status = 'refunded';
              payment.metadata = { ...payment.metadata, refundResponse: refundBody };
              await payment.save();
              booking.paymentStatus = 'REFUNDED';
            } else {
              console.error('[BookingRoute] PayU Refund Failed:', refundBody);
            }
          } catch(err) {
            console.error('[BookingRoute] PayU Refund Request Error:', err);
          }
        }
      }
    }
    // --- End Phase 8 ---

    booking.status = 'cancelled';
    if (booking.paymentStatus === 'PAID' && booking.paymentStatus !== 'REFUNDED') {
      booking.manualRefundRequired = true;
    }
    await booking.save();

    const guestName = booking.guest?.name || 'Guest';
    const guestEmail = booking.guest?.email;
    const propertyTitle = booking.property?.title || 'Property';

    if (guestEmail) {
      const { sendCancellationEmail } = await import('../services/emailService.js');
      sendCancellationEmail({
        recipientName: guestName,
        recipientEmail: guestEmail,
        bookingId: String(booking._id),
        propertyTitle,
        cancelledBy: 'Guest',
      }).catch((err) => console.error('[BookingRoute] Cancellation email error:', err));
    }

    const hostUser = (booking.host as any)?.user;
    if (hostUser?.email) {
      const { sendCancellationEmail } = await import('../services/emailService.js');
      sendCancellationEmail({
        recipientName: hostUser.name || 'Host',
        recipientEmail: hostUser.email,
        bookingId: String(booking._id),
        propertyTitle,
        cancelledBy: 'Guest',
      }).catch((err) => console.error('[BookingRoute] Host cancellation email error:', err));
    }

    res.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
});

export default router;