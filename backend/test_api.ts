import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import http from 'http';
import { env } from './src/config/env.js';

async function testApi() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  
  // Find an admin user
  const adminUser = await mongoose.connection.collection('users').findOne({ role: 'admin' });
  if (!adminUser) {
    console.log('No admin user found!');
    process.exit(1);
  }

  const payload = {
    sub: adminUser._id.toString(),
    role: adminUser.role,
    tokenVersion: adminUser.tokenVersion
  };

  const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1d' });
  console.log('Generated token for admin:', adminUser.email);

  // Call the search API
  const response = await fetch('http://localhost:4000/api/admin/leads/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ city: 'Pune', category: 'all' })
  });

  const data = await response.json();
  console.log('Search Status:', response.status);
  console.log('Search Response:', JSON.stringify(data, null, 2));

  if (data.data?.leads?.length > 0) {
    const lead = data.data.leads[0];
    console.log('Testing Outreach Email for Lead:', lead.title);
    
    const inviteResponse = await fetch('http://localhost:4000/api/admin/leads/import-and-invite', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ leadId: lead._id, ownerEmail: 'test@example.com' })
    });
    
    const inviteData = await inviteResponse.json();
    console.log('Invite Status:', inviteResponse.status);
    console.log('Invite Response:', JSON.stringify(inviteData, null, 2));
  }

  process.exit(0);
}

testApi().catch(console.error);
