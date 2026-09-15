import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface IInvoice {
  invoiceNumber: string;
  booking: Types.ObjectId;
  guest: Types.ObjectId;
  host: Types.ObjectId;
  property: Types.ObjectId;
  paymentId?: string;
  orderId?: string;
  subtotal: number;
  serviceFee: number;
  taxes: number;
  totalAmount: number;
  currency: string;
  status: 'PAID' | 'REFUNDED' | 'CANCELLED';
  issuedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type InvoiceDocument = HydratedDocument<IInvoice>;

const invoiceSchema = new Schema<IInvoice>(
  {
    invoiceNumber: { type: String, required: true, unique: true, index: true },
    booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true, index: true },
    guest: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    host: { type: Schema.Types.ObjectId, ref: 'Host', required: true },
    property: { type: Schema.Types.ObjectId, ref: 'Property', required: true },
    paymentId: { type: String, default: '' },
    orderId: { type: String, default: '' },
    subtotal: { type: Number, required: true, min: 0 },
    serviceFee: { type: Number, required: true, min: 0 },
    taxes: { type: Number, required: true, min: 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR', uppercase: true },
    status: { type: String, enum: ['PAID', 'REFUNDED', 'CANCELLED'], default: 'PAID' },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Invoice: Model<IInvoice> = model<IInvoice>('Invoice', invoiceSchema);
