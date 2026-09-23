import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

// Set test credentials early
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_123456789012345678901234567890123';

import mongoose from 'mongoose';
import nock from 'nock';

const TEST_PORT = 5020;
const API_BASE = `http://localhost:${TEST_PORT}/api`;

async function runLifecycleTests() {
  console.log('=== STARTING BOOKING LIFECYCLE E2E TEST ===\n');

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const { app } = await import('../src/index.js');
  const { Property } = await import('../src/models/Property.js');
  const { Room } = await import('../src/models/Room.js');
  const { User } = await import('../src/models/User.js');
  const { Host } = await import('../src/models/Host.js');
  const { Booking } = await import('../src/models/Booking.js');
  const { Payment } = await import('../src/models/Payment.js');
  const { createAccessToken } = await import('../src/middleware/auth.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server running on port ${TEST_PORT}.\n`);

  try {
    // --- 0. Setup Data ---
    let guest = await User.findOne({ email: 'lifecycle_guest@example.com' });
    if (!guest) {
      guest = await User.create({ name: 'Lifecycle Guest', email: 'lifecycle_guest@example.com', authProvider: 'password', role: 'guest', isEmailVerified: true, tokenVersion: 1 });
    }
    const guestToken = createAccessToken(guest._id.toString(), 'guest', guest.tokenVersion || 0);

    let hostUser = await User.findOne({ email: 'lifecycle_host@example.com' });
    if (!hostUser) {
      hostUser = await User.create({ name: 'Lifecycle Host User', email: 'lifecycle_host@example.com', authProvider: 'password', role: 'host', isEmailVerified: true, tokenVersion: 1 });
    }
    const hostToken = createAccessToken(hostUser._id.toString(), 'host', hostUser.tokenVersion || 0);

    let host = await Host.findOne({ businessName: 'Lifecycle Host' });
    if (!host) {
      host = await Host.create({ user: hostUser._id, businessName: 'Lifecycle Host', verificationStatus: 'verified', isActive: true });
    }

    let property = await Property.findOne({ slug: 'lifecycle-property' });
    if (!property) {
      property = await Property.create({ host: host._id, title: 'Lifecycle Villa', description: 'Test villa description', slug: 'lifecycle-property', city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra', propertyType: 'villa', address: '1 Ocean Drive', location: { type: 'Point', coordinates: [72.82, 19.05] }, bedrooms: 2, bathrooms: 2, maxGuests: 4, pricePerNight: 2000, isVerified: true, verificationStatus: 'VERIFIED', isPublished: true });
    }

    let room = await Room.findOne({ property: property._id, name: 'Lifecycle Suite' });
    if (!room) {
      room = await Room.create({ property: property._id, name: 'Lifecycle Suite', roomType: 'private', capacity: 2, inventory: 5, pricePerNight: 2000, isActive: true });
    }

    // --- 1. Directly Create CONFIRMED Booking ---
    console.log('--- TEST 1: SETUP CONFIRMED BOOKING ---');
    const checkInDate = new Date(); checkInDate.setDate(checkInDate.getDate() - 1); // Check-in was yesterday (valid for check-in today)
    const checkOutDate = new Date(checkInDate); checkOutDate.setDate(checkOutDate.getDate() + 2);

    let booking = await Booking.create({
      property: property._id,
      room: room._id,
      guest: guest._id,
      host: host._id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: 2,
      nights: 2,
      roomCount: 1,
      pricePerNight: 2000,
      subtotal: 4000,
      serviceFee: 0,
      taxes: 0,
      totalAmount: 4000,
      currency: 'INR',
      status: 'confirmed',
      paymentStatus: 'PAID'
    });

    await Payment.create({
      booking: booking._id,
      user: guest._id,
      amount: 4000,
      currency: 'INR',
      paymentGateway: 'razorpay',
      orderId: 'order_test_lc_123',
      paymentId: 'pay_test_lc_123',
      status: 'captured'
    });

    console.log(`Booking ${booking._id} created with status 'confirmed' and 'PAID'.\n`);

    // --- 2. HOST VERIFY QR (CHECK-IN) ---
    console.log('--- TEST 2: CHECK_IN ---');
    const checkInRes = await fetch(`${API_BASE}/hosts/verify-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hostToken}` },
      body: JSON.stringify({ bookingId: booking._id.toString() })
    });
    
    let checkInBody: any = await checkInRes.json();
    if (!checkInRes.ok) throw new Error('Check-in failed: ' + JSON.stringify(checkInBody));
    
    // Check DB
    booking = await Booking.findById(booking._id) as any;
    if (booking.status !== 'checked_in') throw new Error(`Expected checked_in, got ${booking.status}`);
    console.log('PASS TEST 2: Booking successfully transitioned to CHECKED_IN.\n');

    // --- 3. TEST INVALID STATE TRANSITION (CANCELLED -> CHECK_IN) ---
    console.log('--- TEST 3: INVALID CHECK_IN OF CANCELLED BOOKING ---');
    let cancelledBooking = await Booking.create({
      property: property._id, room: room._id, guest: guest._id, host: host._id,
      checkIn: checkInDate, checkOut: checkOutDate, guests: 2, nights: 2, roomCount: 1, pricePerNight: 2000,
      subtotal: 4000, serviceFee: 0, taxes: 0, totalAmount: 4000, currency: 'INR',
      status: 'cancelled', paymentStatus: 'REFUNDED'
    });

    const invalidCheckInRes = await fetch(`${API_BASE}/hosts/verify-pass`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hostToken}` },
      body: JSON.stringify({ bookingId: cancelledBooking._id.toString() })
    });
    
    if (invalidCheckInRes.ok) throw new Error('System allowed check-in for a cancelled booking!');
    console.log('PASS TEST 3: System correctly rejected check-in for cancelled booking.\n');

    // --- 4. CHECK_OUT ---
    console.log('--- TEST 4: CHECK_OUT ---');
    const checkOutRes = await fetch(`${API_BASE}/hosts/bookings/${booking._id}/check-out`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${hostToken}` }
    });
    
    let checkOutBody: any = await checkOutRes.json();
    if (!checkOutRes.ok) throw new Error('Check-out failed: ' + JSON.stringify(checkOutBody));
    
    // Check DB
    booking = await Booking.findById(booking._id) as any;
    if (booking.status !== 'completed') throw new Error(`Expected completed, got ${booking.status}`);
    console.log('PASS TEST 4: Booking successfully transitioned directly to COMPLETED.\n');

    console.log('=== ALL LIFECYCLE TESTS PASSED SUCCESSFULLY! ===\n');

  } finally {
    server.close();
    await mongoose.disconnect();
    nock.cleanAll();
  }
}

runLifecycleTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
