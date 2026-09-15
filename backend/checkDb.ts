import dotenv from 'dotenv';
dotenv.config({ path: 'd:/hopebed/hopabed.in/backend/.env' });

import mongoose from 'mongoose';
import { User } from './src/models/User.js';
import { Host } from './src/models/Host.js';
import { Property } from './src/models/Property.js';
import { Booking } from './src/models/Booking.js';
import { LeadListing } from './src/models/LeadListing.js';

async function checkDetails() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  await mongoose.connect(uri!, { dbName });

  console.log('--- ALL USERS ---');
  const users = await User.find();
  users.forEach(u => console.log(`${u._id} | ${u.name} | ${u.email} | ${u.role}`));

  console.log('\n--- ALL PROPERTIES ---');
  const properties = await Property.find();
  properties.forEach(p => console.log(`${p._id} | ${p.title} | ${p.city} | ${p.verificationStatus}`));

  console.log('\n--- ALL BOOKINGS ---');
  const bookings = await Booking.find();
  bookings.forEach(b => console.log(`${b._id} | ${b.status} | ${b.totalPrice}`));

  await mongoose.disconnect();
}

checkDetails().catch(console.error);
