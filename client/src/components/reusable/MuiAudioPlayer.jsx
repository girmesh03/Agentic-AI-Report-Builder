/**
 * @module components/reusable/MuiAudioPlayer
 * @description Reusable in-memory Blob URL audio player component.
 * Provides accessible Play/Pause controls, interactive scrubbing slider,
 * current time/duration display, and optional delete action.
 * Conforms to Master Technical Specification Section 6.5.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Slider from '@mui/material/Slider';
import Tooltip from '@mui/material/Tooltip';
import Paper from '@mui/material/Paper';
import PlayArrowIcon from '@mui/icons-material/PlayArrowRounded';
import PauseIcon from '@mui/icons-material/PauseRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlineRounded';

/**
 * Formats time in seconds to mm:ss format.
 *
 * @param {number} sec - Time in seconds.
 * @returns {string} Formatted string.
 */
const formatTime = (sec) => {
  if (!sec || isNaN(sec) || !isFinite(sec)) return '00:00';
  const total = Math.floor(sec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const MuiAudioPlayer = ({
  src,
  name,
  duration: initialDuration,
  onDelete,
  compact = false,
  sx = {},
}) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration || 0);
  const [isSeeking, setIsSeeking] = useState(false);

  useEffect(() => {
    if (initialDuration && (!duration || duration === 0)) {
      setDuration(initialDuration);
    }
  }, [initialDuration, duration]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((err) => {
        console.warn('Audio playback error:', err);
      });
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!isSeeking && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  }, [isSeeking]);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const handleEnded = useCallback(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  const handleSeekChange = useCallback((_e, value) => {
    setIsSeeking(true);
    setCurrentTime(value);
  }, []);

  const handleSeekCommitted = useCallback((_e, value) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
    setIsSeeking(false);
  }, []);

  // Teardown playback on unmount
  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, []);

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: compact ? 0.75 : 1.25,
        borderRadius: 2,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        ...sx,
      }}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Play/Pause Button */}
      <IconButton
        onClick={togglePlayPause}
        size={compact ? 'small' : 'medium'}
        color="primary"
        aria-label={isPlaying ? 'Pause audio' : 'Play audio'}
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          '&:hover': {
            bgcolor: 'primary.dark',
          },
          flexShrink: 0,
          width: compact ? 32 : 40,
          height: compact ? 32 : 40,
        }}
      >
        {isPlaying ? (
          <PauseIcon fontSize={compact ? 'small' : 'medium'} />
        ) : (
          <PlayArrowIcon fontSize={compact ? 'small' : 'medium'} />
        )}
      </IconButton>

      {/* Scrubber & Time */}
      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Slider
          size="small"
          value={currentTime}
          min={0}
          max={duration || 100}
          step={0.1}
          disabled={!duration}
          onChange={handleSeekChange}
          onChangeCommitted={handleSeekCommitted}
          aria-label="Audio scrubber"
          sx={{
            py: 0.5,
            '& .MuiSlider-thumb': {
              width: 10,
              height: 10,
              '&:hover, &.Mui-focusVisible': {
                boxShadow: '0 0 0 6px rgba(25, 118, 210, 0.16)',
              },
            },
          }}
        />
        <Typography
          variant="caption"
          sx={{
            color: 'text.secondary',
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.7rem',
            whiteSpace: 'nowrap',
            minWidth: 70,
            textAlign: 'right',
          }}
        >
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>
      </Box>

      {/* Delete Action (Optional) */}
      {onDelete && (
        <Tooltip title="ድምፅ ሰርዝ (Delete clip)">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(e);
            }}
            color="error"
            aria-label="Delete audio clip"
            sx={{ flexShrink: 0 }}
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Paper>
  );
};

MuiAudioPlayer.propTypes = {
  src: PropTypes.string.isRequired,
  name: PropTypes.string,
  duration: PropTypes.number,
  onDelete: PropTypes.func,
  compact: PropTypes.bool,
  sx: PropTypes.object,
};

export default MuiAudioPlayer;
