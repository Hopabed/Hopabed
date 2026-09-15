import { Router } from 'express';
import { Types } from 'mongoose';
import { Invoice } from '../models/Invoice.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';

const router = Router();

// Helper to generate or get existing invoice for a booking
export async function getOrCreateInvoice(bookingId: string) {
  if (!Types.ObjectId.isValid(bookingId)) {
    throw new Error('INVALID_BOOKING_ID');
  }

  let invoice = await Invoice.findOne({ booking: bookingId })
    .populate('property', 'title city locality primaryImage address')
    .populate('guest', 'name email mobile phone')
    .populate('host', 'businessName user')
    .lean();

  if (invoice) {
    return invoice;
  }

  // Find booking to create invoice on demand
  const booking = await Booking.findById(bookingId)
    .populate('property', 'title city locality primaryImage address')
    .populate('guest', 'name email mobile phone')
    .populate('room', 'name roomType')
    .lean();

  if (!booking) {
    throw new Error('BOOKING_NOT_FOUND');
  }

  // Find captured payment record for transaction references
  const payment = await Payment.findOne({ booking: bookingId, status: 'captured' }).lean();

  const safeIdStr = String(booking._id).slice(-6).toUpperCase();
  const invoiceNumber = `HB-INV-${safeIdStr}`;

  const subtotal = booking.subtotal || Math.round(booking.totalAmount * 0.85);
  const serviceFee = booking.serviceFee || Math.round(booking.totalAmount * 0.05);
  const taxes = booking.taxes || Math.round(booking.totalAmount * 0.10);

  const newInvoice = new Invoice({
    invoiceNumber,
    booking: booking._id,
    guest: booking.guest?._id || booking.guest,
    host: booking.host?._id || booking.host,
    property: booking.property?._id || booking.property,
    paymentId: payment?.paymentId || 'pay_razorpay_mock',
    orderId: payment?.orderId || '',
    subtotal,
    serviceFee,
    taxes,
    totalAmount: booking.totalAmount,
    currency: booking.currency || 'INR',
    status: booking.paymentStatus === 'REFUNDED' ? 'REFUNDED' : 'PAID',
    issuedAt: booking.createdAt || new Date(),
  });

  await newInvoice.save();

  return await Invoice.findById(newInvoice._id)
    .populate('property', 'title city locality primaryImage address')
    .populate('guest', 'name email mobile phone')
    .populate('host', 'businessName user')
    .lean();
}

// GET /api/invoices/booking/:bookingId
router.get('/booking/:bookingId', async (req, res, next) => {
  try {
    const bookingId = Array.isArray(req.params.bookingId) ? req.params.bookingId[0] : req.params.bookingId;
    const invoice = await getOrCreateInvoice(bookingId);
    if (!invoice) {
      res.status(404).json({ success: false, error: { message: 'Booking invoice not found.' } });
      return;
    }

    const booking = await Booking.findById(bookingId)
      .populate('room', 'name roomType')
      .lean();

    res.json({
      success: true,
      data: {
        invoice: {
          id: String(invoice._id),
          invoiceNumber: invoice.invoiceNumber,
          bookingId: String(invoice.booking),
          paymentId: invoice.paymentId || 'pay_razorpay_verified',
          issuedAt: invoice.issuedAt,
          guestName: (invoice.guest as any)?.name || 'Guest',
          guestEmail: (invoice.guest as any)?.email || '',
          guestPhone: (invoice.guest as any)?.mobile || (invoice.guest as any)?.phone || '',
          propertyTitle: (invoice.property as any)?.title || 'Hopebed Stay Property',
          propertyAddress: (invoice.property as any)?.address || '',
          city: (invoice.property as any)?.city || '',
          locality: (invoice.property as any)?.locality || '',
          roomName: (booking?.room as any)?.name || 'Standard Room',
          checkIn: booking?.checkIn,
          checkOut: booking?.checkOut,
          nights: booking?.nights || 1,
          guests: booking?.guests || 1,
          roomCount: booking?.roomCount || 1,
          subtotal: invoice.subtotal,
          serviceFee: invoice.serviceFee,
          taxes: invoice.taxes,
          totalAmount: invoice.totalAmount,
          currency: invoice.currency || 'INR',
          status: invoice.status,
        },
      },
    });
  } catch (error: any) {
    if (error.message === 'BOOKING_NOT_FOUND') {
      res.status(404).json({ success: false, error: { message: 'Booking invoice not found.' } });
      return;
    }
    next(error);
  }
});

export default router;
