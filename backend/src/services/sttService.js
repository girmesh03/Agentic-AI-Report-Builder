/**
 * @module services/sttService
 * @description Official Addis AI Speech-to-Text (STT) integration service.
 * Performs synchronous Amharic audio transcription, exponential backoff retries,
 * sequential multi-chunk concatenation, and acoustic quality gate enforcement.
 * Conforms to Master Technical Specification Section 6.4.
 */
import path from 'node:path';
import fs from 'node:fs';
import { AddisAI, fileFromPath } from 'addisai';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { BadRequestError } from '../errors/index.js';
import {
  probeAudioMetadata,
  segmentAndNormalize,
  safeUnlinkFiles,
} from './audioService.js';

/**
 * Addis AI official client singleton.
 */
const addisClient = new AddisAI({
  apiKey: env.ADDIS_AI_API_KEY,
});

/**
 * Helper to delay execution for exponential backoff.
 *
 * @param {number} ms - Milliseconds to sleep.
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Transcribes a single normalized 16kHz PCM WAV audio file synchronously using Addis AI STT.
 * Implements bounded timeout and 3-tier exponential backoff retries.
 *
 * @param {string} wavPath - Path to normalized WAV file.
 * @param {number} [attempt=1] - Current retry attempt.
 * @returns {Promise<{ text: string, confidence: number|null }>}
 */
export const transcribeAudioChunk = async (wavPath, attempt = 1) => {
  const MAX_ATTEMPTS = 3;
  const timeoutMs = env.AI_TIMEOUT_MS || 25000;

  try {
    const audioBlob = await fileFromPath(wavPath);

    // Call Addis AI speech.transcribe
    const result = await addisClient.speech.transcribe(
      {
        audio: audioBlob,
        language: 'am',
      },
      {
        timeout: timeoutMs,
      }
    );

    const transcribedText = (result.text || '').trim();
    return {
      text: transcribedText,
      confidence: result.confidence ?? null,
    };
  } catch (err) {
    const isRetryable =
      err.status === 429 ||
      (err.status >= 500 && err.status <= 599) ||
      err.name === 'APIConnectionTimeoutError' ||
      err.name === 'APIConnectionError' ||
      err.code === 'ECONNRESET' ||
      err.code === 'ETIMEDOUT';

    if (isRetryable && attempt < MAX_ATTEMPTS) {
      const delayMs = Math.pow(2, attempt - 1) * 1000; // 1s, 2s, 4s
      logger.warn(
        `[sttService] Addis AI STT attempt ${attempt} failed (${err.message}). Retrying in ${delayMs}ms...`
      );
      await sleep(delayMs);
      return transcribeAudioChunk(wavPath, attempt + 1);
    }

    logger.error(`[sttService] Addis AI STT terminal failure on attempt ${attempt}: ${err.message}`);
    throw new BadRequestError(`Speech-to-Text transcription failed: ${err.message}`);
  }
};

/**
 * Transcribes an array of uploaded audio files or a single recording,
 * executing FFmpeg acoustic normalization, silence segmentation, sequential transcription,
 * and chronological text concatenation.
 *
 * @param {Array<{ path: string, originalName?: string }>} audioFiles - Array of uploaded files.
 * @param {string} tempDir - Destination directory for temporary normalized chunks.
 * @returns {Promise<{ fullTranscript: string, totalDuration: number, chunksCount: number }>}
 */
export const transcribeAudioSequence = async (audioFiles, tempDir) => {
  if (!audioFiles || audioFiles.length === 0) {
    return { fullTranscript: '', totalDuration: 0, chunksCount: 0 };
  }

  const allChunkPathsToClean = [];
  const transcripts = [];
  let cumulativeDuration = 0;

  try {
    for (let fIdx = 0; fIdx < audioFiles.length; fIdx += 1) {
      const file = audioFiles[fIdx];
      const basePrefix = `norm-${Date.now()}-f${fIdx}`;

      // Segment and normalize file into 16kHz WAV chunks
      const chunks = await segmentAndNormalize(file.path, tempDir, basePrefix);
      for (const chunk of chunks) {
        allChunkPathsToClean.push(chunk.path);
        cumulativeDuration += chunk.duration;

        logger.info(
          `[sttService] Transcribing audio chunk (${chunk.duration.toFixed(1)}s): ${path.basename(chunk.path)}`
        );
        const { text } = await transcribeAudioChunk(chunk.path);
        if (text) {
          transcripts.push(text);
        }
      }
    }

    const fullTranscript = transcripts.join(' ').trim();

    // Acoustic Quality Gate: check if audio produced zero linguistic tokens
    if (!fullTranscript && cumulativeDuration > 2) {
      logger.warn('[sttService] Acoustic Quality Gate: Audio produced empty transcript.');
    }

    return {
      fullTranscript,
      totalDuration: Math.round(cumulativeDuration * 10) / 10,
      chunksCount: allChunkPathsToClean.length,
    };
  } finally {
    // Ensure temporary normalized chunks are always removed
    await safeUnlinkFiles(allChunkPathsToClean);
  }
};
