/**
 * @module routes/audioRoutes
 * @description Express routing definition for audio endpoints.
 * Mounted at /api/v1/audio.
 */
import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { uploadSingleAudio } from '../middlewares/uploadMiddleware.js';
import * as audioController from '../controllers/audioController.js';

const router = Router();

// Mode 3 Ephemeral Voice Dictation requires valid user authentication
router.use(authenticate);

router.post(
  '/transcribe-ephemeral',
  uploadSingleAudio,
  audioController.transcribeEphemeralHandler
);

export default router;
