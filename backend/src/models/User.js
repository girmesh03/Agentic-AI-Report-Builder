/**
 * @module models/User
 * @description Mongoose schema and model definition for User entity.
 */
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { BCRYPT_CONFIG, USER_ROLES } from '../utils/constants.js';

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      select: false,
      minlength: [BCRYPT_CONFIG.MIN_PASSWORD_LENGTH, `Password must be at least ${BCRYPT_CONFIG.MIN_PASSWORD_LENGTH} characters long`],
    },
    position: {
      type: String,
      default: USER_ROLES.DEFAULT_POSITION,
      trim: true,
    },
    phone: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null, // Stored relative path: 'uploads/avatars/<filename>'
    },
    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.id; // Enforces strict _id convention
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtual full name accessor
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`.trim();
});

// Schema-level indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ googleId: 1 }, { sparse: true });

// Pre-save password hashing hook (10 rounds bcrypt)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(BCRYPT_CONFIG.SALT_ROUNDS);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares candidate plain text password with stored bcrypt hash.
 * @function comparePassword
 * @param {string} candidatePassword - Plain text candidate password.
 * @returns {Promise<boolean>} True if match, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
