import dotenv from 'dotenv';
import path from 'path';
import crypto from 'crypto';

dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

// Set test credentials early
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_123456789012345678901234567890123';
process.env.RAZORPAY_KEY_ID = 'rzp_test_12345';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_12345';
process.env.RAZORPAY_WEBHOOK_SECRET = 'rzp_webhook_secret_12345';

import mongoose from 'mongoose';
import nock from 'nock';

const TEST_PORT = 5007;
const API_BASE = `http://localhost:${TEST_PORT}/api`;

// We must mock the Razorpay SDK to avoid actual API calls during test
nock('https://api.razorpay.com')
  .persist()
  .post('/v1/orders')
  .reply(200, function (uri, requestBody: any) {
    return {
      id: `order_test_${Date.now()}`,
      entity: 'order',
      amount: requestBody.amount,
      currency: requestBody.currency,
      receipt: requestBody.receipt,
      status: 'created',
      attempts: 0,
    };
  });

async function runRazorpayWebhookTests() {
  console.log('=== STARTING RAZORPAY WEBHOOK INTEGRATION TEST ===\n');

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const { app } = await import('../src/index.js');
  const { Booking } = await import('../src/models/Booking.js');
  const { Property } = await import('../src/models/Property.js');
  const { Room } = await import('../src/models/Room.js');
  const { User } = await import('../src/models/User.js');
  const { Host } = await import('../src/models/Host.js');
  const { Payment } = await import('../src/models/Payment.js');
  const { createAccessToken } = await import('../src/middleware/auth.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server running on port ${TEST_PORT}.\n`);

  try {
    // 1. Setup Data
    let guest = await User.findOne({ email: 'rzp_guest@example.com' });
    if (!guest) {
      guest = await User.create({ name: 'RZP Guest', email: 'rzp_guest@example.com', authProvider: 'password', role: 'guest', isEmailVerified: true, isPhoneVerified: true, tokenVersion: 1 });
    }
    const guestToken = createAccessToken(guest._id.toString(), guest.role as any, guest.tokenVersion || 0);

    let host = await Host.findOne({ businessName: 'RZP Host' });
    if (!host) {
      host = await Host.create({ user: guest._id, businessName: 'RZP Host', verificationStatus: 'verified' });
    }

    let property = await Property.findOne({ slug: 'rzp-property' });
    if (!property) {
      property = await Property.create({ host: host._id, title: 'RZP Villa', description: 'Test villa description', slug: 'rzp-property', city: 'Goa', state: 'Goa', locality: 'Calangute', propertyType: 'villa', address: '1 Ocean Drive', location: { type: 'Point', coordinates: [73.76, 15.54] }, bedrooms: 2, bathrooms: 2, maxGuests: 4, pricePerNight: 1000, isVerified: true, verificationStatus: 'VERIFIED', isPublished: true });
    }

    let room = await Room.findOne({ property: property._id, name: 'RZP Suite' });
    if (!room) {
      room = await Room.create({ property: property._id, name: 'RZP Suite', roomType: 'private', capacity: 2, inventory: 5, pricePerNight: 1000, isActive: true });
    }

    // 2. Create Booking
    const checkInDate = new Date(); checkInDate.setDate(checkInDate.getDate() + 10);
    const checkOutDate = new Date(checkInDate); checkOutDate.setDate(checkOutDate.getDate() + 2);

    const bookingRes = await fetch(`${API_BASE}/properties/${property._id}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({ roomId: room._id.toString(), checkIn: checkInDate.toISOString().split('T')[0], checkOut: checkOutDate.toISOString().split('T')[0], guests: 2, roomCount: 1 })
    });
    const bookingBody: any = await bookingRes.json();
    if (!bookingBody.data?.booking) {
      throw new Error('Failed to create booking: ' + JSON.stringify(bookingBody));
    }
    const bookingId = bookingBody.data.booking._id;

    // 3. Init Razorpay Payment
    console.log('--- TEST 1: INITIALIZE RAZORPAY PAYMENT ---');
    const initRes = await fetch(`${API_BASE}/payments/razorpay-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({ bookingId })
    });
    const initBody: any = await initRes.json();
    if (!initRes.ok) throw new Error('Razorpay init failed: ' + JSON.stringify(initBody));
    
    const orderId = initBody.data.orderId;
    const amountPaise = initBody.data.amount;
    console.log(`Razorpay Order Created: ${orderId} for ₹${amountPaise / 100}`);

    // Verify Payment Record created
    let paymentRec = await Payment.findOne({ orderId });
    if (!paymentRec || paymentRec.status !== 'pending') throw new Error('Payment record not pending');
    console.log('PASS TEST 1: Payment initialized properly.\n');

    // 4. Test Webhook Signature Mismatch
    console.log('--- TEST 2: REJECT INVALID WEBHOOK SIGNATURE ---');
    const webhookPayload = {
      event: 'order.paid',
      payload: {
        order: { entity: { id: orderId, amount: amountPaise } },
        payment: { entity: { id: 'pay_test_123', amount: amountPaise, order_id: orderId } }
      }
    };
    
    const invalidSignatureRes = await fetch(`${API_BASE}/payments/razorpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': 'invalid_signature' },
      body: JSON.stringify(webhookPayload)
    });
    
    if (invalidSignatureRes.status !== 400) throw new Error('Expected 400 for invalid signature');
    console.log('PASS TEST 2: Rejected invalid signature.\n');

    // 5. Test Valid Webhook & Amount Mismatch Guard
    console.log('--- TEST 3: AMOUNT MISMATCH GUARD ---');
    const tamperedPayload = {
      event: 'order.paid',
      payload: {
        order: { entity: { id: orderId, amount: 100 } }, // tampered amount
        payment: { entity: { id: 'pay_test_123', amount: 100, order_id: orderId } }
      }
    };
    const tamperedBodyStr = JSON.stringify(tamperedPayload);
    const tamperedSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(tamperedBodyStr).digest('hex');
    
    const tamperedRes = await fetch(`${API_BASE}/payments/razorpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': tamperedSig },
      body: tamperedBodyStr
    });
    
    if (tamperedRes.status !== 400) throw new Error('Expected 400 for amount mismatch, got ' + tamperedRes.status);
    console.log('PASS TEST 3: Amount mismatch rejected securely.\n');

    // 6. Test Valid Webhook -> Confirmed Booking
    console.log('--- TEST 4: VALID WEBHOOK CONFIRMS BOOKING ---');
    const validBodyStr = JSON.stringify(webhookPayload);
    const validSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(validBodyStr).digest('hex');

    const webhookRes = await fetch(`${API_BASE}/payments/razorpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSig },
      body: validBodyStr
    });
    
    if (webhookRes.status !== 200) throw new Error('Webhook failed: ' + await webhookRes.text());
    
    paymentRec = await Payment.findOne({ orderId });
    if (paymentRec?.status !== 'captured') throw new Error('Payment not captured');
    
    let updatedBooking = await Booking.findById(bookingId);
    if (updatedBooking?.paymentStatus !== 'PAID' || updatedBooking?.status !== 'confirmed') {
      throw new Error('Booking not confirmed');
    }
    console.log('PASS TEST 4: Booking successfully confirmed via webhook.\n');

    // 7. Test Idempotency
    console.log('--- TEST 5: WEBHOOK IDEMPOTENCY ---');
    const dupRes = await fetch(`${API_BASE}/payments/razorpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSig },
      body: validBodyStr
    });
    
    const dupText = await dupRes.text();
    if (dupRes.status !== 200 || dupText !== 'Already processed') {
      throw new Error('Expected 200 Already processed, got: ' + dupText);
    }
    console.log('PASS TEST 5: Duplicate webhook handled safely.\n');

    console.log('=== ALL RAZORPAY WEBHOOK TESTS PASSED SUCCESSFULLY! ===\n');

  } finally {
    server.close();
    await mongoose.disconnect();
    nock.cleanAll();
  }
}

runRazorpayWebhookTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
