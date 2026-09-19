import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface IProperty {
  host: Types.ObjectId;
  title: string;
  slug: string;
  propertyType:
    | 'hotel'
    | 'pg'
    | 'hostel'
    | 'homestay'
    | 'guesthouse'
    | 'apartment'
    | 'villa'
    | 'studio'
    | 'house'
    | 'farmstay';
  category: 'stay' | 'hostel' | 'resort' | 'homestay';
  city?: string;
  locality?: string;
  state?: string;
  country?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  pinCode?: string;
  contactEmail?: string;
  contactPhone?: string;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  pricePerNight?: number;
  pricePerMonth?: number;
  isMonthlyAvailable?: boolean;
  messIncluded?: boolean;
  messMonthlyFee?: number;
  currency: string;
  description?: string;
  amenities: string[];
  houseRules?: string[];
  isVerified: boolean;
  isPublished: boolean;
  isFeatured: boolean;
  verificationStatus: 'DRAFT' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';
  rejectionReason?: string;
  isOperator?: boolean;
  operatorRole?: 'owner' | 'lease_holder' | 'property_manager' | 'authorized_operator';
  ownerInfo?: {
    fullName: string;
    phone: string;
    email: string;
    whatsapp?: string;
    relationship: 'owner' | 'manager' | 'representative';
    businessName?: string;
    pan?: string;
    gstin?: string;
  };
  primaryImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type PropertyDocument = HydratedDocument<IProperty>;

const propertySchema = new Schema<IProperty>(
  {
    host: { type: Schema.Types.ObjectId, ref: 'Host', required: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, trim: true, lowercase: true },
    propertyType: {
      type: String,
      enum: [
        'hotel',
        'pg',
        'hostel',
        'homestay',
        'guesthouse',
        'apartment',
        'villa',
        'studio',
        'house',
        'farmstay',
        'Hotel',
        'PG',
        'Hostel',
        'Homestay',
        'Guesthouse',
        'resort',
        'Resort',
      ],
      required: true,
    },
    category: {
      type: String,
      enum: ['stay', 'hostel', 'resort', 'homestay'],
      default: 'stay',
    },
    city: { type: String, trim: true },
    locality: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    address: { type: String, trim: true },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [73.0022, 19.0759],
      },
    },
    pinCode: { type: String, trim: true },
    contactEmail: { type: String, trim: true },
    contactPhone: { type: String, trim: true },
    bedrooms: { type: Number, default: 0, min: 0 },
    bathrooms: { type: Number, default: 0, min: 0 },
    maxGuests: { type: Number, default: 0, min: 0 },
    pricePerNight: { type: Number, default: 0, min: 0 },
    pricePerMonth: { type: Number, default: 0, min: 0 },
    isMonthlyAvailable: { type: Boolean, default: false },
    messIncluded: { type: Boolean, default: false },
    messMonthlyFee: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true, default: 'INR', uppercase: true },
    description: { type: String, trim: true, maxlength: 4000 },
    amenities: { type: [String], default: [] },
    houseRules: { type: [String], default: [] },
    isVerified: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ['DRAFT', 'PENDING_REVIEW', 'CHANGES_REQUESTED', 'VERIFIED', 'REJECTED', 'SUSPENDED'],
      default: 'DRAFT',
    },
    rejectionReason: { type: String, trim: true },
    isOperator: { type: Boolean, default: false },
    operatorRole: {
      type: String,
      enum: ['owner', 'lease_holder', 'property_manager', 'authorized_operator'],
      default: 'owner',
    },
    ownerInfo: {
      fullName: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, trim: true },
      whatsapp: { type: String, trim: true },
      relationship: { type: String, enum: ['owner', 'manager', 'representative'] },
      businessName: { type: String, trim: true },
      pan: { type: String, trim: true },
      gstin: { type: String, trim: true },
    },
    primaryImage: { type: String, trim: true },
  },
  { timestamps: true }
);

propertySchema.index({ host: 1, isPublished: 1 });
propertySchema.index({ city: 1, locality: 1, isPublished: 1 });
propertySchema.index({ pricePerNight: 1, maxGuests: 1 });
propertySchema.index({ isFeatured: 1, isPublished: 1 });
propertySchema.index({ slug: 1 }, { unique: true });
propertySchema.index({ location: '2dsphere' });

export const Property: Model<IProperty> = model<IProperty>('Property', propertySchema);
