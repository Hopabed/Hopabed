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

const TEST_PORT = 5012;
const API_BASE = `http://localhost:${TEST_PORT}/api`;

// Mock Razorpay SDK to avoid actual API calls
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

async function runE2ETests() {
  console.log('=== STARTING CUSTOMER BOOKING E2E TEST ===\n');

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
  const { createAccessToken } = await import('../src/middleware/auth.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server running on port ${TEST_PORT}.\n`);

  try {
    // --- 0. Setup Data ---
    let guest = await User.findOne({ email: 'e2e_guest@example.com' });
    if (!guest) {
      guest = await User.create({ name: 'E2E Guest', email: 'e2e_guest@example.com', authProvider: 'password', role: 'guest', isEmailVerified: true, tokenVersion: 1 });
    }
    const guestToken = createAccessToken(guest._id.toString(), 'guest', guest.tokenVersion || 0);

    let host = await Host.findOne({ businessName: 'E2E Host' });
    if (!host) {
      host = await Host.create({ user: guest._id, businessName: 'E2E Host', verificationStatus: 'verified' });
    }

    let property = await Property.findOne({ slug: 'e2e-property' });
    if (!property) {
      property = await Property.create({ host: host._id, title: 'E2E Villa', description: 'Test villa description', slug: 'e2e-property', city: 'Mumbai', state: 'Maharashtra', locality: 'Bandra', propertyType: 'villa', address: '1 Ocean Drive', location: { type: 'Point', coordinates: [72.82, 19.05] }, bedrooms: 2, bathrooms: 2, maxGuests: 4, pricePerNight: 1000, isVerified: true, verificationStatus: 'VERIFIED', isPublished: true });
    }

    let room = await Room.findOne({ property: property._id, name: 'E2E Suite' });
    if (!room) {
      room = await Room.create({ property: property._id, name: 'E2E Suite', roomType: 'private', capacity: 2, inventory: 5, pricePerNight: 1000, isActive: true });
    }

    // --- 1. Search Properties ---
    console.log('--- TEST 1: SEARCH PROPERTIES ---');
    const searchRes = await fetch(`${API_BASE}/properties/search?city=Mumbai`);
    if (!searchRes.ok) throw new Error('Search failed');
    const searchBody: any = await searchRes.json();
    const foundProp = searchBody.data?.properties?.find((p: any) => p.title === 'E2E Villa');
    if (!foundProp) throw new Error('E2E Villa not found in search results');
    console.log(`Found property: ${foundProp.title}`);
    console.log('PASS TEST 1: Property Search.\n');

    // --- 2. Get Rooms ---
    console.log('--- TEST 2: GET ROOMS ---');
    const propertyRes = await fetch(`${API_BASE}/properties/${property._id}`);
    if (!propertyRes.ok) throw new Error('Get property failed');
    const propertyBody: any = await propertyRes.json();
    const foundRoom = propertyBody.data?.rooms?.find((r: any) => r.name === 'E2E Suite');
    if (!foundRoom) throw new Error('E2E Suite not found in property rooms');
    console.log(`Found room: ${foundRoom.name} at ₹${foundRoom.pricePerNight}/night`);
    console.log('PASS TEST 2: Room Selection.\n');

    // --- 3. Create Booking ---
    console.log('--- TEST 3: CREATE BOOKING ---');
    const checkInDate = new Date(); checkInDate.setDate(checkInDate.getDate() + 10);
    const checkOutDate = new Date(checkInDate); checkOutDate.setDate(checkOutDate.getDate() + 2);

    const bookingRes = await fetch(`${API_BASE}/properties/${property._id}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({ roomId: room._id.toString(), checkIn: checkInDate.toISOString().split('T')[0], checkOut: checkOutDate.toISOString().split('T')[0], guests: 2, roomCount: 1 })
    });
    const bookingBody: any = await bookingRes.json();
    if (!bookingBody.data?.booking) throw new Error('Failed to create booking: ' + JSON.stringify(bookingBody));
    
    const bookingId = bookingBody.data.booking._id;
    console.log(`Booking created: ${bookingId}, Status: ${bookingBody.data.booking.status}`);
    console.log('PASS TEST 3: Booking Created.\n');

    // --- 4. Razorpay Init ---
    console.log('--- TEST 4: RAZORPAY INIT ---');
    const initRes = await fetch(`${API_BASE}/payments/razorpay-init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${guestToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({ bookingId })
    });
    const initBody: any = await initRes.json();
    if (!initRes.ok) throw new Error('Razorpay init failed: ' + JSON.stringify(initBody));
    
    const orderId = initBody.data.orderId;
    const amountPaise = initBody.data.amount;
    console.log(`Razorpay Order initialized: ${orderId} for ₹${amountPaise / 100}`);
    console.log('PASS TEST 4: Razorpay Init.\n');

    // --- 5. Razorpay Webhook (Confirmation) ---
    console.log('--- TEST 5: RAZORPAY WEBHOOK (CONFIRMATION) ---');
    const webhookPayload = {
      event: 'order.paid',
      payload: {
        order: { entity: { id: orderId, amount: amountPaise } },
        payment: { entity: { id: 'pay_test_e2e_123', amount: amountPaise, order_id: orderId } }
      }
    };
    const validBodyStr = JSON.stringify(webhookPayload);
    const validSig = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(validBodyStr).digest('hex');

    const webhookRes = await fetch(`${API_BASE}/payments/razorpay-webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-razorpay-signature': validSig },
      body: validBodyStr
    });
    if (webhookRes.status !== 200) throw new Error('Webhook failed: ' + await webhookRes.text());
    console.log('PASS TEST 5: Webhook processed successfully.\n');

    // --- 6. Stay Pass Generation (Verify) ---
    console.log('--- TEST 6: VERIFY STAY PASS ---');
    const passRes = await fetch(`${API_BASE}/bookings/${bookingId}/verify-pass`);
    const passBody: any = await passRes.json();
    
    if (!passRes.ok || !passBody.data?.booking) throw new Error('Failed to get stay pass');
    
    const pass = passBody.data.booking;
    if (pass.status !== 'confirmed' || pass.paymentStatus !== 'PAID') {
      throw new Error(`Pass validation failed. Status: ${pass.status}, PaymentStatus: ${pass.paymentStatus}`);
    }
    
    console.log(`Stay Pass Verified!`);
    console.log(`- Guest: ${pass.guestName}`);
    console.log(`- Property: ${pass.propertyTitle}`);
    console.log(`- Status: ${pass.status}`);
    console.log(`- Payment: ${pass.paymentStatus}`);
    console.log('PASS TEST 6: Stay Pass Generated & Verified.\n');

    console.log('=== ALL E2E CUSTOMER BOOKING TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    server.close();
    await mongoose.disconnect();
    nock.cleanAll();
  }
}

runE2ETests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
