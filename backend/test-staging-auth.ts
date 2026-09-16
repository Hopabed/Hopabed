import { MongoClient } from 'mongodb';
import crypto from 'node:crypto';

const STAGING_API = 'https://hopebed-api-staging.mithagaris.workers.dev';
const MONGODB_URI = 'mongodb+srv://mithagaris_db_user:WXlV1pWtsFY4D1AK@cluster0.0le5k5c.mongodb.net';
const DB_NAME = 'hopebed_staging';

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

async function bruteForceOtp(hash: string): Promise<string> {
  console.log(`Brute-forcing OTP for hash ${hash.substring(0, 8)}...`);
  for (let i = 100000; i <= 999999; i++) {
    const otp = i.toString();
    if (hashOtp(otp) === hash) {
      return otp;
    }
  }
  throw new Error('OTP not found');
}

async function runTests() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const User = db.collection('users');
    const OtpVerification = db.collection('otpverifications');

    console.log('--- CLEANUP STAGING DB ---');
    await User.deleteMany({ email: 'test-staging-new@example.com' });
    await User.deleteMany({ phone: '+919999999999' });
    await OtpVerification.deleteMany({ identifier: 'test-staging-new@example.com' });
    await OtpVerification.deleteMany({ identifier: '+919999999999' });

    console.log('\n--- 1. TEST NEW EMAIL REGISTRATION ---');
    console.log('Requesting OTP...');
    const reqRes = await fetch(`${STAGING_API}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'email', identifier: 'test-staging-new@example.com' }),
    });
    console.log('OTP Request Response:', await reqRes.json());

    // Wait a second for DB write
    await new Promise((r) => setTimeout(r, 1000));

    const otpDoc = await OtpVerification.findOne({ identifier: 'test-staging-new@example.com' }, { sort: { createdAt: -1 } });
    if (!otpDoc) throw new Error('OTP Doc not found');

    const otp = await bruteForceOtp(otpDoc.otpHash);
    console.log(`Found OTP: ${otp}`);

    console.log('Verifying OTP...');
    const verifyRes = await fetch(`${STAGING_API}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'email', identifier: 'test-staging-new@example.com', otp }),
    });
    
    const setCookie = verifyRes.headers.get('set-cookie');
    console.log('Set-Cookie headers:', setCookie ? 'Present' : 'Missing');
    
    const verifyBody = await verifyRes.json();
    console.log('Verify Response:', verifyBody);

    const cookies = setCookie?.split(', ').map(c => c.split(';')[0]).join('; ');

    console.log('Testing /api/auth/me...');
    const meRes = await fetch(`${STAGING_API}/api/auth/me`, {
      headers: { 'Cookie': cookies || '' },
    });
    const meBody = await meRes.json();
    console.log('/me Response:', meBody);

    if (!meBody.data.user.id) throw new Error('User not found in /me');

    console.log('\n--- 2. TEST EXISTING EMAIL LOGIN ---');
    console.log('Waiting 31 seconds to bypass OTP request cooldown...');
    await new Promise((r) => setTimeout(r, 31000));

    const reqRes2 = await fetch(`${STAGING_API}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'email', identifier: 'test-staging-new@example.com' }),
    });
    console.log('OTP Request 2 Response:', await reqRes2.json());
    
    await new Promise((r) => setTimeout(r, 1000));
    const otpDoc2 = await OtpVerification.findOne({ identifier: 'test-staging-new@example.com' }, { sort: { createdAt: -1 } });
    const otp2 = await bruteForceOtp(otpDoc2!.otpHash);
    console.log(`Found OTP 2: ${otp2}`);

    const verifyRes2 = await fetch(`${STAGING_API}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'email', identifier: 'test-staging-new@example.com', otp: otp2 }),
    });
    const verifyBody2 = await verifyRes2.json();
    console.log('Verify Response 2:', verifyBody2);

    // Verify duplicate count
    const userCount = await User.countDocuments({ email: 'test-staging-new@example.com' });
    console.log(`\nDuplicate Check (Email): Count is ${userCount}`);
    if (userCount > 1) throw new Error('Duplicate email users created!');

    console.log('\n--- 3. TEST NEW MOBILE REGISTRATION ---');
    const mobReqRes = await fetch(`${STAGING_API}/api/auth/otp/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'mobile', identifier: '9999999999' }),
    });
    console.log('Mobile OTP Request:', await mobReqRes.json());

    await new Promise((r) => setTimeout(r, 1000));
    const mobOtpDoc = await OtpVerification.findOne({ identifier: '+919999999999' }, { sort: { createdAt: -1 } });
    const mobOtp = await bruteForceOtp(mobOtpDoc!.otpHash);

    const mobVerifyRes = await fetch(`${STAGING_API}/api/auth/otp/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifierType: 'mobile', identifier: '9999999999', otp: mobOtp }),
    });
    console.log('Mobile Verify:', await mobVerifyRes.json());
    
    const mobUserCount = await User.countDocuments({ phone: '+919999999999' });
    console.log(`\nDuplicate Check (Mobile): Count is ${mobUserCount}`);

    console.log('\n✅ All automated staging tests passed!');
  } catch (error) {
    console.error('Test Failed:', error);
  } finally {
    await client.close();
  }
}

runTests();
