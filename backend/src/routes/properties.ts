import { Router } from 'express';
import { Types } from 'mongoose';
import { z } from 'zod';
import { Booking } from '../models/Booking.js';
import { PropertyAvailability } from '../models/PropertyAvailability.js';
import { Property } from '../models/Property.js';
import { Host } from '../models/Host.js';
import { Room } from '../models/Room.js';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const bookingLimiter = process.env.CF_WORKER === 'true'
  ? (_req: any, _res: any, next: any) => next()
  : rateLimit({
      windowMs: 60 * 60 * 1000, // 1 hour
      limit: 10, // 10 booking attempts per hour per IP
      message: { success: false, error: { message: 'Too many booking attempts. Please try again later.' } },
    });

const router = Router();
const dateSchema = z.object({
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
  guests: z.coerce.number().int().min(1).max(50).default(1),
});

function validateDates(checkIn: Date, checkOut: Date) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  checkIn.setUTCHours(0, 0, 0, 0);
  checkOut.setUTCHours(0, 0, 0, 0);
  if (checkIn < today || checkOut <= checkIn) {
    throw new Error('DATES_INVALID');
  }
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function availableRooms(propertyIds: Types.ObjectId[], checkIn: Date, checkOut: Date, guests: number) {
  const rooms = await Room.find({ property: { $in: propertyIds }, isActive: true, capacity: { $gte: guests } }).lean();
  const roomIds = rooms.map((room) => room._id);
  const bookings = await Booking.find({
    room: { $in: roomIds },
    status: { $in: ['pending', 'confirmed', 'checked_in'] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  }).lean();

  const blocks = await PropertyAvailability.find({
    room: { $in: roomIds },
    status: 'blocked',
    date: { $gte: checkIn, $lt: checkOut },
  }).lean();
  const blockedRoomIds = new Set(blocks.map((b) => String(b.room)));

  const booked = new Map<string, number>();
  for (const booking of bookings) booked.set(String(booking.room), (booked.get(String(booking.room)) ?? 0) + booking.roomCount);
  return rooms.filter((room) => !blockedRoomIds.has(String(room._id)) && (booked.get(String(room._id)) ?? 0) < room.inventory);
}

router.get('/search', async (req, res, next) => {
  try {
    const query = z.object({
      destination: z.string().trim().max(100).optional(),
      propertyType: z.string().trim().optional(),
      minPrice: z.coerce.number().nonnegative().optional(),
      maxPrice: z.coerce.number().nonnegative().optional(),
      checkIn: z.coerce.date().optional(),
      checkOut: z.coerce.date().optional(),
      guests: z.coerce.number().int().min(1).max(50).default(1),
    }).parse(req.query);
    
    let nights = 0;
    if (query.checkIn && query.checkOut) {
      nights = validateDates(query.checkIn, query.checkOut);
    }
    
    // Server-Side Public Property Rule: Verified Property + Verified Host + Active Property
    const verifiedHosts = await Host.find({ verificationStatus: 'verified', isActive: true }).select('_id').lean();
    const verifiedHostIds = verifiedHosts.map((h) => h._id);

    const propertyFilter: Record<string, unknown> = {
      isVerified: true,
      isPublished: true,
      $or: [
        { verificationStatus: { $in: ['VERIFIED', 'PUBLISHED'] } },
        { status: { $in: ['VERIFIED', 'PUBLISHED'] } },
      ],
      $and: [
        {
          $or: [
            { host: { $in: verifiedHostIds } },
            { host: { $exists: false } },
            { host: null },
          ],
        },
      ],
    };
    if (query.destination) {
      propertyFilter.$and = [
        {
          $or: [
            { city: new RegExp(escapeRegex(query.destination), 'i') },
            { locality: new RegExp(escapeRegex(query.destination), 'i') },
            { title: new RegExp(escapeRegex(query.destination), 'i') },
          ],
        },
      ];
    }
    if (query.propertyType) propertyFilter.propertyType = query.propertyType;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      propertyFilter.pricePerNight = { ...(query.minPrice !== undefined ? { $gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { $lte: query.maxPrice } : {}) };
    }
    const properties = await Property.find(propertyFilter).sort({ isFeatured: -1, createdAt: -1 }).limit(50).lean();
    
    let finalProperties = properties;
    if (query.checkIn && query.checkOut) {
      const rooms = await availableRooms(properties.map((property) => property._id), query.checkIn, query.checkOut, query.guests);
      const availablePropertyIds = new Set(rooms.map((room) => String(room.property)));
      finalProperties = properties.filter((property) => availablePropertyIds.has(String(property._id)));
    }
    
    res.json({ success: true, data: { nights, properties: finalProperties } });
  } catch (error) {
    if (error instanceof Error && error.message === 'DATES_INVALID') {
      res.status(400).json({ success: false, error: { code: 'DATES_INVALID', message: 'Choose a future check-in and a later check-out date.' } });
      return;
    }
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!Types.ObjectId.isValid(req.params.id)) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    const property = await Property.findOne({
      _id: req.params.id,
      isVerified: true,
      isPublished: true,
    }).lean();
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found or not published.' } });
      return;
    }
    if (property.host) {
      const hostDoc = await Host.findById(property.host).lean();
      if (!hostDoc || hostDoc.verificationStatus !== 'verified' || !hostDoc.isActive) {
        res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not available.' } });
        return;
      }
    }

    const rooms = await Room.find({ property: property._id, isActive: true }).lean();
    res.json({ success: true, data: { property, rooms } });
  } catch (error) { next(error); }
});

router.post('/:id/submit-review', requireAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const propertyId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (!Types.ObjectId.isValid(propertyId)) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    const property = await Property.findById(propertyId);
    if (!property) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    property.status = 'UNDER_REVIEW';
    property.verificationStatus = 'PENDING_REVIEW';
    property.isPublished = false;
    property.isVerified = false;
    await property.save();

    res.json({ success: true, data: { property, message: 'Property submitted for admin review successfully.' } });
  } catch (error) { next(error); }
});

router.post('/:id/bookings', requireAuth, bookingLimiter, async (req: AuthenticatedRequest, res, next) => {
  const session = await Booking.startSession();
  try {
    const propertyId = String(Array.isArray(req.params.id) ? req.params.id[0] : req.params.id);
    if (!Types.ObjectId.isValid(propertyId)) {
      res.status(404).json({ success: false, error: { code: 'PROPERTY_NOT_FOUND', message: 'Property not found.' } });
      return;
    }
    const input = z.object({ 
      roomId: z.string().refine(Types.ObjectId.isValid), 
      checkIn: z.coerce.date(), 
      checkOut: z.coerce.date(), 
      guests: z.coerce.number().int().min(1), 
      roomCount: z.coerce.number().int().min(1).max(20).default(1), 
      bookingType: z.enum(['nightly', 'monthly']).optional().default('nightly'),
      messOption: z.boolean().optional().default(false),
      notes: z.string().trim().max(500).optional() 
    }).parse(req.body);
    const nights = validateDates(input.checkIn, input.checkOut);
    const auth = req.auth;
    if (!auth) throw new Error('UNAUTHORIZED');
    let booking;
    await session.withTransaction(async () => {
      const property = await Property.findOne({
        _id: propertyId,
        isVerified: true,
        isPublished: true,
      }).session(session);
      if (!property) throw new Error('ROOM_UNAVAILABLE');
      const hostDoc = await Host.findById(property.host).session(session);
      if (!hostDoc || hostDoc.verificationStatus !== 'verified' || !hostDoc.isActive) throw new Error('ROOM_UNAVAILABLE');

      const room = await Room.findOneAndUpdate({ _id: input.roomId, property: propertyId, isActive: true }, { $inc: { __v: 1 } }, { new: true }).session(session);
      if (!room || input.guests > room.capacity) throw new Error('ROOM_UNAVAILABLE');

      const blocks = await PropertyAvailability.findOne({ room: room._id, status: 'blocked', date: { $gte: input.checkIn, $lt: input.checkOut } }).session(session);
      if (blocks) throw new Error('ROOM_UNAVAILABLE');

      const overlap = await Booking.aggregate([{ $match: { room: room._id, status: { $in: ['pending', 'confirmed', 'checked_in'] }, checkIn: { $lt: input.checkOut }, checkOut: { $gt: input.checkIn } } }]).session(session);
      const bookedCount = overlap.reduce((total, item) => total + (item.roomCount ?? 1), 0);
      if (bookedCount + input.roomCount > room.inventory) throw new Error('ROOM_UNAVAILABLE');

      let unitPrice = room.pricePerNight;
      let baseCost = 0;

      if (input.bookingType === 'monthly' && (room.pricePerMonth || property.pricePerMonth)) {
        const months = Math.max(1, Math.round(nights / 30));
        unitPrice = room.pricePerMonth || property.pricePerMonth || room.pricePerNight;
        baseCost = unitPrice * months * input.roomCount;
      } else {
        baseCost = unitPrice * nights * input.roomCount;
      }

      if (input.messOption) {
        const messFee = room.messMonthlyFee || property.messMonthlyFee || 3000;
        const months = Math.max(1, Math.round(nights / 30));
        baseCost += messFee * months * input.roomCount;
      }

      const subtotal = Math.round(baseCost);
      const serviceFee = Math.round(subtotal * 0.05);
      const taxes = Math.round((subtotal + serviceFee) * 0.05);
      booking = new Booking({ 
        property: property._id, 
        guest: auth.userId, 
        host: property.host, 
        room: room._id, 
        checkIn: input.checkIn, 
        checkOut: input.checkOut, 
        nights, 
        guests: input.guests, 
        roomCount: input.roomCount, 
        pricePerNight: unitPrice, 
        bookingType: input.bookingType,
        messOption: input.messOption,
        subtotal, 
        serviceFee, 
        taxes, 
        totalAmount: subtotal + serviceFee + taxes, 
        currency: room.currency, 
        notes: input.notes, 
        status: 'pending', 
        paymentStatus: 'UNPAID' 
      });
      await booking.save({ session });
    });
    res.status(201).json({ success: true, data: { booking } });
  } catch (error) {
    const code = error instanceof Error ? error.message : '';
    if (code === 'ROOM_UNAVAILABLE') { res.status(409).json({ success: false, error: { code, message: 'Sorry, this room is no longer available for the selected dates.' } }); return; }
    if (code === 'DATES_INVALID') { res.status(400).json({ success: false, error: { code, message: 'Choose valid future dates.' } }); return; }
    next(error);
  } finally { await session.endSession(); }
});

export default router;