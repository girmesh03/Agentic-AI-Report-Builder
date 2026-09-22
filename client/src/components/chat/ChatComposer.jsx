/**
 * @module components/chat/ChatComposer
 * @description Centered bottom chat composer equipped with unobtrusive AI Provider Selector.
 * Default provider: Google (Gemini), Language: Amharic, Reasoning: Max.
 * Max-width 880px conforming to Master Technical Specification Section 9.3 and Section 9.7.
 */
import { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stack from '@mui/material/Stack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import KeyboardArrowDownOutlined from '@mui/icons-material/KeyboardArrowDownOutlined';
import SendOutlined from '@mui/icons-material/SendOutlined';
import AttachFileOutlined from '@mui/icons-material/AttachFileOutlined';
import CheckOutlined from '@mui/icons-material/CheckOutlined';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiRecorder from '../reusable/MuiRecorder.jsx';
import { useTranscribeEphemeralAudioMutation } from '../../redux/features/reports/reportApi.js';

const AI_PROVIDERS = [
  {
    id: 'google',
    name: 'Google (Gemini)',
    model: 'gemini-2.5-flash',
    tag: 'Default',
    description: 'High-speed reasoning & Amharic synthesis',
  },
  {
    id: 'addis',
    name: 'Addis AI',
    model: 'Addis-፩-አሌፍ',
    tag: 'Native Amharic',
    description: 'Ethiopian domain & linguistic nuance',
  },
  {
    id: 'nvidia',
    name: 'Nvidia (Llama 3.1)',
    model: 'meta/llama-3.1-nemotron-70b-instruct',
    tag: 'Alternative',
    description: 'Open-weights high-throughput model',
  },
];

/**
 * ChatComposer Component.
 *
 * @component ChatComposer
 * @param {object} props - Component properties.
 * @param {Function} [props.onSend] - Optional send handler for chat messages.
 * @param {boolean} [props.disabled=false] - Whether composer input is disabled.
 * @returns {JSX.Element} Rendered composer.
 */
export const ChatComposer = ({ onSend, disabled = false }) => {
  const [text, setText] = useState('');
  const [providerId, setProviderId] = useState('google');
  const [providerAnchor, setProviderAnchor] = useState(null);

  const activeProvider = AI_PROVIDERS.find((p) => p.id === providerId) || AI_PROVIDERS[0];
  const isMenuOpen = Boolean(providerAnchor);

  const [transcribeEphemeralAudio, { isLoading: isTranscribing }] = useTranscribeEphemeralAudioMutation();
  const [composerError, setComposerError] = useState(null);
  const fileInputRef = useRef(null);

  const handleVoiceDictationComplete = async (file) => {
    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);
      const res = await transcribeEphemeralAudio(formData).unwrap();
      const transcribedText = res?.data?.text || '';
      if (transcribedText) {
        setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
      }
    } catch (err) {
      setComposerError(
        err?.data?.message || err?.message || 'ድምፅ ወደ ጽሁፍ መቀየር አልተቻለም (Voice dictation failed).'
      );
    }
  };

  const handleAudioFileAttach = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('audio', file, file.name);
      const res = await transcribeEphemeralAudio(formData).unwrap();
      const transcribedText = res?.data?.text || '';
      if (transcribedText) {
        setText((prev) => (prev ? `${prev} ${transcribedText}` : transcribedText));
      }
    } catch (err) {
      setComposerError(
        err?.data?.message || err?.message || 'የድምፅ ፋይሉን መተርጎም አልተቻለም (Failed to transcribe audio).'
      );
    }
    e.target.value = '';
  };

  const handleOpenProviderMenu = (e) => {
    setProviderAnchor(e.currentTarget);
  };

  const handleCloseProviderMenu = () => {
    setProviderAnchor(null);
  };

  const handleSelectProvider = (id) => {
    setProviderId(id);
    handleCloseProviderMenu();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    if (onSend) {
      onSend({
        text: text.trim(),
        provider: activeProvider.id,
        model: activeProvider.model,
        language: 'am',
        reasoning: 'max',
      });
    }
    setText('');
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 880,
        mx: 'auto',
        px: { xs: 1.5, sm: 2 },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: '6px 12px',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'none',
          bgcolor: 'background.paper',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}25`,
          },
        }}
      >
        {/* Top input row */}
        <InputBase
          multiline
          minRows={1}
          maxRows={4}
          fullWidth
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question, review a report, or type a prompt..."
          disabled={disabled}
          sx={{
            fontSize: '0.925rem',
            py: 0.5,
            px: 0.5,
          }}
        />

        {/* Action bar row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 0.75, mt: 0.5, borderTop: '1px solid', borderColor: 'divider' }}
        >
          {/* Left action: AI Provider Selector */}
          <Tooltip title="AI Engine: Google Gemini • Language: Amharic • Reasoning: Max">
            <MuiButton
              size="small"
              variant="text"
              color="inherit"
              onClick={handleOpenProviderMenu}
              startIcon={<AutoAwesomeOutlined fontSize="small" sx={{ color: 'primary.main', fontSize: 16 }} />}
              endIcon={<KeyboardArrowDownOutlined fontSize="small" sx={{ color: 'text.secondary', fontSize: 16 }} />}
              sx={{
                height: 28,
                px: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.secondary',
                bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.04)'),
                borderRadius: 1.5,
                '&:hover': {
                  color: 'text.primary',
                  bgcolor: 'action.hover',
                },
              }}
            >
              {activeProvider.name}
            </MuiButton>
          </Tooltip>

          {/* Provider Selection Menu */}
          <Menu
            anchorEl={providerAnchor}
            open={isMenuOpen}
            onClose={handleCloseProviderMenu}
            anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
            transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            slotProps={{
              paper: {
                sx: {
                  minWidth: 260,
                  p: 0.5,
                  borderRadius: 2,
                  boxShadow: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                },
              },
            }}
          >
            <Box sx={{ px: 1.5, py: 0.75 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Select AI Engine
              </Typography>
              <Typography variant="caption" sx={{ display: 'block', color: 'primary.main', fontSize: '0.7rem' }}>
                Default: Google (Gemini) • Amharic • Reasoning Max
              </Typography>
            </Box>

            {AI_PROVIDERS.map((prov) => {
              const isSelected = prov.id === activeProvider.id;
              return (
                <MenuItem
                  key={prov.id}
                  onClick={() => handleSelectProvider(prov.id)}
                  sx={{
                    borderRadius: 1,
                    my: 0.25,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    bgcolor: isSelected ? 'action.selected' : 'transparent',
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: isSelected ? 700 : 500, fontSize: '0.85rem' }}>
                        {prov.name}
                      </Typography>
                      {prov.tag && (
                        <Chip
                          label={prov.tag}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                          variant="outlined"
                          sx={{ height: 18, fontSize: '0.65rem' }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
                      {prov.description}
                    </Typography>
                  </Box>
                  {isSelected && <CheckOutlined color="primary" fontSize="small" sx={{ ml: 1 }} />}
                </MenuItem>
              );
            })}
          </Menu>

          {/* Right actions: Voice dictation (Mode 3), Voice attachment, Send */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            {isTranscribing && (
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 0.5 }}>
                <CircularProgress size={16} color="primary" />
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, fontSize: '0.7rem' }}>
                  እየተተረጎመ...
                </Typography>
              </Stack>
            )}

            {/* Mode 3: Ephemeral Dictation via MuiRecorder */}
            <MuiRecorder
              compact
              onRecordingComplete={handleVoiceDictationComplete}
              disabled={disabled || isTranscribing}
              label="ድምፅዎን ይናገሩ (Speak to dictate)"
            />

            {/* Hidden audio file attachment input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".webm,.wav,.mp3,.m4a,.ogg,.aac,audio/*"
              style={{ display: 'none' }}
              onChange={handleAudioFileAttach}
            />

            <Tooltip title="የድምፅ ፋይል ያያይዙ (Attach voice note)">
              <span>
                <IconButton
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isTranscribing}
                  sx={{ color: 'text.secondary' }}
                  aria-label="Attach audio file"
                >
                  <AttachFileOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Send message">
              <span>
                <IconButton
                  size="small"
                  color="primary"
                  disabled={!text.trim() || disabled || isTranscribing}
                  onClick={handleSend}
                  sx={{
                    bgcolor: text.trim() ? 'primary.main' : 'transparent',
                    color: text.trim() ? 'primary.contrastText' : 'text.disabled',
                    '&:hover': {
                      bgcolor: text.trim() ? 'primary.dark' : 'transparent',
                    },
                  }}
                >
                  <SendOutlined fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Transcription error feedback */}
      <Snackbar
        open={Boolean(composerError)}
        autoHideDuration={5000}
        onClose={() => setComposerError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="warning" onClose={() => setComposerError(null)}>
          {composerError}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ChatComposer;
