/**
 * @module services/userService
 * @description User profile management, avatar image processing with Sharp,
 * password mutation, and self-service account deletion cascade.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import mongoose from 'mongoose';
import sharp from 'sharp';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { AVATAR_CONFIG, COLLECTIONS, ACCOUNT_DELETION_SENTINEL } from '../utils/constants.js';

/**
 * Retrieves the current supervisor's profile.
 * @function getProfile
 * @param {string} userId - Current user MongoDB ObjectId.
 * @returns {Promise<object>} User object without sensitive data.
 */
export const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User profile not found');
  }
  return user.toObject();
};

/**
 * Updates allowed profile fields (name, phone, position).
 * @function updateProfile
 * @param {string} userId - User ID.
 * @param {object} updates - Fields to update.
 * @returns {Promise<object>} Updated user profile.
 */
export const updateProfile = async (userId, { fullName, phone, position }) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (fullName !== undefined) {
    const parts = fullName.trim().split(/\s+/);
    user.firstName = parts[0] || user.firstName;
    user.lastName = parts.slice(1).join(' ') || parts[0] || user.lastName;
  }

  if (phone !== undefined) {
    user.phone = phone ? phone.trim() : null;
  }

  if (position !== undefined) {
    user.position = position.trim();
  }

  await user.save();
  return user.toObject();
};

/**
 * Standardizes uploaded image to a 400x400 WebP square avatar via Sharp and saves to uploads/avatars/.
 * @function updateAvatar
 * @param {string} userId - User ID.
 * @param {Buffer} fileBuffer - In-memory image buffer.
 * @returns {Promise<{ avatarUrl: string }>}
 */
export const updateAvatar = async (userId, fileBuffer) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const avatarsDir = fileURLToPath(new URL('../../uploads/avatars', import.meta.url));
  fs.mkdirSync(avatarsDir, { recursive: true });

  const fileName = `${userId}.${AVATAR_CONFIG.OUTPUT_FORMAT}`;
  const relativePath = `uploads/avatars/${fileName}`;
  const fullPath = path.join(avatarsDir, fileName);

  await sharp(fileBuffer)
    .resize(AVATAR_CONFIG.OUTPUT_WIDTH, AVATAR_CONFIG.OUTPUT_HEIGHT, { fit: 'cover', position: 'center' })
    .webp({ quality: AVATAR_CONFIG.OUTPUT_QUALITY })
    .toFile(fullPath);

  user.avatar = relativePath;
  await user.save();

  return { avatarUrl: '/api/v1/auth/avatar' };
};

/**
 * Changes user password, verifies current password, and revokes all active refresh tokens.
 * @function changePassword
 * @param {string} userId - User ID.
 * @param {object} params
 * @param {string} params.currentPassword - Current plain text password.
 * @param {string} params.newPassword - New plain text password.
 * @returns {Promise<void>}
 */
export const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const isValid = await user.comparePassword(currentPassword);
  if (!isValid) {
    throw new BadRequestError('Current password is incorrect');
  }

  user.password = newPassword;
  await user.save();

  // Invalidate all active sessions across all devices for security
  await RefreshToken.updateMany({ user: userId }, { isRevoked: true });
};

/**
 * Permanently deletes the supervisor account and cascades hard deletion across all user-scoped collections in a transaction.
 * @function deleteAccount
 * @param {string} userId - User ID.
 * @returns {Promise<void>}
 */
export const deleteAccount = async (userId, confirmation) => {
  if (confirmation !== undefined && confirmation !== ACCOUNT_DELETION_SENTINEL) {
    throw new BadRequestError(`Explicit confirmation "${ACCOUNT_DELETION_SENTINEL}" is required`);
  }
  const userObjectId = new mongoose.Types.ObjectId(userId);

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // 1. Delete user record
      await User.deleteOne({ _id: userObjectId }, { session });

      // 2. Delete refresh tokens
      await RefreshToken.deleteMany({ user: userObjectId }, { session });

      // 3. Cascade delete across all remaining user-scoped collections
      const scopedCollections = [
        COLLECTIONS.BRANCHES,
        COLLECTIONS.REPORTS,
        COLLECTIONS.AUDIO_CLIPS,
        COLLECTIONS.CHATS,
        COLLECTIONS.MESSAGES,
        COLLECTIONS.PRESETS,
      ];
      for (const collName of scopedCollections) {
        try {
          await mongoose.connection.collection(collName).deleteMany({ user: userObjectId }, { session });
        } catch {
          // Collection may not exist yet in early development phases
        }
      }
    });
  } finally {
    session.endSession();
  }

  // Asynchronously clean up avatar from disk
  const avatarsDir = fileURLToPath(new URL('../../uploads/avatars', import.meta.url));
  const avatarPath = path.join(avatarsDir, `${userId}.${AVATAR_CONFIG.OUTPUT_FORMAT}`);
  if (fs.existsSync(avatarPath)) {
    try {
      fs.unlinkSync(avatarPath);
    } catch {
      // Ignore filesystem errors during cleanup
    }
  }
};
