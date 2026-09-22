/**
 * @module models/RefreshToken
 * @description Refresh token entity for RFC 6819 token family rotation and theft detection.
 */
import mongoose, { Schema } from 'mongoose';
import { COLLECTIONS } from '../utils/constants.js';

const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Refresh token must belong to a user'],
    },
    tokenHash: {
      type: String,
      required: [true, 'Token hash is required'], // SHA-256 digest of raw refresh token
    },
    family: {
      type: String,
      required: [true, 'Token family identifier is required'], // Cryptographic UUIDv4 family identifier
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration timestamp is required'], // Set to 7 days from creation
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        delete ret.tokenHash;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        delete ret.tokenHash;
        return ret;
      },
    },
  }
);

// Schema-level indexes
refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ family: 1 });
refreshTokenSchema.index({ user: 1 });

// The SOLE TTL index in the entire database: Automatically purges expired sessions
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema, COLLECTIONS.REFRESH_TOKENS);
export default RefreshToken;
