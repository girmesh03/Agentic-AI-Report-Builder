/**
 * @module middlewares/uploadAvatar
 * @description Multer configuration for secure supervisor profile avatar uploads in memory.
 */
import multer from 'multer';
import { BadRequestError } from '../errors/index.js';
import { AVATAR_CONFIG } from '../utils/constants.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (AVATAR_CONFIG.ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Invalid file type. Allowed formats: JPEG, PNG, WebP.'), false);
  }
};

export const uploadAvatar = multer({
  storage,
  limits: {
    fileSize: AVATAR_CONFIG.MAX_SIZE_BYTES,
    files: 1,
  },
  fileFilter,
});

export default uploadAvatar;
