import mongoose from 'mongoose';
import { env } from './src/config/env.js';

async function testConnection() {
  console.log('Connecting to MongoDB...');
  try {
    await mongoose.connect(env.MONGODB_URI, { 
      dbName: env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000 
    });
    console.log('Successfully connected to MongoDB');
    process.exit(0);
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}
testConnection();
