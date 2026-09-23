import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';

// Import all models to ensure schemas are registered
import '../models/User.js';
import '../models/Host.js';
import '../models/Property.js';
import '../models/Room.js';
import '../models/Booking.js';
import '../models/Payment.js';
import '../models/PropertyAvailability.js';

async function setupIndexes() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    
    console.log('Applying indexes...');
    
    const models = mongoose.models;
    for (const modelName in models) {
      if (Object.prototype.hasOwnProperty.call(models, modelName)) {
        const model = models[modelName];
        console.log(`Creating indexes for ${modelName}...`);
        // syncIndexes will drop indexes that don't exist in the schema and create new ones
        await model.syncIndexes();
      }
    }
    
    console.log('Index setup completed successfully.');
  } catch (error) {
    console.error('Error setting up indexes:', error);
    process.exit(1);
  } finally {
    await disconnectDatabase();
    process.exit(0);
  }
}

if (require.main === module) {
  setupIndexes();
}

export default setupIndexes;
