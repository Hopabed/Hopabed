import mongoose from 'mongoose';
import { env } from './src/config/env.js';

async function createFakeBooking() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  
  // Find the user
  const user = await mongoose.connection.collection('users').findOne({ email: 'mithagaris@gmail.com' });
  if (!user) {
    console.log('User mithagaris@gmail.com not found!');
    process.exit(1);
  }

  // Delete any previous fake bookings
  await mongoose.connection.collection('bookings').deleteMany({ propertyTitle: "Razorpay Test Stay" });

  // Create 3 pending bookings
  const bookings = [];
  for (let i = 1; i <= 3; i++) {
    bookings.push({
      _id: new mongoose.Types.ObjectId(),
      guest: user._id,
      propertyId: new mongoose.Types.ObjectId(),
      propertyTitle: `Razorpay Test Stay ${i}`,
      checkIn: new Date(Date.now() + 86400000 * i),
      checkOut: new Date(Date.now() + 86400000 * (i + 3)),
      status: 'pending',
      totalAmount: 100 * i, // Different amounts: 100, 200, 300
      paymentStatus: 'UNPAID',
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  await mongoose.connection.collection('bookings').insertMany(bookings);
  console.log('Successfully created 3 PENDING bookings for testing Razorpay!');
  
  process.exit(0);
}

createFakeBooking().catch(console.error);
