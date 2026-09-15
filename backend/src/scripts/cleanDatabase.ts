import dotenv from 'dotenv';
dotenv.config({ path: 'd:/hopebed/hopabed.in/backend/.env' });

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Host } from '../models/Host.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { PropertyAvailability } from '../models/PropertyAvailability.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { OwnerVerification } from '../models/OwnerVerification.js';
import { PropertyVerification } from '../models/PropertyVerification.js';
import { PropertyVerificationDocument } from '../models/PropertyVerificationDocument.js';
import { AuditLog } from '../models/AuditLog.js';
import { LeadListing } from '../models/LeadListing.js';

async function cleanDatabase() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME;
  
  if (!uri) throw new Error('MONGODB_URI is not defined');
  
  console.log(`Connecting to database: ${dbName}...`);
  await mongoose.connect(uri, { dbName });

  console.log('Cleaning test / fake database collections...');

  // Delete all users EXCEPT mithagaris@gmail.com
  const userDeleteResult = await User.deleteMany({ email: { $ne: 'mithagaris@gmail.com' } });
  console.log(`Deleted ${userDeleteResult.deletedCount} test/fake users.`);

  // Ensure mithagaris@gmail.com exists and is admin
  const adminUser = await User.findOneAndUpdate(
    { email: 'mithagaris@gmail.com' },
    {
      name: 'Shaharukh Mithagari',
      email: 'mithagaris@gmail.com',
      role: 'admin',
      isEmailVerified: true,
      authProvider: 'google',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log(`Preserved Admin User: ${adminUser.name} <${adminUser.email}> (Role: ${adminUser.role})`);

  // Delete all hosts not associated with adminUser
  const hostDeleteResult = await Host.deleteMany({ user: { $ne: adminUser._id } });
  console.log(`Deleted ${hostDeleteResult.deletedCount} test/fake hosts.`);

  // Clear properties, rooms, availability, bookings, verifications, audit logs
  const propRes = await Property.deleteMany({});
  console.log(`Deleted ${propRes.deletedCount} test/fake properties.`);

  const roomRes = await Room.deleteMany({});
  console.log(`Deleted ${roomRes.deletedCount} test/fake rooms.`);

  const availRes = await PropertyAvailability.deleteMany({});
  console.log(`Deleted ${availRes.deletedCount} test/fake room availabilities.`);

  const bookRes = await Booking.deleteMany({});
  console.log(`Deleted ${bookRes.deletedCount} test/fake bookings.`);

  const payRes = await Payment.deleteMany({});
  console.log(`Deleted ${payRes.deletedCount} test/fake payment transactions.`);

  const ownerVerifRes = await OwnerVerification.deleteMany({});
  console.log(`Deleted ${ownerVerifRes.deletedCount} owner verifications.`);

  const propVerifRes = await PropertyVerification.deleteMany({});
  console.log(`Deleted ${propVerifRes.deletedCount} property verifications.`);

  const docRes = await PropertyVerificationDocument.deleteMany({});
  console.log(`Deleted ${docRes.deletedCount} property verification documents.`);

  const auditRes = await AuditLog.deleteMany({});
  console.log(`Deleted ${auditRes.deletedCount} audit logs.`);

  const leadRes = await LeadListing.deleteMany({});
  console.log(`Deleted ${leadRes.deletedCount} lead listings.`);

  console.log('\n--- FINAL MONGO DB STATS ---');
  console.log({
    users: await User.countDocuments(),
    hosts: await Host.countDocuments(),
    properties: await Property.countDocuments(),
    bookings: await Booking.countDocuments(),
    leads: await LeadListing.countDocuments(),
  });

  await mongoose.disconnect();
  console.log('Database cleanup completed successfully.');
}

cleanDatabase().catch((err) => {
  console.error('Database cleanup failed:', err);
  process.exit(1);
});
