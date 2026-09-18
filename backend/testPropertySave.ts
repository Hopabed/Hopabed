import mongoose from 'mongoose';
import { Property } from './src/models/Property.js';

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/hopebed');
  
  try {
    const prop = new Property({
      host: new mongoose.Types.ObjectId(),
      title: 'demo',
      slug: 'demo-' + Date.now(),
      propertyType: 'hotel',
      contactPhone: '123456789',
      ownerInfo: {
        fullName: '',
        phone: '',
        email: '',
        whatsapp: '',
        relationship: 'owner',
        businessName: '',
        pan: '',
        gstin: ''
      }
    });

    await prop.validate();
    console.log("Validation passed!");
  } catch (err: any) {
    console.error("Validation failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
