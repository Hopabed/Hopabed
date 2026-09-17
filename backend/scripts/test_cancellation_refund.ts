import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_123456789012345678901234567890123';
process.env.RAZORPAY_KEY_ID = 'rzp_test_12345';
process.env.RAZORPAY_KEY_SECRET = 'rzp_test_secret_12345';

import mongoose from 'mongoose';
import nock from 'nock';

const TEST_PORT = 5010;
const API_BASE = `http://localhost:${TEST_PORT}/api`;

async function runCancellationRefundTests() {
  console.log('=== STARTING CANCELLATION & REFUND TEST ===\n');

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const { app } = await import('../src/index.js');
  const { Booking } = await import('../src/models/Booking.js');
  const { Payment } = await import('../src/models/Payment.js');
  const { Property } = await import('../src/models/Property.js');
  const { User } = await import('../src/models/User.js');
  const { Host } = await import('../src/models/Host.js');
  const { Room } = await import('../src/models/Room.js');
  const { createAccessToken } = await import('../src/middleware/auth.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server running on port ${TEST_PORT}.\n`);

  try {
    // 1. Setup Guest
    let guest = await User.findOne({ email: 'cancel_guest@example.com' });
    if (!guest) {
      guest = await User.create({ name: 'Cancel Guest', email: 'cancel_guest@example.com', authProvider: 'password', role: 'guest', isEmailVerified: true, tokenVersion: 1 });
    }
    const guestToken = createAccessToken(guest._id.toString(), 'guest', guest.tokenVersion || 0);

    // 2. Setup Host & Property
    let host = await Host.findOne({ businessName: 'Cancel Host' });
    if (!host) {
      host = await Host.create({ user: guest._id, businessName: 'Cancel Host', verificationStatus: 'verified', isActive: true });
    }

    let property = await Property.findOne({ slug: 'cancel-test-prop' });
    if (!property) {
      property = await Property.create({ host: host._id, title: 'Cancel Villa', slug: 'cancel-test-prop', description: 'Test villa description', propertyType: 'villa', city: 'Goa', state: 'Goa', locality: 'Anjuna', address: '1 Beach Road', location: { type: 'Point', coordinates: [73.76, 15.54] }, bedrooms: 2, bathrooms: 2, maxGuests: 4, pricePerNight: 5000, isVerified: true, verificationStatus: 'VERIFIED', isPublished: true });
    }

    let room = await Room.findOne({ property: property._id, name: 'Cancel Suite' });
    if (!room) {
      room = await Room.create({ property: property._id, name: 'Cancel Suite', roomType: 'private', capacity: 2, inventory: 5, pricePerNight: 5000, isActive: true });
    }

    // TEST 1: Cancel > 7 days prior (100% refund)
    console.log('--- TEST 1: CANCEL > 7 DAYS PRIOR (100% REFUND) ---');
    const checkInDate1 = new Date(); checkInDate1.setDate(checkInDate1.getDate() + 10);
    const checkOutDate1 = new Date(checkInDate1); checkOutDate1.setDate(checkOutDate1.getDate() + 2);

    let booking1 = await Booking.create({
      property: property._id,
      room: room._id,
      guest: guest._id,
      host: host._id,
      checkIn: checkInDate1,
      checkOut: checkOutDate1,
      guests: 2,
      nights: 2,
      roomCount: 1,
      pricePerNight: 5000,
      subtotal: 10000,
      serviceFee: 0,
      taxes: 0,
      totalAmount: 10000,
      currency: 'INR',
      status: 'confirmed',
      paymentStatus: 'PAID'
    });

    await Payment.create({
      booking: booking1._id,
      user: guest._id,
      amount: 10000,
      currency: 'INR',
      paymentGateway: 'razorpay',
      orderId: 'order_test_100',
      paymentId: 'pay_test_100',
      status: 'captured'
    });

    // Mock Razorpay API
    let rzpMock1 = nock('https://api.razorpay.com')
      .post('/v1/payments/pay_test_100/refund', body => {
        if (body.amount !== 1000000) return false; // 10000 INR = 1000000 paise (100%)
        return true;
      })
      .reply(200, { id: 'rfnd_test_100', status: 'processed', entity: 'refund', amount: 1000000 });

    const cancelRes1 = await fetch(`${API_BASE}/bookings/${booking1._id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
    });

    if (!cancelRes1.ok) throw new Error('Failed to cancel booking 1');
    if (!rzpMock1.isDone()) throw new Error('Razorpay Refund API was not called with correct 100% amount');
    
    let updatedBooking1 = await Booking.findById(booking1._id);
    if (updatedBooking1?.status !== 'cancelled' || updatedBooking1?.paymentStatus !== 'REFUNDED') throw new Error('Booking 1 status not updated');
    console.log('PASS TEST 1: Correctly calculated and processed 100% refund via Razorpay API.\n');


    // TEST 2: Cancel > 48 hours prior (50% refund)
    console.log('--- TEST 2: CANCEL > 48 HOURS PRIOR (50% REFUND) ---');
    const checkInDate2 = new Date(); checkInDate2.setDate(checkInDate2.getDate() + 3); // 3 days = 72 hours
    const checkOutDate2 = new Date(checkInDate2); checkOutDate2.setDate(checkOutDate2.getDate() + 2);

    let booking2 = await Booking.create({
      property: property._id,
      room: room._id,
      guest: guest._id,
      host: host._id,
      checkIn: checkInDate2,
      checkOut: checkOutDate2,
      guests: 2,
      nights: 2,
      roomCount: 1,
      pricePerNight: 5000,
      subtotal: 10000,
      serviceFee: 0,
      taxes: 0,
      totalAmount: 10000,
      currency: 'INR',
      status: 'confirmed',
      paymentStatus: 'PAID'
    });

    await Payment.create({
      booking: booking2._id,
      user: guest._id,
      amount: 10000,
      currency: 'INR',
      paymentGateway: 'razorpay',
      orderId: 'order_test_50',
      paymentId: 'pay_test_50',
      status: 'captured'
    });

    // Mock Razorpay API
    let rzpMock2 = nock('https://api.razorpay.com')
      .post('/v1/payments/pay_test_50/refund', body => {
        if (body.amount !== 500000) return false; // 5000 INR = 500000 paise (50%)
        return true;
      })
      .reply(200, { id: 'rfnd_test_50', status: 'processed', entity: 'refund', amount: 500000 });

    const cancelRes2 = await fetch(`${API_BASE}/bookings/${booking2._id}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
    });

    if (!cancelRes2.ok) throw new Error('Failed to cancel booking 2');
    if (!rzpMock2.isDone()) throw new Error('Razorpay Refund API was not called with correct 50% amount');
    console.log('PASS TEST 2: Correctly calculated and processed 50% refund via Razorpay API.\n');

    console.log('=== ALL CANCELLATION & REFUND TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runCancellationRefundTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
