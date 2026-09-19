import { Router } from 'express';
import { z } from 'zod';
import { Host } from '../models/Host.js';
import { User } from '../models/User.js';
import { requireAuth, requireRole, type AuthenticatedRequest } from '../middleware/auth.js';
import { Property } from '../models/Property.js';
import { Room } from '../models/Room.js';
import { Booking } from '../models/Booking.js';
import { PropertyAvailability } from '../models/PropertyAvailability.js';
import { PropertyMedia } from '../models/PropertyMedia.js';
import { savePublicImage } from '../services/storageService.js';

const router = Router();

async function getOrCreateHostForUser(userId: string) {
  let host = await Host.findOne({ user: userId });
  if (!host) {
    host = await Host.create({
      user: userId,
      verificationStatus: 'unverified',
      kycStatus: 'not_started',
    });
    await User.findByIdAndUpdate(userId, { role: 'host' });
  }
  return host;
}

const hostRegistrationSchema = z.object({
  businessName: z.string().trim().max(120).optional(),
  bio: z.string().trim().max(1000).optional(),
});

router.post('/register', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });
      return;
    }

    let host = await Host.findOne({ user: userId });
    if (host) {
      res.status(409).json({ success: false, error: { code: 'ALREADY_HOST', message: 'You are already registered as a host.' } });
      return;
    }

    const input = hostRegistrationSchema.parse(req.body);

    host = await Host.create({
      user: userId,
      businessName: input.businessName,
      bio: input.bio,
      verificationStatus: 'unverified',
      kycStatus: 'not_started',
    });
    await User.findByIdAndUpdate(userId, { role: 'host' });

    const defaultTitle = input.businessName ? `${input.businessName}` : 'My First Property';
    const slug = defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

    const firstProperty = await Property.create({
      host: host._id,
      title: defaultTitle,
      slug,
      propertyType: 'hotel',
      category: 'stay',
      city: 'Navi Mumbai',
      locality: 'Kharghar',
      state: 'Maharashtra',
      country: 'India',
      address: 'Address to be updated',
      bedrooms: 1,
      bathrooms: 1,
      maxGuests: 2,
      pricePerNight: 2000,
      currency: 'INR',
      description: 'Welcome to your property draft on Hopebed. Complete property details, pricing, rooms, and verification to go live.',
      amenities: ['WiFi', 'AC'],
      isVerified: false,
      isPublished: false,
      verificationStatus: 'DRAFT',
    });

    await Host.findByIdAndUpdate(host._id, { propertyCount: 1 });

    res.status(201).json({ success: true, data: { host, firstProperty } });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/hosts/auto-draft
 * Auto register host & automatically create first property draft if none exists
 */
router.post('/auto-draft', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      res.status(401).json({ success: false, error: { message: 'Authentication required' } });
      return;
    }

    let host = await Host.findOne({ user: userId });
    if (!host) {
      host = await Host.create({
        user: userId,
        verificationStatus: 'unverified',
        kycStatus: 'not_started',
      });
      await User.findByIdAndUpdate(userId, { role: 'host' });
    }

    // Check if host already has properties
    let property = await Property.findOne({ host: host._id }).sort({ createdAt: -1 });

    if (!property) {
      const defaultTitle = 'My First Property Draft';
      const slug = defaultTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();

      property = await Property.create({
        host: host._id,
        title: defaultTitle,
        slug,
        propertyType: 'hotel',
        category: 'stay',
        city: 'Navi Mumbai',
        locality: 'Kharghar',
        state: 'Maharashtra',
        country: 'India',
        address: 'Address to be updated',
        bedrooms: 1,
        bathrooms: 1,
        maxGuests: 2,
        pricePerNight: 2000,
        currency: 'INR',
        description: 'Welcome to your property draft on Hopebed. Complete details, rooms, and verification to go live.',
        amenities: ['WiFi', 'AC'],
        isVerified: false,
        isPublished: false,
        verificationStatus: 'DRAFT',
      });

      await Host.findByIdAndUpdate(host._id, { $inc: { propertyCount: 1 } });
    }

    res.json({ success: true, data: { host, property } });
  } catch (error) {
    next(error);
  }
});

router.get('/me', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'You are not registered as a host.' } });
      return;
    }
    res.json({ success: true, data: { host } });
  } catch (error) {
    next(error);
  }
});

router.get('/stats', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.json({ success: true, data: { totalProperties: 0, totalBookings: 0, totalEarnings: 0 } });
      return;
    }

    const [totalProperties, bookings] = await Promise.all([
      Property.countDocuments({ host: host._id }),
      Booking.find({ host: host._id, status: { $ne: 'cancelled' } }),
    ]);

    const totalEarnings = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    res.json({
      success: true,
      data: {
        totalProperties,
        totalBookings: bookings.length,
        totalEarnings,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/properties', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'Host profile not found.' } });
      return;
    }
    const properties = await Property.find({ host: host._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: { properties } });
  } catch (error) {
    next(error);
  }
});

router.post('/properties', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);
    
    const propertyCreationSchema = z.object({
      title: z.string().trim().min(1),
      propertyType: z.string().optional(),
      category: z.enum(['stay', 'experience']).optional(),
      city: z.string().trim().optional(),
      locality: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
      address: z.string().trim().optional(),
      bedrooms: z.number().int().min(0).optional(),
      bathrooms: z.number().int().min(0).optional(),
      maxGuests: z.number().int().min(1).optional(),
      pricePerNight: z.number().min(0).optional(),
      currency: z.string().optional(),
      description: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      pinCode: z.string().trim().optional(),
      contactEmail: z.string().trim().optional(),
      contactPhone: z.string().trim().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      ownerInfo: z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        whatsapp: z.string().optional(),
        relationship: z.string().optional(),
        businessName: z.string().optional(),
        pan: z.string().optional(),
        gstin: z.string().optional(),
      }).optional(),
    }).passthrough();
    
    const validatedData = propertyCreationSchema.parse(req.body);
    
    // Generate a basic slug
    const slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now();
    
    const property = await Property.create({
      ...validatedData,
      host: host._id,
      slug,
      location: {
        type: 'Point',
        coordinates: (validatedData.longitude && validatedData.latitude) 
          ? [validatedData.longitude, validatedData.latitude] 
          : [73.0022, 19.0759]
      },
      verificationStatus: 'DRAFT',
      isVerified: false,
      isPublished: false
    });
    
    await Host.findByIdAndUpdate(host._id, { $inc: { propertyCount: 1 } });
    
    res.status(201).json({ success: true, data: { property } });
  } catch (error) {
    next(error);
  }
});

router.put('/properties/:propertyId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const property = await Property.findOne({ _id: req.params.propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    
    // We can use a relaxed schema for draft updates
    const updateSchema = z.object({
      title: z.string().trim().min(1).optional(),
      propertyType: z.string().optional(),
      category: z.string().optional(),
      city: z.string().trim().optional(),
      locality: z.string().trim().optional(),
      state: z.string().trim().optional(),
      country: z.string().trim().optional(),
      address: z.string().trim().optional(),
      bedrooms: z.number().int().min(0).optional(),
      bathrooms: z.number().int().min(0).optional(),
      maxGuests: z.number().int().min(1).optional(),
      pricePerNight: z.number().min(0).optional(),
      currency: z.string().optional(),
      description: z.string().optional(),
      amenities: z.array(z.string()).optional(),
      pinCode: z.string().trim().optional(),
      contactEmail: z.string().trim().optional(),
      contactPhone: z.string().trim().optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      ownerInfo: z.object({
        fullName: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        whatsapp: z.string().optional(),
        relationship: z.string().optional(),
        businessName: z.string().optional(),
        pan: z.string().optional(),
        gstin: z.string().optional(),
      }).optional(),
    }).passthrough();
    
    const validatedData = updateSchema.parse(req.body);
    
    // Handle location specifically
    if (validatedData.longitude !== undefined && validatedData.latitude !== undefined) {
      validatedData.location = {
        type: 'Point',
        coordinates: [validatedData.longitude, validatedData.latitude]
      };
    }

    // Handle ownerInfo merge
    if (validatedData.ownerInfo) {
      validatedData.ownerInfo = {
        ...property.ownerInfo,
        ...validatedData.ownerInfo,
      };
    }

    const updatedProperty = await Property.findByIdAndUpdate(
      property._id, 
      { $set: validatedData },
      { new: true }
    );
    
    res.json({ success: true, data: { property: updatedProperty } });
  } catch (error) {
    next(error);
  }
});

router.post('/properties/:propertyId/rooms', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const property = await Property.findOne({ _id: req.params.propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    
    const room = await Room.create({
      ...req.body,
      property: property._id
    });
    
    res.status(201).json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
});

router.post('/properties/:propertyId/images', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const property = await Property.findOne({ _id: req.params.propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }

    const schema = z.object({
      originalFilename: z.string().min(1),
      mimeType: z.string().min(1),
      fileBase64: z.string().min(1),
      isPrimary: z.boolean().default(false),
    });

    const input = schema.parse(req.body);

    const base64Clean = input.fileBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(base64Clean, 'base64');

    const saveResult = await savePublicImage({
      propertyId: String(property._id),
      documentType: 'image', // unused for public image really, but required by interface type
      originalFilename: input.originalFilename,
      mimeType: input.mimeType,
      buffer,
    });

    // Determine if this should be the primary image
    const existingImagesCount = await PropertyMedia.countDocuments({ property: property._id, mediaType: 'image' });
    const isPrimary = input.isPrimary || existingImagesCount === 0;

    if (isPrimary) {
      // Unset previous primary images
      await PropertyMedia.updateMany({ property: property._id, mediaType: 'image' }, { isPrimary: false });
    }

    const media = await PropertyMedia.create({
      property: property._id,
      mediaType: 'image',
      fileName: input.originalFilename,
      objectKey: saveResult.objectKey,
      url: saveResult.url,
      mimeType: input.mimeType,
      size: saveResult.size,
      isPrimary,
    });

    if (isPrimary) {
      property.primaryImage = saveResult.url;
      await property.save();
    }

    res.status(201).json({ success: true, data: { media } });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'UNSUPPORTED_FILE_TYPE') {
        res.status(400).json({ success: false, error: { message: 'Only JPG, PNG, and WEBP files are supported.' } });
        return;
      }
      if (error.message === 'FILE_TOO_LARGE') {
        res.status(400).json({ success: false, error: { message: 'Maximum file size allowed is 5 MB.' } });
        return;
      }
    }
    next(error);
  }
});

router.get('/bookings', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'Host profile not found.' } });
      return;
    }

    const bookings = await Booking.find({ host: host._id })
      .populate('property', 'title city locality')
      .populate('room', 'name')
      .populate('guest', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { bookings } });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-pass', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const input = z.object({ bookingId: z.string() }).parse(req.body);

    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'Host profile not found.' } });
      return;
    }

    const booking = await Booking.findOne({ _id: input.bookingId, host: host._id }).populate('guest', 'name email');
    if (!booking) {
      res.status(404).json({ success: false, error: { message: 'Invalid Stay Pass. Booking not found for your properties.' } });
      return;
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ success: false, error: { message: 'Booking was cancelled.' } });
      return;
    }
    if (booking.status === 'checked_in') {
      res.status(400).json({ success: false, error: { message: 'Guest is already checked in.' } });
      return;
    }
    if (booking.paymentStatus !== 'PAID') {
      res.status(400).json({ success: false, error: { message: 'Booking is unpaid.' } });
      return;
    }

    booking.status = 'checked_in';
    await booking.save();

    res.json({ success: true, data: { booking } });
  } catch (error) {
    next(error);
  }
});

router.get('/properties/:propertyId/rooms/:roomId/availability', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'Host profile not found.' } });
      return;
    }

    const { propertyId, roomId } = req.params;
    const property = await Property.findOne({ _id: propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { message: 'Property not found.' } });
      return;
    }

    const { start, end } = req.query;
    const query: any = { room: roomId, property: propertyId };
    
    if (start && end) {
      query.date = { 
        $gte: new Date(start as string), 
        $lte: new Date(end as string) 
      };
    }

    const availability = await PropertyAvailability.find(query).sort({ date: 1 });
    res.json({ success: true, data: { availability } });
  } catch (error) {
    next(error);
  }
});

router.post('/properties/:propertyId/rooms/:roomId/availability', requireAuth, requireRole('host', 'admin'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await Host.findOne({ user: req.auth?.userId });
    if (!host) {
      res.status(404).json({ success: false, error: { code: 'NOT_A_HOST', message: 'Host profile not found.' } });
      return;
    }

    const { propertyId, roomId } = req.params;
    const property = await Property.findOne({ _id: propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { message: 'Property not found.' } });
      return;
    }

    const room = await Room.findOne({ _id: roomId, property: propertyId });
    if (!room) {
      res.status(404).json({ success: false, error: { message: 'Room not found.' } });
      return;
    }

    const schema = z.object({
      startDate: z.string(),
      endDate: z.string(),
      status: z.enum(['available', 'blocked']),
      price: z.number().min(0).optional(),
    });

    const input = schema.parse(req.body);
    const start = new Date(input.startDate);
    const end = new Date(input.endDate);
    
    // Normalize dates to midnight UTC to prevent timezone drifting bugs
    start.setUTCHours(0,0,0,0);
    end.setUTCHours(0,0,0,0);

    const dates: Date[] = [];
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setUTCDate(current.getUTCDate() + 1);
    }

    // Bulk upsert
    const ops = dates.map(date => ({
      updateOne: {
        filter: { property: propertyId, room: roomId, date },
        update: {
          $set: {
            status: input.status,
            price: input.price !== undefined ? input.price : room.pricePerNight,
          }
        },
        upsert: true
      }
    }));

    await PropertyAvailability.bulkWrite(ops);

    res.json({ success: true, data: { message: 'Availability updated successfully.', count: dates.length } });
  } catch (error) {
    next(error);
  }
});

router.get('/properties/:propertyId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const property = await Property.findOne({ _id: req.params.propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }

    const rooms = await Room.find({ property: property._id });
    const images = await PropertyMedia.find({ property: property._id, mediaType: 'image' });

    res.json({ success: true, data: { property, rooms, images } });
  } catch (error) {
    next(error);
  }
});

router.put('/properties/:propertyId/rooms/:roomId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const room = await Room.findOneAndUpdate(
      { _id: req.params.roomId, property: req.params.propertyId },
      req.body,
      { new: true }
    );
    if (!room) {
      res.status(404).json({ success: false, error: { message: 'Room not found.' } });
      return;
    }
    res.json({ success: true, data: { room } });
  } catch (error) {
    next(error);
  }
});

router.delete('/properties/:propertyId/rooms/:roomId', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const room = await Room.findOneAndDelete({ _id: req.params.roomId, property: req.params.propertyId });
    if (!room) {
      res.status(404).json({ success: false, error: { message: 'Room not found.' } });
      return;
    }
    res.json({ success: true, data: { message: 'Room deleted' } });
  } catch (error) {
    next(error);
  }
});

router.post('/properties/:propertyId/submit', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const host = await getOrCreateHostForUser(req.auth!.userId);

    const property = await Property.findOne({ _id: req.params.propertyId, host: host._id });
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }

    const rooms = await Room.find({ property: property._id });
    if (rooms.length === 0) {
      res.status(400).json({ success: false, error: { message: 'At least one room or inventory must be added before submitting.' } });
      return;
    }

    const images = await PropertyMedia.find({ property: property._id, mediaType: 'image' });
    if (images.length < 3) {
      res.status(400).json({ success: false, error: { message: 'At least 3 property photos are required before submitting.' } });
      return;
    }

    if (!property.ownerInfo?.fullName || !property.ownerInfo?.phone) {
      res.status(400).json({ success: false, error: { message: 'Owner information is incomplete.' } });
      return;
    }

    if (!property.city || !property.address) {
      res.status(400).json({ success: false, error: { message: 'Property location is incomplete.' } });
      return;
    }

    property.verificationStatus = 'VERIFIED';
    property.isVerified = true;
    property.isPublished = true;
    await property.save();

    await Host.findByIdAndUpdate(host._id, { verificationStatus: 'verified', isActive: true });

    const roomsCount = await Room.countDocuments({ property: property._id });
    if (roomsCount === 0) {
      await Room.create({
        property: property._id,
        name: 'Standard Deluxe Room',
        roomType: 'private',
        capacity: property.maxGuests || 2,
        inventory: 5,
        pricePerNight: property.pricePerNight || 2000,
        amenities: property.amenities || ['WiFi', 'AC'],
      });
    }

    res.json({ success: true, data: { message: 'Property approved and live on Hopebed Stays!', property } });
  } catch (error) {
    next(error);
  }
});

export default router;
