import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), 'backend/.env') });
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.join(process.cwd(), '.env') });
}

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_jwt_secret_123456789012345678901234567890123';

import mongoose from 'mongoose';

const TEST_PORT = 5009;
const API_BASE = `http://localhost:${TEST_PORT}/api`;

async function runAdminVerificationTest() {
  console.log('=== STARTING ADMIN PROPERTY VERIFICATION TEST ===\n');

  if (!process.env.MONGODB_URI) {
    console.error('Missing MONGODB_URI');
    process.exit(1);
  }

  const { app } = await import('../src/index.js');
  const { Property } = await import('../src/models/Property.js');
  const { User } = await import('../src/models/User.js');
  const { Host } = await import('../src/models/Host.js');
  const { createAccessToken } = await import('../src/middleware/auth.js');

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB.');

  const server = app.listen(TEST_PORT);
  console.log(`Test server running on port ${TEST_PORT}.\n`);

  try {
    // 1. Setup Admin User
    let admin = await User.findOne({ email: 'admin_test@example.com' });
    if (!admin) {
      admin = await User.create({ name: 'Super Admin', email: 'admin_test@example.com', authProvider: 'password', role: 'admin', isEmailVerified: true, tokenVersion: 1 });
    }
    const adminToken = createAccessToken(admin._id.toString(), 'admin', admin.tokenVersion || 0);

    // 2. Setup Host and Property
    let hostUser = await User.findOne({ email: 'host_verif_test@example.com' });
    if (!hostUser) {
      hostUser = await User.create({ name: 'Test Host', email: 'host_verif_test@example.com', authProvider: 'password', role: 'host', isEmailVerified: true, tokenVersion: 1 });
    }
    
    let host = await Host.findOne({ user: hostUser._id });
    if (!host) {
      // The host MUST be verified for the property to be published
      host = await Host.create({ user: hostUser._id, businessName: 'Test Host Business', verificationStatus: 'verified', isActive: true });
    }

    let property = await Property.findOne({ slug: 'admin-verif-test-prop' });
    if (!property) {
      property = await Property.create({ host: host._id, title: 'Admin Verif Villa', description: 'Test', slug: 'admin-verif-test-prop', city: 'Goa', state: 'Goa', locality: 'Anjuna', propertyType: 'villa', address: '1 Beach Road', location: { type: 'Point', coordinates: [73.76, 15.54] }, bedrooms: 2, bathrooms: 2, maxGuests: 4, pricePerNight: 2000, isVerified: false, verificationStatus: 'PENDING_REVIEW', isPublished: false });
    } else {
      // Reset property state
      property.verificationStatus = 'PENDING_REVIEW';
      property.isVerified = false;
      property.isPublished = false;
      await property.save();
    }

    console.log('--- TEST 1: ADMIN REJECTS PROPERTY ---');
    const rejectRes = await fetch(`${API_BASE}/admin/verifications/properties/${property._id}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({ reason: 'Photos are blurry.' })
    });
    
    if (rejectRes.status !== 200) throw new Error('Failed to reject property: ' + await rejectRes.text());
    let updatedProp = await Property.findById(property._id);
    if (updatedProp?.verificationStatus !== 'REJECTED' || updatedProp?.rejectionReason !== 'Photos are blurry.') {
      throw new Error('Property was not rejected correctly.');
    }
    console.log('PASS TEST 1: Admin successfully rejected property with reason.\n');

    console.log('--- TEST 2: ADMIN APPROVES AND PUBLISHES PROPERTY ---');
    const approveRes = await fetch(`${API_BASE}/admin/verifications/properties/${property._id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}`, 'x-client-type': 'mobile' },
      body: JSON.stringify({})
    });
    
    if (approveRes.status !== 200) throw new Error('Failed to approve property: ' + await approveRes.text());
    updatedProp = await Property.findById(property._id);
    
    if (updatedProp?.verificationStatus !== 'VERIFIED' || updatedProp?.isVerified !== true || updatedProp?.isPublished !== true) {
      throw new Error('Property was not approved and published correctly.');
    }
    console.log('PASS TEST 2: Admin successfully verified and published property.\n');

    console.log('=== ALL ADMIN PROPERTY VERIFICATION TESTS PASSED SUCCESSFULLY! ===\n');
  } finally {
    server.close();
    await mongoose.disconnect();
  }
}

runAdminVerificationTest().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
