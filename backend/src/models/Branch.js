/**
 * @module models/Branch
 * @description Company branch location scoped per user with duplicate-name collision prevention.
 */
import mongoose, { Schema } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';
import { BRANCH_CONFIG } from '../utils/constants.js';

const branchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Branch must belong to a user'],
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
      maxlength: [BRANCH_CONFIG.NAME_MAX_LENGTH, `Branch name cannot exceed ${BRANCH_CONFIG.NAME_MAX_LENGTH} characters`],
    },
    normalizedName: {
      type: String,
      required: [true, 'Normalized branch name is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    address: {
      type: String,
      default: null,
      trim: true,
      maxlength: [BRANCH_CONFIG.ADDRESS_MAX_LENGTH, `Address cannot exceed ${BRANCH_CONFIG.ADDRESS_MAX_LENGTH} characters`],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

// Schema-level compound indexes
branchSchema.index({ user: 1, normalizedName: 1 }, { unique: true });
branchSchema.index({ user: 1, isArchived: 1 });
branchSchema.index({ user: 1, createdAt: -1 });

branchSchema.plugin(mongoosePaginate);

export const Branch = mongoose.model('Branch', branchSchema);
export default Branch;
