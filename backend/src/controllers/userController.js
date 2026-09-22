/**
 * @module controllers/userController
 * @description HTTP controllers for user self-service profile, avatar, password, and account deletion.
 */
import asyncHandler from 'express-async-handler';
import * as userService from '../services/userService.js';
import { clearAuthCookies } from '../utils/token.js';
import { BadRequestError } from '../errors/index.js';
import { HTTP_STATUS } from '../config/httpStatus.js';

/**
 * Retrieves the current supervisor's profile.
 * @function getProfileHandler
 */
export const getProfileHandler = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user._id);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'User profile retrieved successfully',
    data: user,
  });
});

/**
 * Updates allowed profile fields.
 * @function updateProfileHandler
 */
export const updateProfileHandler = asyncHandler(async (req, res) => {
  const updatedUser = await userService.updateProfile(req.user._id, req.validated.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Profile updated successfully',
    data: updatedUser,
  });
});

/**
 * Handles avatar image upload, Sharp processing, and persistence.
 * @function uploadAvatarHandler
 */
export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError('Avatar image file is required');
  }

  const result = await userService.updateAvatar(req.user._id, req.file.buffer);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Avatar uploaded successfully',
    data: result,
  });
});

/**
 * Handles supervisor password change.
 * @function changePasswordHandler
 */
export const changePasswordHandler = asyncHandler(async (req, res) => {
  await userService.changePassword(req.user._id, req.validated.body);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Password changed successfully',
    data: null,
  });
});

/**
 * Handles self-service permanent account deletion.
 * @function deleteAccountHandler
 */
export const deleteAccountHandler = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.user._id, req.validated?.body?.confirmation);

  clearAuthCookies(res);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Account deleted successfully',
    data: null,
  });
});
