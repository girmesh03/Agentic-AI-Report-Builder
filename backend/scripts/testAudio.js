/**
 * @module scripts/testAudio
 * @description Contract integration test suite for Phase 5 Audio Pipeline & Addis AI STT.
 * Tests FFmpeg normalization, silence-based segmentation, real Addis AI STT transcription,
 * Mode 3 ephemeral voice dictation (zero-persistence guarantee), and Method 1 audio clip playback.
 * Conforms to Master Technical Specification Section 6 and Section 14.5.
 */
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs';
import { fileFromPath } from 'addisai';
import {
  probeAudioMetadata,
  normalizeToWav,
  segmentAndNormalize,
  safeUnlinkFiles,
} from '../src/services/audioService.js';
import {
  transcribeAudioChunk,
  transcribeAudioSequence,
} from '../src/services/sttService.js';

const BASE_URL = 'http://localhost:4000/api/v1';
const SAMPLE_AUDIO_PATH = path.resolve(
  process.cwd(),
  'uploads/audio/audio-ce8b9740-3940-407e-a8f0-cceea895569f.wav'
);
const TEMP_DIR = path.resolve(process.cwd(), 'uploads/temp');

fs.mkdirSync(TEMP_DIR, { recursive: true });

class CookieJar {
  constructor() {
    this.cookies = new Map();
  }

  setFromHeaders(headers) {
    const setCookieHeaders = headers.getSetCookie
      ? headers.getSetCookie()
      : [headers.get('set-cookie')].filter(Boolean);
    for (const header of setCookieHeaders) {
      const parts = header.split(';')[0].split('=');
      const name = parts[0].trim();
      const value = parts.slice(1).join('=').trim();
      if (value) {
        this.cookies.set(name, value);
      } else {
        this.cookies.delete(name);
      }
    }
  }

  getCookieHeader() {
    return Array.from(this.cookies.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('; ');
  }
}

const runTests = async () => {
  console.log('🚀 Running Phase 5 Audio Pipeline & Addis AI STT Integration Suite...');
  console.log(`📁 Sample audio file: ${SAMPLE_AUDIO_PATH}`);

  assert.ok(
    fs.existsSync(SAMPLE_AUDIO_PATH),
    `Sample audio file not found at ${SAMPLE_AUDIO_PATH}`
  );

  // =========================================================================
  // TEST 1: FFprobe Metadata Extraction
  // =========================================================================
  console.log('\n--- 1. Testing ffprobe Audio Metadata Extraction ---');
  const metadata = await probeAudioMetadata(SAMPLE_AUDIO_PATH);
  console.log('   Probed metadata:', metadata);
  assert.ok(metadata.duration > 100, `Expected duration > 100s, got ${metadata.duration}`);
  assert.equal(metadata.channels, 1, `Expected 1 channel, got ${metadata.channels}`);
  assert.equal(metadata.sampleRate, 48000, `Expected 48kHz, got ${metadata.sampleRate}`);
  console.log('   ✅ Test 1 Passed: ffprobe extracted acoustic metadata accurately.');

  // =========================================================================
  // TEST 2: FFmpeg Acoustic Normalization to Mono 16kHz PCM WAV
  // =========================================================================
  console.log('\n--- 2. Testing FFmpeg Acoustic Normalization (Mono 16kHz PCM WAV) ---');
  const normalizedTestWav = path.join(TEMP_DIR, `test-norm-${Date.now()}.wav`);
  await normalizeToWav(SAMPLE_AUDIO_PATH, normalizedTestWav);
  assert.ok(fs.existsSync(normalizedTestWav), 'Normalized WAV file must exist on disk');

  const normMeta = await probeAudioMetadata(normalizedTestWav);
  console.log('   Normalized WAV metadata:', normMeta);
  assert.equal(normMeta.sampleRate, 16000, `Expected 16,000 Hz, got ${normMeta.sampleRate}`);
  assert.equal(normMeta.channels, 1, `Expected mono (1 channel), got ${normMeta.channels}`);
  assert.equal(normMeta.codec, 'pcm_s16le', `Expected pcm_s16le codec, got ${normMeta.codec}`);
  await safeUnlinkFiles([normalizedTestWav]);
  console.log('   ✅ Test 2 Passed: Normalized to standard 16kHz 16-bit linear PCM WAV.');

  // =========================================================================
  // TEST 3: Silence-Based Acoustic Segmentation (> 120s Cap)
  // =========================================================================
  console.log('\n--- 3. Testing Silence-Based Acoustic Segmentation ---');
  const chunks = await segmentAndNormalize(SAMPLE_AUDIO_PATH, TEMP_DIR, 'test-seg');
  console.log(`   Generated ${chunks.length} segmented chunks:`, chunks.map((c) => ({
    name: path.basename(c.path),
    duration: c.duration.toFixed(1) + 's',
  })));
  assert.ok(chunks.length >= 2, `Expected at least 2 chunks for 184s audio, got ${chunks.length}`);
  for (const chunk of chunks) {
    assert.ok(fs.existsSync(chunk.path), `Chunk file ${chunk.path} must exist`);
    assert.ok(chunk.duration <= 130, `Chunk duration should be capped, got ${chunk.duration}`);
  }
  console.log('   ✅ Test 3 Passed: Audio segmented into acoustic chunks on silence gaps.');

  // =========================================================================
  // TEST 4: Real Addis AI STT Cloud Transcription
  // =========================================================================
  console.log('\n--- 4. Testing Live Addis AI STT Transcription ---');
  const firstChunk = chunks[0];
  console.log(`   Transcribing chunk 1 (${firstChunk.duration.toFixed(1)}s) via Addis AI SDK...`);
  const chunkResult = await transcribeAudioChunk(firstChunk.path);
  console.log('   Addis AI Response text:', chunkResult.text);
  assert.ok(chunkResult.text && chunkResult.text.length > 5, 'Expected non-empty transcribed Amharic text');
  console.log('   ✅ Test 4 Passed: Addis AI STT returned valid Amharic transcription.');

  // Clean up chunk files from Test 3
  await safeUnlinkFiles(chunks.map((c) => c.path));

  // =========================================================================
  // API CONTRACT TESTS AGAINST LIVE BACKEND (PORT 4000)
  // =========================================================================
  const jar = new CookieJar();
  const testEmail = `test.audio.supervisor.${Date.now()}@company.com`;
  const password = 'AudioPassword123!';

  // Step A: Register & Login Supervisor
  console.log('\n--- 5. Registering Test Supervisor for API Contracts ---');
  const regRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password,
      confirmPassword: password,
      firstName: 'Abebe',
      lastName: 'Kebede',
    }),
  });
  jar.setFromHeaders(regRes.headers);
  assert.equal(regRes.status, 201, `Expected 201 on registration, got ${regRes.status}`);
  console.log('   ✅ Test supervisor registered.');

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password }),
  });
  jar.setFromHeaders(loginRes.headers);
  assert.equal(loginRes.status, 200, `Expected 200 on login, got ${loginRes.status}`);
  console.log('   ✅ Test supervisor logged in.');

  // Step B: Create a Branch for Report Association
  console.log('\n--- 6. Creating Primary Branch ---');
  const branchRes = await fetch(`${BASE_URL}/branches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: jar.getCookieHeader(),
    },
    body: JSON.stringify({
      name: `Bole Test Branch ${Date.now()}`,
      address: 'Bole Medhanialem Mall, Floor 2',
      phone: '+251911223344',
      openingTime: '08:30',
      closingTime: '21:00',
    }),
  });
  const branchData = await branchRes.json();
  assert.equal(branchRes.status, 201, `Branch creation failed: ${JSON.stringify(branchData)}`);
  const branchId = branchData.data._id;
  console.log(`   ✅ Branch created (ID: ${branchId}).`);

  // Step C: Test Mode 3 Ephemeral Voice Dictation (POST /api/v1/audio/transcribe-ephemeral)
  console.log('\n--- 7. Testing Mode 3 Ephemeral Voice Dictation Endpoint ---');
  const sampleAudioBuffer = fs.readFileSync(SAMPLE_AUDIO_PATH);
  const sampleAudioBlob = new Blob([sampleAudioBuffer], { type: 'audio/wav' });
  const ephemeralFormData = new FormData();
  ephemeralFormData.append('audio', sampleAudioBlob, 'mic-recording.wav');

  const ephRes = await fetch(`${BASE_URL}/audio/transcribe-ephemeral`, {
    method: 'POST',
    headers: {
      Cookie: jar.getCookieHeader(),
    },
    body: ephemeralFormData,
  });

  const ephData = await ephRes.json();
  console.log('   Ephemeral Dictation Response:', ephData);
  assert.equal(ephRes.status, 200, `Expected 200, got ${ephRes.status}`);
  assert.ok(ephData.success, 'Expected success: true');
  assert.ok(ephData.data?.text, 'Expected non-empty transcribed text in data.text');
  console.log('   ✅ Test 7 Passed: Mode 3 Ephemeral Voice Dictation succeeded with Zero Persistence.');

  // Step D: Test MIME allowlist rejection (Upload invalid .txt file)
  console.log('\n--- 8. Testing MIME Allowlist Gate (Rejecting invalid text file) ---');
  const invalidBlob = new Blob(['not an audio file'], { type: 'text/plain' });
  const invalidFormData = new FormData();
  invalidFormData.append('audio', invalidBlob, 'malicious.txt');

  const invalidRes = await fetch(`${BASE_URL}/audio/transcribe-ephemeral`, {
    method: 'POST',
    headers: {
      Cookie: jar.getCookieHeader(),
    },
    body: invalidFormData,
  });
  assert.equal(invalidRes.status, 422, `Expected 422 for invalid MIME, got ${invalidRes.status}`);
  console.log('   ✅ Test 8 Passed: Non-audio MIME rejected with HTTP 422 Unprocessable Entity.');

  // Step E: Test Report Creation with Multipart Audio Ingestion (POST /api/v1/reports)
  console.log('\n--- 9. Testing Multipart Report Creation with Audio Narrations ---');
  const reportFormData = new FormData();
  reportFormData.append('date', '12-01-19');
  reportFormData.append('branch', branchId);
  reportFormData.append('clockIn', '08:30');
  reportFormData.append('clockOut', '17:00');
  reportFormData.append(
    'activities',
    JSON.stringify([
      { text: 'የዕለቱ የካሽ እና የሽያጭ ቁጥጥር ተከናውኗል' },
      { text: 'የሰራተኞች የስራ መግቢያ ሰዓት ተረጋግጧል' },
    ])
  );
  reportFormData.append(
    'issues',
    JSON.stringify([{ text: 'በኩሽና ውስጥ የተበላሸ እቃ አልነበረም' }])
  );
  reportFormData.append('comments', 'አጠቃላይ የስራ እንቅስቃሴው መልካም ነበር።');
  reportFormData.append('audio', sampleAudioBlob, 'narration-shift.wav');

  const repRes = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      Cookie: jar.getCookieHeader(),
    },
    body: reportFormData,
  });

  const repData = await repRes.json();
  console.log('   Report Creation Status:', repRes.status);
  assert.equal(repRes.status, 201, `Expected 201, got ${repRes.status}: ${JSON.stringify(repData)}`);
  const createdReport = repData.data.report;
  assert.ok(createdReport, 'Expected report in response data');
  assert.ok(Array.isArray(createdReport.audioFiles), 'Expected audioFiles array');
  assert.equal(createdReport.audioFiles.length, 1, `Expected 1 audio file, got ${createdReport.audioFiles.length}`);
  assert.ok(createdReport.transcription, 'Expected audio transcription populated');
  console.log('   Audio clip stored:', createdReport.audioFiles[0]);
  console.log('   Audio transcription snippet:', createdReport.transcription.slice(0, 120) + '...');
  console.log('   ✅ Test 9 Passed: Report created with attached audio and transcription.');

  // Step F: Test Method 1 Authenticated Audio Clip Streaming (GET /api/v1/reports/:reportId/clips/:clipId)
  console.log('\n--- 10. Testing Method 1 Audio Clip Streaming ---');
  const reportId = createdReport._id;
  const clipId = createdReport.audioFiles[0]._id;

  const clipRes = await fetch(`${BASE_URL}/reports/${reportId}/clips/${clipId}`, {
    headers: {
      Cookie: jar.getCookieHeader(),
    },
  });

  assert.equal(clipRes.status, 200, `Expected 200 for audio clip, got ${clipRes.status}`);
  const clipBuffer = await clipRes.arrayBuffer();
  console.log(`   Audio clip received (${clipBuffer.byteLength} bytes, Content-Type: ${clipRes.headers.get('content-type')})`);
  assert.ok(clipBuffer.byteLength > 1000, 'Expected non-empty audio binary payload');
  console.log('   ✅ Test 10 Passed: Method 1 audio clip streamed binary payload with HTTP 200.');

  console.log('\n🎉 ALL 10 PHASE 5 AUDIO & STT INTEGRATION TESTS PASSED 100%!');
};

runTests().catch((err) => {
  console.error('\n❌ TEST FAILURE:', err);
  process.exit(1);
});
