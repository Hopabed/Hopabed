import mongoose from 'mongoose';
import { env } from '../config/env.js';

async function checkDb() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('Connected to MongoDB:', env.MONGODB_DB_NAME);

  const bookings = await mongoose.connection.collection('bookings').find({}).toArray();
  console.log('\n--- BOOKINGS IN DB --- Count:', bookings.length);
  bookings.forEach((b: any) => {
    console.log({
      id: b._id,
      guest: b.guest,
      propertyTitle: b.propertyTitle || b.title,
      status: b.status,
      paymentStatus: b.paymentStatus,
      totalAmount: b.totalAmount
    });
  });

  const properties = await mongoose.connection.collection('properties').find({}).toArray();
  console.log('\n--- PROPERTIES IN DB --- Count:', properties.length);
  properties.forEach((p: any) => {
    console.log({
      id: p._id,
      title: p.title,
      city: p.city,
      isVerified: p.isVerified,
      verificationStatus: p.verificationStatus
    });
  });

  await mongoose.disconnect();
}

checkDb().catch(console.error);
