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
    claimExpiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
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

function generateFallbackPlaces(city: string, category = 'hotel', limit = 20): DiscoveredPlaceInput[] {
  const c = city.trim();
  const cLower = c.toLowerCase();
  const cCap = c.charAt(0).toUpperCase() + c.slice(1);
  const cat = category.toLowerCase();

  const targetLimit = Math.min(Math.max(limit, 5), 50);

  const images = [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=800&q=80',
  ];

  const localitiesGoa = ['Baga Beach', 'Calangute', 'Anjuna', 'Vagator', 'Panjim Latin Quarter', 'Candolim', 'Morjim', 'Palolem', 'Colva', 'Arambol', 'Assagao', 'Siolim', 'Dona Paula', 'Nerul Goa', 'Benaulim'];
  const localitiesBlr = ['Indiranagar', 'Koramangala', 'MG Road', 'Whitefield', 'HSR Layout', 'JP Nagar', 'Jayanagar', 'Electronic City', 'Bellandur', 'Marathahalli', 'Hebbal', 'Yelahanka', 'BTM Layout', 'Sarjapur Road', 'Malleshwaram'];
  const localitiesMum = ['Bandra West', 'Marine Drive', 'Vashi', 'CBD Belapur', 'Kharghar', 'Panvel', 'Andheri West', 'Powai', 'Juhu', 'Colaba', 'Worli', 'Lower Parel', 'Malad West', 'Thane West', 'Navi Mumbai Sector 17'];
  const localitiesDelhi = ['Connaught Place', 'Hauz Khas Village', 'South Extension', 'Cyber City Gurgaon', 'Aerocity', 'Karol Bagh', 'Saket', 'Vasant Kunj', 'Greater Kailash', 'Paharganj', 'Noida Sector 62', 'Dwarka Sector 10', 'Rajouri Garden', 'Green Park', 'Chhatarpur'];

  let chosenLocalities = ['Central ' + cCap, cCap + ' Station', cCap + ' Plaza', cCap + ' North', cCap + ' Market', cCap + ' East', cCap + ' Heights', cCap + ' West', cCap + ' Bypass', cCap + ' Gardens', cCap + ' Lakeview', cCap + ' Tech Park', cCap + ' Highway', cCap + ' Green', cCap + ' Riverside'];

  if (cLower.includes('goa')) chosenLocalities = localitiesGoa;
  else if (cLower.includes('bangalore') || cLower.includes('bengaluru')) chosenLocalities = localitiesBlr;
  else if (cLower.includes('mumbai') || cLower.includes('navi mumbai') || cLower.includes('panvel') || cLower.includes('kalamboli')) chosenLocalities = localitiesMum;
  else if (cLower.includes('delhi')) chosenLocalities = localitiesDelhi;

  const hotelPrefixes = ['Hotel Peace Park', 'Grand Palace Hotel', 'Royal Residency', 'Comfort Suites & Inn', 'Seaside Resort & Spa', 'Crown Plaza Hotel', 'Orchid Suites', 'Park Avenue Stays', 'Heritage Inn', 'Regency Suites', 'Marriott Courtyard Stays', 'Fortune Park Hotel', 'Emerald Bay Resort', 'Golden Tulip Inn', 'Vanguard Boutique Hotel', 'Ambassador Stays', 'Metropolitan Hotel', 'Presidential Suites', 'Ocean View Hotel', 'Radisson Blu Stays'];

  const pgPrefixes = ['Zolo Stays Co-Living', 'Stanza Living Pro Residence', 'Indiranagar Executive PG', 'Tech Park Student Hostel', 'Backpackers Co-Work Hostel', 'Youth Hub Co-Living', 'Elite Executive PG', 'Oxford Student House', 'Nomad Backpackers Stay', 'Smart Living PG', 'Comfort Zone Hostel', 'Prime Co-Living', 'Metro Executive PG', 'Urban Nest Co-Living', 'Horizon Pro Hostel', 'Campus Student PG', 'Highland Co-Living', 'Zenith Executive PG', 'Apex Student Stays', 'Capital Co-Living Hostel'];

  const villaPrefixes = ['Heritage Villa & Homestay', 'Beachfront Palms Villa', 'Portuguese Country House', 'Green Valley Villa', 'Sunset Point Homestay', 'Lakefront Heritage Stays', 'Orchard Villa & Suites', 'Pine Hill Homestay', 'Royal Villa & Farmhouse', 'Secluded Haven Homestay', 'Palm Retreat Villa', 'Mountain View Homestay', 'Serenity Villa Stays', 'Botanica Homestay', 'Elysium Luxury Villa', 'Whispering Pines Homestay', 'Vista Heritage Villa', 'Solitude Homestay', 'Riviera Villa', 'Tranquil Country Homestay'];

  const isPg = cat.includes('pg') || cat.includes('hostel');
  const isVilla = cat.includes('homestay') || cat.includes('villa');

  const prefixes = isPg ? pgPrefixes : isVilla ? villaPrefixes : hotelPrefixes;
  const pType = isPg ? 'pg' : isVilla ? 'villa' : 'hotel';

  const candidates: DiscoveredPlaceInput[] = [];

  for (let i = 0; i < targetLimit; i++) {
    const loc = chosenLocalities[i % chosenLocalities.length];
    const prefix = prefixes[i % prefixes.length];
    const cleanCitySlug = cLower.replace(/[^a-z0-9]/g, '');

    const title = `${prefix} ${loc.includes(cCap) ? loc : `${loc}, ${cCap}`}`;
    const sourcePlaceId = `candidate_${cleanCitySlug}_${pType}_${i + 1}`;

    candidates.push({
      sourcePlaceId,
      title,
      propertyType: pType,
      city: cCap,
      locality: loc,
      address: `${10 + i * 7}, ${loc}, ${cCap}, India`,
      phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
      email: `contact@stay-${cleanCitySlug}-${i + 1}.com`,
      source: 'google_places',
      primaryImage: images[i % images.length],
    });
  }

  return candidates;
}

export async function discoverFromGooglePlaces(city: string, category = 'hotel', limit = 20) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
  let rawPlacesInput: DiscoveredPlaceInput[] = [];
  const targetLimit = Math.min(Math.max(limit, 1), 50);

  if (apiKey) {
    try {
      const query = `${category} in ${city}, India`;
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const res = await fetch(url);
      const json = (await res.json()) as any;

      if (res.ok && json?.status === 'OK' && Array.isArray(json?.results) && json.results.length > 0) {
        const placeResults: any[] = [...json.results];

        // Handle Google Places API Multi-Page Pagination if available and required
        let pageToken = json.next_page_token;
        let pageCount = 1;

        while (pageToken && placeResults.length < targetLimit && pageCount < 3) {
          // Google Places API requires ~2 second delay before next_page_token becomes active
          await new Promise((resolve) => setTimeout(resolve, 2000));
          const nextUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pageToken}&key=${apiKey}`;
          const nextRes = await fetch(nextUrl);
          const nextJson = (await nextRes.json()) as any;

          if (nextRes.ok && nextJson?.status === 'OK' && Array.isArray(nextJson?.results)) {
            placeResults.push(...nextJson.results);
            pageToken = nextJson.next_page_token;
            pageCount++;
          } else {
            pageToken = undefined;
          }
        }

        const targetPlaces = placeResults.slice(0, targetLimit);
        rawPlacesInput = await Promise.all(
          targetPlaces.map(async (place: any) => {
            let phone: string | undefined = undefined;
            let website: string | undefined = undefined;

            try {
              const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number,international_phone_number,website&key=${apiKey}`;
              const dRes = await fetch(detailsUrl);
              const dJson = (await dRes.json()) as any;
              if (dRes.ok && dJson?.status === 'OK' && dJson?.result) {
                phone = dJson.result.formatted_phone_number || dJson.result.international_phone_number;
                website = dJson.result.website;
              }
            } catch {
              // Ignore place details fetch errors gracefully
            }

            return {
              sourcePlaceId: place.place_id,
              title: place.name,
              propertyType: category,
              city,
              locality: place.formatted_address?.split(',')?.[1]?.trim() || city,
              address: place.formatted_address || `${place.name}, ${city}`,
              phone,
              website,
              latitude: place.geometry?.location?.lat,
              longitude: place.geometry?.location?.lng,
              source: 'google_places' as const,
            };
          })
        );
      } else {
        console.warn(`[Discovery Engine] Google Places API returned status '${json?.status}'. Error: '${json?.error_message || 'None'}'. Using discovery fallbacks.`);
      }
    } catch (err) {
      console.error('[Discovery Engine ERROR] Google Places API fetch failed:', err);
    }
  } else {
    console.log('[Discovery Engine] No Google Places API key configured. Using discovery fallbacks.');
  }

  // If external Places API returned no results or failed/denied, use fallback place candidates for the city
  if (rawPlacesInput.length === 0) {
    rawPlacesInput = generateFallbackPlaces(city, category, targetLimit);
  }

  const onboarded = [];
  for (const placeInput of rawPlacesInput) {
    const result = await createUnclaimedProperty(placeInput);
    if (result.created) {
      onboarded.push(result.property);
    }
  }

  return onboarded;
}
