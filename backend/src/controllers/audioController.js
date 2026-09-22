/**
 * @module controllers/audioController
 * @description Controller for audio processing and Mode 3 ephemeral dictation.
 * Enforces the Zero-Persistence Guarantee with guaranteed post-response file unlinking.
 * Conforms to Master Technical Specification Section 6.5.
 */
import path from 'node:path';
import asyncHandler from 'express-async-handler';
import { safeUnlinkFiles } from '../services/audioService.js';
import { transcribeAudioSequence } from '../services/sttService.js';
import { HTTP_STATUS } from '../config/httpStatus.js';
import { BadRequestError } from '../errors/index.js';
import { logger } from '../config/logger.js';

/**
 * Handles Mode 3 Ephemeral Voice Dictation directly into chat composer.
 * Converts uploaded audio to 16kHz WAV (segmenting if > 55s), transcribes via Addis AI STT,
 * and immediately unlinks all temporary disk files in a finally block.
 *
 * @route POST /api/v1/audio/transcribe-ephemeral
 */
export const transcribeEphemeralHandler = asyncHandler(async (req, res) => {
  const tempPath = req.file?.path;

  if (!tempPath) {
    throw new BadRequestError('No audio file provided for transcription');
  }

  const tempDir = path.resolve(process.cwd(), 'uploads/temp');

  try {
    // Synchronous transcription via Addis AI STT with acoustic normalization
    const { fullTranscript } = await transcribeAudioSequence(
      [{ path: tempPath, originalName: req.file.originalname }],
      tempDir
    );

    logger.info(`[audioController] Ephemeral audio successfully transcribed (${fullTranscript.length} chars).`);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Audio transcribed successfully',
      data: {
        text: fullTranscript,
      },
    });
  } finally {
    // Zero-Persistence Guarantee: permanently remove ephemeral uploaded file from disk
    await safeUnlinkFiles([tempPath]);
  }
});
