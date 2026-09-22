/**
 * @module middlewares/uploadMiddleware
 * @description Multer multipart ingestion middleware with strict MIME allowlists,
 * cryptographic filename sanitization, and 25MB file boundaries.
 * Conforms to Master Technical Specification Section 6.2.
 */
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { UnprocessableEntityError } from '../errors/index.js';

// Ensure required upload directories exist at module initialization
const AUDIO_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/audio');
const TEMP_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads/temp');

fs.mkdirSync(AUDIO_UPLOAD_DIR, { recursive: true });
fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });

/**
 * 7 strict audio MIME types permitted for ingestion.
 */
const ALLOWED_MIME_TYPES = new Set([
  'audio/webm',
  'audio/wav',
  'audio/x-wav',
  'audio/wave',
  'audio/mp3',
  'audio/mpeg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/mp4',
  'audio/ogg',
  'audio/aac',
]);

/**
 * Common file extensions matching the permitted audio types.
 */
const ALLOWED_EXTENSIONS = new Set([
  '.webm',
  '.wav',
  '.mp3',
  '.m4a',
  '.ogg',
  '.aac',
  '.mp4',
]);

/**
 * Multer disk storage configuration with cryptographic filename sanitization.
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // If route is ephemeral dictation, route to temp dir, else persistent audio dir
    const dest = req.path.includes('ephemeral') ? TEMP_UPLOAD_DIR : AUDIO_UPLOAD_DIR;
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    const rawExt = path.extname(file.originalname).toLowerCase();
    const ext = ALLOWED_EXTENSIONS.has(rawExt) ? rawExt : '.wav';
    const randomBytes = crypto.randomBytes(8).toString('hex');
    const prefix = req.path.includes('ephemeral') ? 'ephemeral' : 'narration';
    cb(null, `${prefix}-${Date.now()}-${randomBytes}${ext}`);
  },
});

/**
 * Multer file filter enforcing strict 7-format MIME allowlist.
 */
const fileFilter = (req, file, cb) => {
  const mime = (file.mimetype || '').toLowerCase();
  const ext = path.extname(file.originalname || '').toLowerCase();

  if (ALLOWED_MIME_TYPES.has(mime) || ALLOWED_EXTENSIONS.has(ext)) {
    cb(null, true);
  } else {
    cb(
      new UnprocessableEntityError(
        'Invalid audio file format. Allowed formats: webm, wav, mp3, m4a, ogg, aac.'
      ),
      false
    );
  }
};

/**
 * Multer instance configured for report creation (up to 10 files, 25MB each).
 */
export const uploadAudioFiles = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max per file
    files: 10, // Max 10 files
  },
}).array('audio', 10);

/**
 * Multer instance configured for single audio file ingestion (ephemeral dictation, 25MB max).
 */
export const uploadSingleAudio = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB max
    files: 1,
  },
}).single('audio');
