import mongoose from 'mongoose';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { Host } from '../src/models/Host.js';
import { Property } from '../src/models/Property.js';
import { Room } from '../src/models/Room.js';

async function seedProductionProperty() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected.');

    // 1. Create a dedicated Host User
    const email = 'hello@hopebed.in';
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: 'Hopebed Signature',
        email,
        phone: '+919999999999',
        role: 'host',
        isEmailVerified: true
      });
      console.log('Created Host User.');
    }

    // 2. Create the Host Profile
    let host = await Host.findOne({ user: user._id });
    if (!host) {
      host = await Host.create({
        user: user._id,
        verificationStatus: 'verified',
        businessName: 'Hopebed Signature Stays',
        kycStatus: 'verified'
      });
      console.log('Created Verified Host Profile.');
    } else {
      host.verificationStatus = 'verified';
      await host.save();
    }

    // 3. Create the Real Property
    const title = 'The Riverfront Marina - Hopebed Signature';
    let property = await Property.findOne({ title });
    if (!property) {
      property = await Property.create({
        host: host._id,
        title,
        slug: 'the-riverfront-marina',
        propertyType: 'villa',
        category: 'stay',
        city: 'Mumbai',
        locality: 'Bandra West',
        state: 'Maharashtra',
        country: 'India',
        address: '14 Marina Drive, Bandra West, Mumbai',
        bedrooms: 3,
        bathrooms: 3,
        maxGuests: 6,
        pricePerNight: 8500,
        currency: 'INR',
        description: 'Experience luxury living at its finest in this stunning 3-bedroom riverfront villa. Featuring panoramic sunset views, private plunge pool, fully-equipped kitchen, and 24/7 concierge service. Perfect for families or groups seeking a premium getaway in the heart of Mumbai.',
        amenities: ['WiFi', 'AC', 'Kitchen', 'Power Backup', 'Parking', 'Pool'],
        primaryImage: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1920&q=80',
        isVerified: true,
        isPublished: true,
        verificationStatus: 'VERIFIED',
        ownerInfo: {
          fullName: 'Hopebed Team',
          phone: '+919999999999',
          email: 'hello@hopebed.in'
        },
        location: {
          type: 'Point',
          coordinates: [72.8258, 19.0596]
        }
      });
      console.log('Created Verified Production Property.');
    } else {
      property.isVerified = true;
      property.isPublished = true;
      property.verificationStatus = 'VERIFIED';
      await property.save();
      console.log('Updated existing Production Property to Verified/Published.');
    }

    // 4. Create Rooms
    const roomName = 'Marina Grand Suite';
    let room = await Room.findOne({ property: property._id, name: roomName });
    if (!room) {
      await Room.create({
        property: property._id,
        name: roomName,
        roomType: 'private',
        capacity: 6,
        inventory: 1, // Only 1 villa available
        pricePerNight: 8500,
        amenities: ['WiFi', 'AC', 'Kitchen', 'Power Backup', 'Parking', 'Pool'],
      });
      console.log('Created Room/Inventory for Property.');
    }

    console.log('\n✅ SEEDING COMPLETE: The system now has a real, verified, and published property ready for bookings!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
}

seedProductionProperty();
