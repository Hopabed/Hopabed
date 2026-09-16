import { Schema, model, type HydratedDocument, type Model, Types } from 'mongoose';

export interface IGrievance {
  ticketId: string;
  user?: Types.ObjectId;
  contactEmail: string;
  subject: string;
  description: string;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'closed';
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type GrievanceDocument = HydratedDocument<IGrievance>;

const grievanceSchema = new Schema<IGrievance>(
  {
    ticketId: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    contactEmail: { type: String, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ['open', 'acknowledged', 'in_progress', 'resolved', 'closed'],
      default: 'open',
    },
    acknowledgedAt: { type: Date },
    resolvedAt: { type: Date },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Grievance: Model<IGrievance> = model<IGrievance>('Grievance', grievanceSchema);
