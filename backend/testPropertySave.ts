import mongoose from 'mongoose';
import { connectDatabase } from './src/config/database.js';
import { Property } from './src/models/Property.js';

async function run() {
  await connectDatabase();
  
  try {
    const prop = new Property({
      host: new mongoose.Types.ObjectId(),
      title: 'demo draft test',
      slug: 'demo-draft-test-' + Date.now(),
      propertyType: 'hotel',
      contactPhone: '8879892250',
      contactEmail: 'test@hopebed.in',
      location: {
        type: 'Point',
        coordinates: [73.0022, 19.0759]
      }
    });

    await prop.save();
    console.log("Draft Property Saved Successfully into MongoDB!", prop._id);
    await Property.findByIdAndDelete(prop._id);
  } catch (err: any) {
    console.error("Save failed:", err.message);
  } finally {
    await mongoose.disconnect();
  }
}

run();
