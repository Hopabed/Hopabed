import crypto from 'node:crypto';
import { Property, type IProperty } from '../models/Property.js';
import { LeadListing } from '../models/LeadListing.js';

export interface DiscoveredPlaceInput {
  title: string;
  propertyType?: string;
  city: string;
  locality?: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  sourcePlaceId?: string;
  sourceUrl?: string;
  source?: 'google_places' | 'manual' | 'owner_submitted';
  primaryImage?: string;
  latitude?: number;
  longitude?: number;
}

function normalizeString(str?: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function checkDuplicateProperty(data: DiscoveredPlaceInput) {
  // 1. Check by sourcePlaceId if available
  if (data.sourcePlaceId && data.sourcePlaceId.trim().length > 0) {
    const existingByPlaceId = await Property.findOne({ sourcePlaceId: data.sourcePlaceId.trim() });
    if (existingByPlaceId) return existingByPlaceId;

    const existingLead = await LeadListing.findOne({ placeId: data.sourcePlaceId.trim() });
    if (existingLead) return existingLead;
  }

  // 2. Check by normalized phone number if present
  if (data.phone && data.phone.trim().length > 5) {
    const cleanPhone = data.phone.replace(/[^0-9+]/g, '');
    const existingByPhone = await Property.findOne({
      $or: [{ phone: cleanPhone }, { contactPhone: cleanPhone }, { 'ownerInfo.phone': cleanPhone }],
    });
    if (existingByPhone) return existingByPhone;
  }

  // 3. Check by normalized website if present
  if (data.website && data.website.trim().length > 5) {
    const normWebsite = data.website.trim().toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '');
    const existingByWebsite = await Property.findOne({
      website: new RegExp(normWebsite.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'),
    });
    if (existingByWebsite) return existingByWebsite;
  }

  // 4. Check by normalized title + city combination
  const normTitle = normalizeString(data.title);
  const normCity = normalizeString(data.city);

  if (normTitle && normCity) {
    const existingByTitleCity = await Property.findOne({
      title: new RegExp(`^${normTitle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
      city: new RegExp(`^${normCity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
    });
    if (existingByTitleCity) return existingByTitleCity;
  }

  return null;
}

export async function createUnclaimedProperty(data: DiscoveredPlaceInput) {
  // Deduplication check
  const duplicate = await checkDuplicateProperty(data);
  if (duplicate) {
    return { created: false, duplicate: true, property: duplicate };
  }

  const claimToken = Buffer.from(crypto.randomBytes(24)).toString('hex');
  const slugBase = normalizeString(data.title).replace(/[^a-z0-9]+/g, '-');
  const slug = `${slugBase}-${Date.now().toString().slice(-6)}`;

  const validTypes = ['hotel', 'pg', 'hostel', 'homestay', 'guesthouse', 'apartment', 'villa', 'studio', 'house', 'farmstay'];
  const pType = (data.propertyType && validTypes.includes(data.propertyType.toLowerCase()))
    ? data.propertyType.toLowerCase()
    : 'hotel';

  const newProperty = new Property({
    title: data.title.trim(),
    slug,
    propertyType: pType as any,
    category: 'stay',
    city: data.city.trim(),
    locality: (data.locality || data.city).trim(),
    address: data.address.trim(),
    country: 'India',
    phone: data.phone?.trim(),
    contactPhone: data.phone?.trim(),
    contactEmail: data.email?.trim(),
    website: data.website?.trim(),
    sourcePlaceId: data.sourcePlaceId?.trim(),
    sourceUrl: data.sourceUrl?.trim(),
    source: data.source || 'manual',
    primaryImage: data.primaryImage,
    latitude: data.latitude,
    longitude: data.longitude,
    location: data.latitude && data.longitude ? { type: 'Point', coordinates: [data.longitude, data.latitude] } : undefined,
    status: 'UNCLAIMED',
    verificationStatus: 'DRAFT',
    isVerified: false,
    isPublished: false,
    claimed: false,
    claimToken,
    amenities: ['Wifi', 'Housekeeping'],
    currency: 'INR',
    bedrooms: 0,
    bathrooms: 0,
    maxGuests: 0,
    pricePerNight: 0,
  });

  await newProperty.save();
  return { created: true, duplicate: false, property: newProperty };
}

export async function discoverFromGooglePlaces(city: string, category = 'hotel') {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.log('[Discovery Engine] No Google Places API key configured. Skipping external place fetching.');
    return [];
  }

  try {
    const query = `${category} in ${city}, India`;
    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
    const res = await fetch(url);
    const json = (await res.json()) as any;

    if (!res.ok || json?.status !== 'OK' || !Array.isArray(json?.results)) {
      console.warn('[Discovery Engine] Google Places API response empty or non-OK:', json?.status);
      return [];
    }

    const onboarded = [];
    for (const place of json.results) {
      const inputData: DiscoveredPlaceInput = {
        sourcePlaceId: place.place_id,
        title: place.name,
        propertyType: category,
        city,
        locality: place.formatted_address?.split(',')?.[1]?.trim() || city,
        address: place.formatted_address || `${place.name}, ${city}`,
        latitude: place.geometry?.location?.lat,
        longitude: place.geometry?.location?.lng,
        source: 'google_places',
      };

      const result = await createUnclaimedProperty(inputData);
      if (result.created) {
        onboarded.push(result.property);
      }
    }

    return onboarded;
  } catch (err) {
    console.error('[Discovery Engine ERROR] Google Places discovery failed:', err);
    return [];
  }
}
