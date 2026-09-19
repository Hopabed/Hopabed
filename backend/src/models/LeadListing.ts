import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface ILeadListing {
  placeId: string;
  title: string;
  propertyType: string;
  city: string;
  locality: string;
  address: string;
  phone?: string;
  email?: string;
  website?: string;
  rating?: number;
  primaryImage?: string;
  status: 'UNCLAIMED' | 'INVITED' | 'CLAIMED';
  claimToken: string;
  claimExpiresAt?: Date;
  claimedByHost?: Types.ObjectId;
  claimedAt?: Date;
  invitedAt?: Date;
  invitedEmail?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type LeadListingDocument = HydratedDocument<ILeadListing>;

const leadListingSchema = new Schema<ILeadListing>(
  {
    placeId: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    propertyType: { type: String, required: true, default: 'hotel' },
    city: { type: String, required: true, trim: true, index: true },
    locality: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    website: { type: String, trim: true },
    rating: { type: Number, default: 4.5 },
    primaryImage: { type: String },
    status: {
      type: String,
      enum: ['UNCLAIMED', 'INVITED', 'CLAIMED'],
      default: 'UNCLAIMED',
      index: true,
    },
    claimToken: { type: String, required: true, unique: true, index: true },
    claimExpiresAt: { type: Date, index: true },
    claimedByHost: { type: Schema.Types.ObjectId, ref: 'Host' },
    claimedAt: { type: Date },
    invitedAt: { type: Date },
    invitedEmail: { type: String, lowercase: true, trim: true },
  },
  { timestamps: true }
);

export const LeadListing = model<ILeadListing>('LeadListing', leadListingSchema);
