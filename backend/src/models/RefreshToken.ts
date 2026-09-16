import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  device?: string;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tokenHash: { type: String, required: true },
  familyId: { type: String, required: true },
  expiresAt: { type: Date, required: true },
  revokedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  device: { type: String },
});

// Index to automatically delete expired tokens from DB (TTL Index)
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// Index to quickly look up active families for a user
RefreshTokenSchema.index({ userId: 1, familyId: 1 });

export const RefreshToken: Model<IRefreshToken> =
  (mongoose.models && mongoose.models.RefreshToken) || mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
