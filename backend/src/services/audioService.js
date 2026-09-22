/**
 * @module services/audioService
 * @description Native FFmpeg and FFprobe audio normalization and acoustic segmentation pipeline.
 * Converts uploaded multi-modal audio into standardized mono 16-bit 16kHz PCM WAV format.
 * Implements silence-based acoustic segmentation for clips > 120s or > 25MB to prevent word clipping.
 * Conforms to Master Technical Specification Section 6.3.
 */
import { execFile } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { promisify } from 'node:util';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { BadRequestError } from '../errors/index.js';

const execFileAsync = promisify(execFile);

/**
 * Resolved system executable paths for ffmpeg and ffprobe.
 */
const FFMPEG_BIN = env.FFMPEG_PATH || 'ffmpeg';
const FFPROBE_BIN = env.FFPROBE_PATH || 'ffprobe';

/**
 * Probes an audio file using ffprobe to extract acoustic characteristics.
 *
 * @param {string} filePath - Absolute path to audio file on disk.
 * @returns {Promise<{ duration: number, sampleRate: number, channels: number, codec: string, format: string, size: number }>}
 */
export const probeAudioMetadata = async (filePath) => {
  try {
    const args = [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ];

    const { stdout } = await execFileAsync(FFPROBE_BIN, args);
    const metadata = JSON.parse(stdout);

    const audioStream = (metadata.streams || []).find((s) => s.codec_type === 'audio');
    const format = metadata.format || {};

    return {
      duration: parseFloat(format.duration || audioStream?.duration || 0),
      sampleRate: parseInt(audioStream?.sample_rate || 16000, 10),
      channels: parseInt(audioStream?.channels || 1, 10),
      codec: audioStream?.codec_name || 'unknown',
      format: format.format_name || 'unknown',
      size: parseInt(format.size || 0, 10),
    };
  } catch (err) {
    logger.error(`[audioService] ffprobe failure on ${filePath}: ${err.message}`);
    throw new BadRequestError(`Failed to probe audio metadata: ${err.message}`);
  }
};

/**
 * Normalizes an audio file to standardized mono 16-bit 16kHz linear PCM WAV format.
 * Optimal acoustic configuration for Addis AI Speech-to-Text Amharic models.
 *
 * @param {string} inputPath - Path to raw ingested audio file.
 * @param {string} outputPath - Destination path for normalized WAV.
 * @returns {Promise<string>} Output WAV file path.
 */
export const normalizeToWav = async (inputPath, outputPath) => {
  try {
    const args = [
      '-i', inputPath,
      '-y',
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'pcm_s16le',
      '-f', 'wav',
      outputPath,
    ];

    await execFileAsync(FFMPEG_BIN, args);
    return outputPath;
  } catch (err) {
    logger.error(`[audioService] ffmpeg normalization failure: ${err.message}`);
    throw new BadRequestError(`Audio normalization failed: ${err.message}`);
  }
};

/**
 * Detects silence intervals in an audio file using FFmpeg's silencedetect filter.
 *
 * @param {string} inputPath - Path to audio file.
 * @param {number} [noiseThresholdDb=-30] - Noise gate in dB.
 * @param {number} [minDurationSec=0.5] - Minimum silence duration in seconds.
 * @returns {Promise<Array<{ start: number, end: number }>>} Array of detected silence intervals.
 */
export const detectSilences = async (inputPath, noiseThresholdDb = -30, minDurationSec = 0.5) => {
  try {
    const args = [
      '-i', inputPath,
      '-af', `silencedetect=noise=${noiseThresholdDb}dB:d=${minDurationSec}`,
      '-f', 'null',
      '-',
    ];

    // FFmpeg logs silencedetect output to stderr
    let stderrOutput = '';
    try {
      await execFileAsync(FFMPEG_BIN, args);
    } catch (ffmpegProc) {
      // ffmpeg exits with code 0 on null output, but if it emits to stderr execFile might catch it
      stderrOutput = ffmpegProc.stderr || '';
    }

    const silences = [];
    const startRegex = /silence_start:\s*([0-9.]+)/g;
    const endRegex = /silence_end:\s*([0-9.]+)/g;

    const starts = [];
    let match;
    while ((match = startRegex.exec(stderrOutput)) !== null) {
      starts.push(parseFloat(match[1]));
    }

    const ends = [];
    while ((match = endRegex.exec(stderrOutput)) !== null) {
      ends.push(parseFloat(match[1]));
    }

    for (let i = 0; i < Math.min(starts.length, ends.length); i += 1) {
      silences.push({ start: starts[i], end: ends[i] });
    }

    return silences;
  } catch (err) {
    logger.warn(`[audioService] Silence detection warning: ${err.message}. Proceeding without silence map.`);
    return [];
  }
};

/**
 * Segments an audio file into standardized 16kHz PCM WAV chunks on natural speech pauses
 * if duration exceeds 120 seconds or file size exceeds 25MB.
 *
 * @param {string} inputPath - Path to input audio file.
 * @param {string} outputDir - Directory to store generated chunks.
 * @param {string} baseName - Base identifier for chunk naming.
 * @returns {Promise<Array<{ path: string, duration: number }>>} Array of generated WAV chunk objects.
 */
export const segmentAndNormalize = async (inputPath, outputDir, baseName = 'chunk') => {
  const metadata = await probeAudioMetadata(inputPath);
  const totalDuration = metadata.duration;
  const MAX_CHUNK_LIMIT_SEC = 55;
  const TARGET_CHUNK_SEC = 50;

  // Single chunk scenario: <= 55s and <= 25MB
  if (totalDuration <= MAX_CHUNK_LIMIT_SEC && metadata.size <= 25 * 1024 * 1024) {
    const outputPath = path.join(outputDir, `${baseName}-normalized.wav`);
    await normalizeToWav(inputPath, outputPath);
    const normalizedMeta = await probeAudioMetadata(outputPath);
    return [{ path: outputPath, duration: normalizedMeta.duration }];
  }

  // Multi-chunk scenario: duration > 55s or size > 25MB
  logger.info(`[audioService] Audio duration (${totalDuration}s) exceeds 55s Addis AI cap. Executing silence-based segmentation.`);
  const silences = await detectSilences(inputPath);

  // Calculate cut points near 45–55 second intervals
  const cutPoints = [];
  let lastCut = 0;

  while (lastCut + TARGET_CHUNK_SEC < totalDuration) {
    const idealCut = lastCut + TARGET_CHUNK_SEC;
    // Find closest silence pause within [idealCut - 8, idealCut + 4]
    const suitableSilence = silences.find(
      (s) => s.start >= idealCut - 8 && s.end <= idealCut + 4
    );

    let nextCut = idealCut;
    if (suitableSilence) {
      nextCut = (suitableSilence.start + suitableSilence.end) / 2;
    }

    cutPoints.push({ start: lastCut, end: nextCut });
    lastCut = nextCut;
  }

  // Append remaining tail chunk
  if (lastCut < totalDuration) {
    const rem = totalDuration - lastCut;
    if (rem > MAX_CHUNK_LIMIT_SEC) {
      const mid = lastCut + rem / 2;
      cutPoints.push({ start: lastCut, end: mid });
      cutPoints.push({ start: mid, end: totalDuration });
    } else {
      cutPoints.push({ start: lastCut, end: totalDuration });
    }
  }

  const generatedChunks = [];
  for (let i = 0; i < cutPoints.length; i += 1) {
    const { start, end } = cutPoints[i];
    const chunkDuration = end - start;
    const chunkPath = path.join(
      outputDir,
      `${baseName}-chunk-${String(i + 1).padStart(3, '0')}.wav`
    );

    const args = [
      '-ss', start.toFixed(2),
      '-to', end.toFixed(2),
      '-i', inputPath,
      '-y',
      '-vn',
      '-ac', '1',
      '-ar', '16000',
      '-c:a', 'pcm_s16le',
      '-f', 'wav',
      chunkPath,
    ];

    await execFileAsync(FFMPEG_BIN, args);
    generatedChunks.push({ path: chunkPath, duration: chunkDuration });
  }

  logger.info(`[audioService] Successfully segmented ${inputPath} into ${generatedChunks.length} chunks.`);
  return generatedChunks;
};

/**
 * Safely unlinks a list of files from disk with error suppression.
 *
 * @param {string[]} filePaths - Array of file paths to remove.
 * @returns {Promise<void>}
 */
export const safeUnlinkFiles = async (filePaths = []) => {
  for (const fPath of filePaths) {
    if (fPath && typeof fPath === 'string') {
      try {
        await fs.promises.unlink(fPath);
      } catch (err) {
        logger.debug(`[audioService] Safe unlink ignored error for ${fPath}: ${err.message}`);
      }
    }
  }
};
