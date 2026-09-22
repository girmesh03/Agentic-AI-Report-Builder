/**
 * @module components/reusable/MuiRecorder
 * @description Advanced audio recording component with Web Audio API real-time acoustic visualizer,
 * silence guardrails, 120s timer countdown with amber warning threshold, and cross-browser MediaRecorder.
 * Supports Mode 1/2 Multi-Modal Report Ingestion and Mode 3 Ephemeral Dictation.
 * Conforms to Master Technical Specification Section 6.1–6.5.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import MicIcon from '@mui/icons-material/MicRounded';
import StopIcon from '@mui/icons-material/StopRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';

/**
 * Formats seconds to mm:ss.
 *
 * @param {number} sec - Time in seconds.
 * @returns {string} Formatted string.
 */
const formatTime = (sec) => {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

export const MuiRecorder = ({
  onRecordingComplete,
  maxDuration = 900,
  warningThreshold = 840,
  disabled = false,
  compact = false,
  label = 'ድምፅ ይቅረጹ (Record Narration)',
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [errorMessage, setErrorMessage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animFrameRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const chunksRef = useRef([]);
  const maxRmsRef = useRef(0);
  const startTimeRef = useRef(null);

  // Clean up all resources
  const cleanup = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setVolumeLevel(0);
  }, []);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const handleCancelRecording = useCallback(() => {
    chunksRef.current = [];
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.onstop = null; // Suppress complete handler
      mediaRecorderRef.current.stop();
    }
    cleanup();
    setIsRecording(false);
    setRecordingTime(0);
  }, [cleanup]);

  const startRecording = async () => {
    setErrorMessage(null);
    chunksRef.current = [];
    maxRmsRef.current = 0;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('ድምፅ መቅረጫ በዚህ ብሮውዘር አይደገፍም (Audio recording not supported in this browser).');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // Web Audio API Acoustic Analyser
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      // Real-time RMS volume analysis loop
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i += 1) {
          const norm = (dataArray[i] - 128) / 128;
          sum += norm * norm;
        }
        const rms = Math.sqrt(sum / bufferLength);
        if (rms > maxRmsRef.current) {
          maxRmsRef.current = rms;
        }
        // Normalize 0..1 for UI visualizer ring
        setVolumeLevel(Math.min(rms * 4, 1));
        animFrameRef.current = requestAnimationFrame(updateVolume);
      };
      animFrameRef.current = requestAnimationFrame(updateVolume);

      // Select optimal MIME container
      let mimeType = 'audio/webm;codecs=opus';
      let extension = 'webm';
      if (!MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
          mimeType = 'audio/mp4';
          extension = 'mp4';
        } else {
          mimeType = '';
        }
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        cleanup();
        setIsRecording(false);

        const durationSec = Math.round((Date.now() - startTimeRef.current) / 1000);

        // Acoustic Silence Guardrail: if max RMS < 0.01 or duration < 1.0s, warn and discard
        if (maxRmsRef.current < 0.01 || durationSec < 1) {
          setErrorMessage('ድምፅ አልተሰማም (No voice detected). Please speak into your microphone.');
          chunksRef.current = [];
          setRecordingTime(0);
          return;
        }

        const actualMime = chunksRef.current[0]?.type || mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: actualMime });

        // 25MB File Size Guardrail
        if (audioBlob.size > 25 * 1024 * 1024) {
          setErrorMessage('የድምፅ ፋይል መጠኑ ከ 25MB በልጧል (Audio file size exceeds 25MB limit).');
          chunksRef.current = [];
          setRecordingTime(0);
          return;
        }

        const fileName = `narration-${Date.now()}.${extension}`;
        const file = new File([audioBlob], fileName, { type: actualMime });

        if (onRecordingComplete) {
          onRecordingComplete(file, audioBlob, durationSec);
        }
        setRecordingTime(0);
      };

      // Start recording with 500ms time slice
      recorder.start(500);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setRecordingTime(0);

      // Start 1-second interval timer with automatic 120s cap
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          const next = prev + 1;
          if (next >= maxDuration) {
            handleStopRecording();
            return maxDuration;
          }
          return next;
        });
      }, 1000);
    } catch (err) {
      cleanup();
      setIsRecording(false);
      console.error('Microphone error:', err);
      setErrorMessage(
        err.name === 'NotAllowedError'
          ? 'ማይክሮፎን ፈቃድ ተከልክሏል (Microphone permission denied). Please enable microphone access.'
          : err.message || 'ማይክሮፎን መክፈት አልተቻለም (Could not access microphone).'
      );
    }
  };

  const isWarning = recordingTime >= warningThreshold;

  // COMPACT MODE (for ChatComposer or inline actions)
  if (compact) {
    return (
      <>
        <Snackbar
          open={Boolean(errorMessage)}
          autoHideDuration={5000}
          onClose={() => setErrorMessage(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert severity="warning" onClose={() => setErrorMessage(null)}>
            {errorMessage}
          </Alert>
        </Snackbar>

        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
          {isRecording ? (
            <>
              {/* Active Recording Indicator & Timer */}
              <Box
                sx={{
                  display: 'inline-flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  gap: 0.75,
                  px: 1,
                  py: 0.25,
                  height: 28,
                  borderRadius: '14px',
                  bgcolor: isWarning ? 'warning.light' : 'error.light',
                  color: isWarning ? 'warning.dark' : 'error.dark',
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    flexShrink: 0,
                    borderRadius: '50%',
                    bgcolor: isWarning ? 'warning.main' : 'error.main',
                    boxShadow: `0 0 ${4 + volumeLevel * 8}px ${
                      isWarning ? '#ed6c02' : '#d32f2f'
                    }`,
                    animation: 'pulse 1s infinite alternate',
                    '@keyframes pulse': {
                      '0%': { transform: 'scale(0.9)' },
                      '100%': { transform: 'scale(1.2)' },
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    fontVariantNumeric: 'tabular-nums',
                    whiteSpace: 'nowrap',
                    lineHeight: 1,
                  }}
                >
                  {formatTime(recordingTime)} / {formatTime(maxDuration)}
                </Typography>
              </Box>

              <Tooltip title="መቅረጽ አቁም (Stop recording)">
                <IconButton
                  size="small"
                  onClick={handleStopRecording}
                  color="error"
                  aria-label="Stop recording"
                  sx={{
                    bgcolor: 'error.main',
                    color: 'common.white',
                    '&:hover': { bgcolor: 'error.dark' },
                  }}
                >
                  <StopIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="ሰርዝ (Cancel)">
                <IconButton
                  size="small"
                  onClick={handleCancelRecording}
                  color="default"
                  aria-label="Cancel recording"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : (
            <Tooltip title={label}>
              <span>
                <IconButton
                  size="small"
                  onClick={startRecording}
                  disabled={disabled}
                  color="primary"
                  aria-label="Start audio recording"
                >
                  <MicIcon />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      </>
    );
  }

  // EXPANDED / ORB MODE (for ReportForm Row 5)
  return (
    <>
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={5000}
        onClose={() => setErrorMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          border: '1px dashed',
          borderColor: isRecording ? (isWarning ? 'warning.main' : 'error.main') : 'divider',
          borderRadius: 3,
          bgcolor: isRecording
            ? isWarning
              ? 'rgba(237, 108, 2, 0.05)'
              : 'rgba(211, 47, 47, 0.04)'
            : 'background.paper',
          transition: 'all 0.25s ease-in-out',
        }}
      >
        {isRecording ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
            {/* Pulsing Audio Orb */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Animated Acoustic Waves */}
              <Box
                sx={{
                  position: 'absolute',
                  width: 72 + volumeLevel * 36,
                  height: 72 + volumeLevel * 36,
                  borderRadius: '50%',
                  bgcolor: isWarning ? 'warning.main' : 'error.main',
                  opacity: 0.2 + volumeLevel * 0.3,
                  transition: 'width 0.1s ease, height 0.1s ease, opacity 0.1s ease',
                }}
              />
              <IconButton
                onClick={handleStopRecording}
                aria-label="Stop recording"
                sx={{
                  width: 64,
                  height: 64,
                  bgcolor: isWarning ? 'warning.main' : 'error.main',
                  color: 'common.white',
                  boxShadow: 3,
                  '&:hover': {
                    bgcolor: isWarning ? 'warning.dark' : 'error.dark',
                  },
                }}
              >
                <StopIcon sx={{ fontSize: 32 }} />
              </IconButton>
            </Box>

            {/* Timer and Status */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontVariantNumeric: 'tabular-nums',
                  color: isWarning ? 'warning.main' : 'error.main',
                }}
              >
                {formatTime(recordingTime)} / {formatTime(maxDuration)}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {isWarning
                  ? 'የቀረበ ገደብ! በቅርቡ በራስ-ሰር ይቆማል (Near 15 min limit! Will auto-stop soon)'
                  : 'በመናገር ላይ... ድምፅ እየተቀረፀ ነው (Listening... Recording narration)'}
              </Typography>
            </Box>

            {/* Cancel Button */}
            <Button
              size="small"
              variant="text"
              color="inherit"
              startIcon={<DeleteOutlineIcon />}
              onClick={handleCancelRecording}
              sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.75rem' }}
            >
              ሰርዝ (Discard Recording)
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={startRecording}
              disabled={disabled}
              aria-label="Start recording narration"
              sx={{
                width: 56,
                height: 56,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'primary.dark',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <MicIcon sx={{ fontSize: 30 }} />
            </IconButton>

            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
              {label}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', textAlign: 'center' }}>
              የዕለቱን የስራ ክንውኖች፣ ችግሮች ወይም አስተያየቶች በድምፅ ይቅረጹ (እስከ 15 ደቂቃ እና 25MB)
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
};

MuiRecorder.propTypes = {
  onRecordingComplete: PropTypes.func.isRequired,
  maxDuration: PropTypes.number,
  warningThreshold: PropTypes.number,
  disabled: PropTypes.bool,
  compact: PropTypes.bool,
  label: PropTypes.string,
};

export default MuiRecorder;
