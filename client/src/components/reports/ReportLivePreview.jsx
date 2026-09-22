/**
 * @module components/reports/ReportLivePreview
 * @description Sticky, real-time live preview of the assembled plain-text Amharic report.
 * Updates deterministically with zero network overhead as form fields change.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import MuiButton from '../reusable/MuiButton.jsx';
import { renderReportText } from '../../utils/reportFormatter.js';

/**
 * Sticky plain-text Amharic report preview card.
 *
 * @component ReportLivePreview
 * @param {object} props - Component properties.
 * @param {object} props.draft - Active report form draft state.
 * @param {string} [props.supervisorName=''] - Supervisor full name.
 * @returns {JSX.Element} Rendered live preview card.
 */
export const ReportLivePreview = ({ draft, supervisorName = '' }) => {
  const [copied, setCopied] = useState(false);

  // Deterministically compile live plain-text string
  const plainTextReport = renderReportText({
    ...draft,
    supervisorName: supervisorName || 'Supervisor',
  });

  const isMulti = draft.visits && draft.visits.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(plainTextReport);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: { xs: 1.5, sm: 2.5 },
        bgcolor: 'background.paper',
        position: { xs: 'static', md: 'sticky' },
        top: 24,
        maxHeight: { xs: 'none', md: 'calc(100vh - 120px)' },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header bar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pb: 1.5, borderBottom: '1px solid', borderColor: 'divider', mb: 2 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              bgcolor: 'success.main',
              boxShadow: '0 0 8px rgba(46, 125, 50, 0.5)',
            }}
          />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Live Amharic Report Preview
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            size="small"
            label={isMulti ? 'Multi-Branch' : 'Single-Branch'}
            color={isMulti ? 'primary' : 'default'}
            variant="outlined"
            sx={{ height: 22, fontSize: '0.7rem', fontWeight: 600 }}
          />

          <Tooltip title={copied ? 'Copied!' : 'Copy Plain Text'}>
            <MuiButton
              size="small"
              variant="outlined"
              startIcon={copied ? <CheckCircleOutlined color="success" /> : <ContentCopyOutlined />}
              onClick={handleCopy}
              sx={{ height: 28, fontSize: '0.75rem', textTransform: 'none' }}
            >
              {copied ? 'Copied' : 'Copy'}
            </MuiButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Compiled Plain Text View */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          borderRadius: 1.5,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.02)',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          component="pre"
          sx={{
            fontFamily: (theme) => theme.typography.fontFamily,
            fontSize: '0.85rem',
            lineHeight: 1.8,
            color: 'text.primary',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            m: 0,
            userSelect: 'all',
          }}
        >
          {plainTextReport}
        </Typography>
      </Box>

      {/* Footer Invariants Checklist */}
      <Box sx={{ pt: 1.5, borderTop: '1px solid', borderColor: 'divider', mt: 2 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem' }}>
          🛡️ <b>Formatting Invariants:</b> 0 markdown characters • Standard Amharic bullets (&apos; - &apos;) • Ethiopian Date DD-MM-YY
        </Typography>
      </Box>
    </Paper>
  );
};

export default ReportLivePreview;
