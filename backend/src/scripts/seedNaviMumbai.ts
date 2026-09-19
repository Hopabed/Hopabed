import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import { User } from '../models/User.js';
import { Host } from '../models/Host.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';

const propertiesSeed = [
  {
    title: 'The Palms Luxury Hotel Vashi',
    slug: 'the-palms-luxury-hotel-vashi',
    propertyType: 'hotel',
    category: 'stay',
    city: 'Navi Mumbai',
    locality: 'Vashi',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 17, Vashi, Navi Mumbai, Maharashtra 400703',
    coordinates: [73.0022, 19.0759] as [number, number],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 2800,
    pricePerMonth: 0,
    isMonthlyAvailable: false,
    messIncluded: false,
    messMonthlyFee: 0,
    currency: 'INR',
    description: 'Executive hotel stay in the heart of Vashi with high-speed WiFi, complimentary breakfast, and 24/7 room service.',
    amenities: ['Wi-Fi', 'Air Conditioning', 'Breakfast Included', 'Elevator', '24/7 Security'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: true,
    primaryImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Deluxe King Room', roomType: 'private', capacity: 2, inventory: 5, pricePerNight: 2800, amenities: ['King Bed', 'AC', 'TV', 'Ensuite Bathroom'] },
      { name: 'Executive Suite', roomType: 'private', capacity: 3, inventory: 2, pricePerNight: 4200, amenities: ['King Bed', 'Sofa', 'AC', 'Mini Fridge'] }
    ]
  },
  {
    title: 'Kharghar Heights PG & Co-Living',
    slug: 'kharghar-heights-pg-co-living',
    propertyType: 'pg',
    category: 'hostel',
    city: 'Navi Mumbai',
    locality: 'Kharghar',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 12, Near NIFT, Kharghar, Navi Mumbai, Maharashtra 410210',
    coordinates: [73.0697, 19.0474] as [number, number],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 650,
    pricePerMonth: 12500,
    isMonthlyAvailable: true,
    messIncluded: true,
    messMonthlyFee: 3500,
    currency: 'INR',
    description: 'Modern PG & Co-Living residence for students and working professionals. Features daily home-style meal mess, laundry, and power backup.',
    amenities: ['Wi-Fi', 'Mess/Food Included', 'Laundry', 'Housekeeping', 'Study Table', 'CCTV Security'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: true,
    primaryImage: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Single Private Room (PG)', roomType: 'private', capacity: 1, inventory: 3, pricePerNight: 950, pricePerMonth: 16500, messIncluded: true, amenities: ['Private Bed', 'Study Desk', 'Wardrobe'] },
      { name: 'Twin Shared Room (PG)', roomType: 'shared', capacity: 2, inventory: 6, pricePerNight: 650, pricePerMonth: 12500, messIncluded: true, amenities: ['Single Bed', 'Shared Bath', 'Locker'] }
    ]
  },
  {
    title: 'Belapur Lakeview Homestay',
    slug: 'belapur-lakeview-homestay',
    propertyType: 'homestay',
    category: 'homestay',
    city: 'Navi Mumbai',
    locality: 'Belapur',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 15, CBD Belapur, Navi Mumbai, Maharashtra 400614',
    coordinates: [73.0397, 19.0169] as [number, number],
    bedrooms: 3,
    bathrooms: 2,
    maxGuests: 6,
    pricePerNight: 3500,
    pricePerMonth: 45000,
    isMonthlyAvailable: true,
    messIncluded: false,
    messMonthlyFee: 0,
    currency: 'INR',
    description: 'Serene 3BHK lakeside homestay offering quiet living, garden patio, fully equipped kitchen, and warm hospitality.',
    amenities: ['Wi-Fi', 'Kitchen Access', 'Parking', 'Washing Machine', 'Garden View'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: true,
    primaryImage: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Entire 3BHK Villa', roomType: 'entire_place', capacity: 6, inventory: 1, pricePerNight: 3500, pricePerMonth: 45000, amenities: ['3 Bedrooms', 'Kitchen', 'Balcony'] }
    ]
  },
  {
    title: 'Panvel Express Hotel',
    slug: 'panvel-express-hotel',
    propertyType: 'hotel',
    category: 'stay',
    city: 'Navi Mumbai',
    locality: 'Panvel',
    state: 'Maharashtra',
    country: 'India',
    address: 'Near Old Bus Stand, Panvel, Navi Mumbai, Maharashtra 410206',
    coordinates: [73.1175, 18.9894] as [number, number],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 2,
    pricePerNight: 1950,
    pricePerMonth: 0,
    isMonthlyAvailable: false,
    messIncluded: false,
    messMonthlyFee: 0,
    currency: 'INR',
    description: 'Convenient transit hotel near Panvel junction station. Clean rooms, fast check-in, and round-the-clock desk support.',
    amenities: ['Wi-Fi', '24/7 Check-in', 'Air Conditioning', 'Room Service'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: false,
    primaryImage: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Standard Double Room', roomType: 'private', capacity: 2, inventory: 8, pricePerNight: 1950, amenities: ['Double Bed', 'AC', 'TV'] }
    ]
  },
  {
    title: 'Seawoods Executive PG for Men & Women',
    slug: 'seawoods-executive-pg',
    propertyType: 'pg',
    category: 'hostel',
    city: 'Navi Mumbai',
    locality: 'Seawoods',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 42A, Seawoods, Navi Mumbai, Maharashtra 400706',
    coordinates: [73.0189, 19.0135] as [number, number],
    bedrooms: 2,
    bathrooms: 2,
    maxGuests: 4,
    pricePerNight: 700,
    pricePerMonth: 14000,
    isMonthlyAvailable: true,
    messIncluded: true,
    messMonthlyFee: 4000,
    currency: 'INR',
    description: 'Premium PG stay next to Grand Central Mall Seawoods. Offers private rooms and triple-sharing rooms with mess food.',
    amenities: ['Wi-Fi', 'Mess/Food Option', 'Air Conditioning', 'Daily Cleaning', 'Security Guard'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: false,
    primaryImage: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Private Deluxe Room (PG)', roomType: 'private', capacity: 1, inventory: 2, pricePerNight: 1100, pricePerMonth: 18000, messIncluded: true, amenities: ['AC', 'Private Bath'] },
      { name: 'Triple Sharing Room (PG)', roomType: 'shared', capacity: 3, inventory: 4, pricePerNight: 700, pricePerMonth: 14000, messIncluded: true, amenities: ['Single Bed', 'Shared Bath'] }
    ]
  },
  {
    title: 'Airoli TechPark Homestay Suite',
    slug: 'airoli-techpark-homestay-suite',
    propertyType: 'homestay',
    category: 'homestay',
    city: 'Navi Mumbai',
    locality: 'Airoli',
    state: 'Maharashtra',
    country: 'India',
    address: 'Sector 8, Airoli, Navi Mumbai, Maharashtra 400708',
    coordinates: [72.9935, 19.1579] as [number, number],
    bedrooms: 1,
    bathrooms: 1,
    maxGuests: 3,
    pricePerNight: 2400,
    pricePerMonth: 32000,
    isMonthlyAvailable: true,
    messIncluded: false,
    messMonthlyFee: 0,
    currency: 'INR',
    description: 'Cozy studio homestay near Mindspace IT Park Airoli. Ideal for IT consultants, long business visits, or short family stays.',
    amenities: ['Wi-Fi', 'Work Desk', 'Kitchenette', 'Washing Machine'],
    isVerified: true,
    isPublished: true,
    verificationStatus: 'VERIFIED',
    isFeatured: false,
    primaryImage: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    rooms: [
      { name: 'Studio Suite Apartment', roomType: 'entire_place', capacity: 3, inventory: 3, pricePerNight: 2400, pricePerMonth: 32000, amenities: ['Double Bed', 'Sofa', 'Kitchenette'] }
    ]
  }
];

const seedData = async (): Promise<void> => {
  await connectDatabase();

  const adminUser = await User.findOneAndUpdate(
    { email: 'admin@hopebed.in' },
    {
      name: 'Hopebed Admin',
      email: 'admin@hopebed.in',
      role: 'admin',
      isEmailVerified: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const hostUser = await User.findOneAndUpdate(
    { email: 'host@hopebed.in' },
    {
      name: 'Navi Mumbai Host',
      email: 'host@hopebed.in',
      role: 'host',
      isEmailVerified: true,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const host = await Host.findOneAndUpdate(
    { user: hostUser._id },
    {
      user: hostUser._id,
      businessName: 'Hopebed Stay Network',
      verificationStatus: 'verified',
      kycStatus: 'verified',
      isActive: true,
      propertyCount: propertiesSeed.length,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  for (const item of propertiesSeed) {
    const { rooms, ...propData } = item;
    const property = await Property.findOneAndUpdate(
      { slug: propData.slug },
      {
        ...propData,
        host: host._id,
        location: { type: 'Point', coordinates: propData.coordinates },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    for (const roomItem of rooms) {
      await Room.findOneAndUpdate(
        { property: property._id, name: roomItem.name },
        {
          ...roomItem,
          property: property._id,
          currency: 'INR',
          isActive: true,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
  }

  console.log(`Successfully seeded/updated ${propertiesSeed.length} properties with complete room data.`);
  console.log(`Admin login: ${adminUser.email}`);
  console.log(`Host login: ${hostUser.email}`);

  await mongoose.disconnect();
};

seedData().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
