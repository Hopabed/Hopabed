import mongoose from 'mongoose';
import crypto from 'node:crypto';
import { env } from './src/config/env.js';
import { LeadListing } from './src/models/LeadListing.js';

function fetchMockGooglePlaces(city: string, category: string) {
  const normCity = city.trim();
  const c = normCity.charAt(0).toUpperCase() + normCity.slice(1).toLowerCase();
  
  return [
    {
      placeId: `mock_gp_1_${c.toLowerCase()}`,
      title: `Grand Heritage ${c}`,
      propertyType: 'hotel',
      city: c,
      locality: 'Downtown',
      address: `123 Main St, Downtown, ${c}`,
      phone: '+91-9876543210',
      email: `contact@grandheritage${c.toLowerCase()}.com`,
      website: `https://grandheritage${c.toLowerCase()}.com`,
      rating: 4.8,
      primaryImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    }
  ];
}

async function testLogic() {
  await mongoose.connect(env.MONGODB_URI, { dbName: env.MONGODB_DB_NAME });
  console.log('Connected to DB');

  const city = 'Pune';
  const category = 'hotel';
  const query = '';

  const filter: Record<string, unknown> = {};

  if (city && city.trim().length > 0) {
    filter.city = new RegExp(`^${city.trim()}$`, 'i');
  }
  if (category && category.trim().length > 0 && category.toLowerCase() !== 'all') {
    filter.propertyType = category.toLowerCase().trim();
  }

  console.log('Discovering...');
  const discoveredPlaces = fetchMockGooglePlaces(city, category);
  
  for (const place of discoveredPlaces) {
    console.log('Checking placeId:', place.placeId);
    const exists = await LeadListing.findOne({ placeId: place.placeId });
    console.log('Exists?', !!exists);
    if (!exists) {
      const claimToken = crypto.randomBytes(24).toString('hex');
      const newLead = new LeadListing({
        ...place,
        status: 'UNCLAIMED',
        claimToken
      });
      console.log('Saving lead...');
      try {
        await newLead.save();
        console.log('Saved successfully');
      } catch (err) {
        console.error('SAVE ERROR:', err);
      }
    }
  }

  console.log('Finding leads...');
  const leads = await LeadListing.find(filter).sort({ createdAt: -1 });
  console.log('Found leads:', leads.length);

  process.exit(0);
}

testLogic().catch(err => {
  console.error('FATAL ERROR:', err);
  process.exit(1);
});
