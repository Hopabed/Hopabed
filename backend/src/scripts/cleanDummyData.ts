import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function cleanData() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('Connected to MongoDB:', env.MONGODB_DB_NAME);

  // Delete all test/fake bookings
  const deletedBookings = await mongoose.connection.collection('bookings').deleteMany({
    $or: [
      { propertyTitle: { $regex: /razorpay|test|fake|urban|himalayan/i } },
      { notes: { $regex: /TASK2|TEST/i } }
    ]
  });
  console.log(`Deleted ${deletedBookings.deletedCount} dummy bookings from MongoDB.`);

  await mongoose.disconnect();
}

cleanData().catch(console.error);
