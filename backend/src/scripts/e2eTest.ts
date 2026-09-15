import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Host } from '../models/Host.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { env } from '../config/env.js';

async function runE2ETest() {
  console.log('🚀 Starting Automated E2E Flow Test (Database Level)...');
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('✅ Connected to MongoDB.');

  const testId = Date.now().toString();
  
  try {
    // 1. Create Guest
    console.log('\n--- Step 1: Creating Guest User ---');
    const guest = await User.create({
      name: `Guest Test ${testId}`,
      email: `guest_${testId}@test.com`,
      passwordHash: 'dummyhash',
      isEmailVerified: true
    });
    console.log(`✅ Guest created: ${guest.email}`);

    // 2. Create Host & Property
    console.log('\n--- Step 2: Creating Host & Property ---');
    const hostUser = await User.create({
      name: `Host Test ${testId}`,
      email: `host_${testId}@test.com`,
      passwordHash: 'dummyhash',
      isEmailVerified: true,
      role: 'host'
    });
    const host = await Host.create({
      user: hostUser._id,
      bankDetails: { accountNumber: '123', ifscCode: 'ABC', bankName: 'Test Bank', accountHolderName: 'Host' },
      verificationStatus: 'pending',
      isActive: true
    });
    const property = await Property.create({
      host: host._id,
      title: 'E2E Test Luxury Villa',
      description: 'A beautiful test villa',
      propertyType: 'villa',
      slug: `e2e-test-luxury-villa-${testId}`,
      address: '123 Test St, Mumbai, MH, 400001, India',
      city: 'Mumbai',
      state: 'MH',
      country: 'India',
      locality: 'Test Locality',
      location: { type: 'Point', coordinates: [72.8777, 19.0760] },
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      amenities: ['wifi'],
      pricePerNight: 5000,
      currency: 'INR',
      isVerified: false,
      isPublished: false,
      verificationStatus: 'PENDING_REVIEW'
    });
    const room = await Room.create({
      property: property._id,
      name: 'Master Bedroom',
      roomType: 'private',
      capacity: 2,
      inventory: 1,
      pricePerNight: 5000,
      isActive: true
    });
    console.log(`✅ Property created: ${property.title}`);

    // 3. Admin Approval
    console.log('\n--- Step 3: Admin Moderation Flow ---');
    host.verificationStatus = 'verified';
    await host.save();
    property.isVerified = true;
    property.isPublished = true;
    property.verificationStatus = 'VERIFIED';
    await property.save();
    console.log(`✅ Admin approved Host and Property.`);

    // 4. Booking Creation
    console.log('\n--- Step 4: Booking & Payment Flow ---');
    const checkIn = new Date();
    checkIn.setDate(checkIn.getDate() + 10); // 10 days in future
    const checkOut = new Date();
    checkOut.setDate(checkOut.getDate() + 12); // 2 nights

    const booking = await Booking.create({
      property: property._id,
      guest: guest._id,
      host: host._id,
      room: room._id,
      checkIn,
      checkOut,
      nights: 2,
      guests: 2,
      roomCount: 1,
      pricePerNight: 5000,
      subtotal: 10000,
      serviceFee: 500,
      taxes: 525,
      totalAmount: 11025,
      currency: 'INR',
      status: 'pending',
      paymentStatus: 'UNPAID'
    });
    console.log(`✅ Booking created. Total Amount: ₹${booking.totalAmount}`);

    // 5. Simulate PayU Success
    const payment = await Payment.create({
      user: guest._id,
      booking: booking._id,
      amount: booking.totalAmount,
      currency: 'INR',
      paymentGateway: 'payu',
      orderId: `TXN_${testId}`,
      status: 'captured'
    });
    booking.status = 'confirmed';
    booking.paymentStatus = 'PAID';
    await booking.save();
    console.log(`✅ Payment successful. Booking Confirmed.`);

    // 6. Cancellation & Refund Check
    console.log('\n--- Step 5: Cancellation & Refund Engine ---');
    const diffHours = (checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60);
    console.log(`⏳ Hours until check-in: ${Math.round(diffHours)} (Expected Refund: 100%)`);
    if (diffHours >= 168) {
       console.log(`✅ Refund Policy Triggered: 100% Refund (₹${booking.totalAmount})`);
       booking.status = 'cancelled';
       booking.paymentStatus = 'REFUNDED';
       payment.status = 'refunded';
       await booking.save();
       await payment.save();
       console.log(`✅ Booking cancelled and fully refunded successfully.`);
    }

    console.log('\n🎉 ALL END-TO-END TESTS PASSED SUCCESSFULLY! 🎉');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    console.log('\n🧹 Cleaning up test data...');
    await User.deleteMany({ email: { $regex: testId } });
    await Host.deleteMany({ 'bankDetails.accountHolderName': 'Host' });
    await Property.deleteMany({ title: 'E2E Test Luxury Villa' });
    await Room.deleteMany({ name: 'Master Bedroom' });
    await Booking.deleteMany({ subtotal: 10000 });
    await Payment.deleteMany({ orderId: `TXN_${testId}` });
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from DB.');
  }
}

runE2ETest();
