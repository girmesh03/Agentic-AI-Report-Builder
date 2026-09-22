/**
 * @module components/chat/ChatContainer
 * @description Single-column ChatGPT/Gemini-style Conversational Canvas and Report Orchestrator.
 * Features:
 * - Natural page scrolling with sticky bottom composer (zero calc(100vh - 100px) locks)
 * - Single-column conversational stream (User submission card on right -> AI synthesized report card on left)
 * - Zero floating preset toolbars on the chat canvas (preset selected on the form)
 * - Responsive 320px–1280px layout with 0px horizontal overflow
 */
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import SmartToyOutlined from '@mui/icons-material/SmartToyOutlined';
import PostAddOutlined from '@mui/icons-material/PostAddOutlined';
import AutoAwesomeOutlined from '@mui/icons-material/AutoAwesomeOutlined';
import ContentCopyOutlined from '@mui/icons-material/ContentCopyOutlined';
import CheckCircleOutlined from '@mui/icons-material/CheckCircleOutlined';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import GraphicEqOutlined from '@mui/icons-material/GraphicEqOutlined';
import ChatComposer from './ChatComposer.jsx';
import ReportFormContainer from '../reports/ReportFormContainer.jsx';
import MuiButton from '../reusable/MuiButton.jsx';
import {
  openReportForm,
  addChatMessage,
} from '../../redux/features/reports/reportSlice.js';

/**
 * Single-column Conversational Canvas Component.
 *
 * @component ChatContainer
 * @returns {JSX.Element} Rendered container.
 */
export const ChatContainer = () => {
  const dispatch = useDispatch();
  const isFormOpen = useSelector((state) => state.reports.isFormOpen);
  const messages = useSelector((state) => state.reports.messages || []);
  const [copiedMessageId, setCopiedMessageId] = useState(null);

  const handleCopyText = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch {
      // Fallback
    }
  };

  const handleSendMessage = ({ text, provider, model }) => {
    if (!text) return;
    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      type: 'chat_text',
      text,
      provider,
      model,
      timestamp: new Date().toISOString(),
    };
    dispatch(addChatMessage(userMsg));

    // Simulated conversational agent response
    setTimeout(() => {
      const aiReply = {
        id: `ai-${Date.now() + 1}`,
        role: 'assistant',
        type: 'chat_text',
        provider,
        model,
        text: `የቀረበውን ጥያቄ ተቀብያለሁ። በሪፖርቱ ወይም በስራ እንቅስቃሴው ዙሪያ ተጨማሪ ዝርዝር ካለ ያሳውቁኝ።`,
        timestamp: new Date().toISOString(),
      };
      dispatch(addChatMessage(aiReply));
    }, 400);
  };

  if (isFormOpen) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 3 } }}>
        <ReportFormContainer />
      </Container>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100%',
        width: '100%',
      }}
    >
      {/* Scrollable Conversation Stream */}
      <Box sx={{ flex: 1, py: { xs: 2, sm: 3 } }}>
        {messages.length === 0 ? (
          /* Empty Greeting State: Welcoming Cards */
          <Container maxWidth="sm" sx={{ textAlign: 'center', my: 'auto', py: { xs: 4, sm: 8 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 64,
                height: 64,
                flexShrink: 0,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'primary.main',
                mb: 2.5,
                opacity: 0.9,
              }}
            >
              <SmartToyOutlined sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
              Conversational Agent & Report Builder
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.6 }}>
              Welcome to the supervisor assistant. Draft and compile standardized plain-text Amharic
              supervisory reports or converse with your AI agent.
            </Typography>

            {/* Quick Action Selection Cards */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Paper
                elevation={0}
                onClick={() => dispatch(openReportForm())}
                sx={{
                  flex: 1,
                  p: 2.5,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.hover',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
                  <PostAddOutlined color="primary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Structured Report Form
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Open the Streamlined Form to record metadata, voice notes, and compile a standardized report.
                </Typography>
              </Paper>

              <Paper
                elevation={0}
                sx={{
                  flex: 1,
                  p: 2.5,
                  textAlign: 'left',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  bgcolor: (t) => (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'),
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.75 }}>
                  <AutoAwesomeOutlined color="secondary" fontSize="small" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Conversational Assistant
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                  Ask questions, explore branch performance, or dictate instructions directly in the composer below.
                </Typography>
              </Paper>
            </Stack>
          </Container>
        ) : (
          /* Single-Column Conversational Dialogue Stream */
          <Container maxWidth="md" sx={{ px: { xs: 1.5, sm: 2 } }}>
            <Stack spacing={3}>
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                const isReportRequest = msg.type === 'report_request';
                const isReportResponse = msg.type === 'report_response';
                const isCopied = copiedMessageId === msg.id;

                if (isUser) {
                  return (
                    <Box
                      key={msg.id}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-end',
                        width: '100%',
                      }}
                    >
                      {isReportRequest ? (
                        /* User Submission Metadata Card */
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            maxWidth: { xs: '100%', sm: '85%' },
                            bgcolor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? alpha(theme.palette.primary.main, 0.15)
                                : alpha(theme.palette.primary.main, 0.08),
                            border: '1px solid',
                            borderColor: 'primary.main',
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                            <PostAddOutlined color="primary" fontSize="small" />
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                              Daily Supervisory Report Initiated
                            </Typography>
                          </Stack>

                          <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ gap: 0.75, mb: 1 }}>
                            <Chip
                              icon={<CalendarTodayOutlined sx={{ fontSize: 14 }} />}
                              label={`ቀን: ${msg.report?.ethiopianDate?.formattedDate || msg.report?.date || 'Today'}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                            <Chip
                              icon={<StorefrontOutlined sx={{ fontSize: 14 }} />}
                              label={msg.report?.branchName || 'Branch'}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem' }}
                            />
                            <Chip
                              icon={<AccessTimeOutlined sx={{ fontSize: 14 }} />}
                              label={`${msg.report?.clockIn || '08:30'} – ${msg.report?.clockOut || '17:00'}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: '0.7rem', fontFamily: 'monospace' }}
                            />
                          </Stack>

                          {msg.report?.audioFiles?.length > 0 && (
                            <Stack direction="row" spacing={0.75} alignItems="center">
                              <GraphicEqOutlined fontSize="small" color="action" />
                              <Typography variant="caption" color="text.secondary">
                                {msg.report.audioFiles.length} Voice Note(s) Attached for AI STT Extraction
                              </Typography>
                            </Stack>
                          )}
                        </Paper>
                      ) : (
                        /* Standard User Chat Bubble */
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            px: 2,
                            borderRadius: 2,
                            borderTopRightRadius: 0.5,
                            maxWidth: { xs: '100%', sm: '80%' },
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {msg.text}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                  );
                }

                /* Assistant Message (Left-aligned) */
                return (
                  <Box
                    key={msg.id}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                    }}
                  >
                    <Paper
                      elevation={0}
                      sx={{
                        p: { xs: 2, sm: 2.5 },
                        borderRadius: 2,
                        width: '100%',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      {/* Assistant Header */}
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{ pb: 1.5, mb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Box
                            sx={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              bgcolor: 'primary.light',
                              color: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <SmartToyOutlined sx={{ fontSize: 18 }} />
                          </Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {isReportResponse ? 'Compiled Amharic Report' : 'AI Assistant'}
                          </Typography>
                          <Chip
                            label="Google Gemini"
                            size="small"
                            variant="outlined"
                            sx={{ height: 18, fontSize: '0.65rem' }}
                          />
                        </Stack>

                        {isReportResponse && (
                          <Tooltip title={isCopied ? 'Copied!' : 'Copy Plain Text'}>
                            <MuiButton
                              size="small"
                              variant="outlined"
                              startIcon={isCopied ? <CheckCircleOutlined color="success" /> : <ContentCopyOutlined />}
                              onClick={() => handleCopyText(msg.id, msg.text)}
                              sx={{ height: 26, fontSize: '0.75rem', textTransform: 'none' }}
                            >
                              {isCopied ? 'Copied' : 'Copy'}
                            </MuiButton>
                          </Tooltip>
                        )}
                      </Stack>

                      {isReportResponse && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                          ሰላም! የዕለቱ ሪፖርት ከተቀረጹት የድምፅ ፋይሎች እና የስራ መረጃዎች በተመረጠው መመሪያ መሰረት ተጠናቅሮ ተዘጋጅቷል። ማስተካከል ወይም መጨመር የሚፈልጉት ነገር ካለ እዚህ መወያየት ይችላሉ።
                        </Typography>
                      )}

                      {/* Compiled Report Text Box */}
                      <Box
                        sx={{
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
                            fontSize: '0.875rem',
                            lineHeight: 1.8,
                            color: 'text.primary',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            m: 0,
                            userSelect: 'all',
                          }}
                        >
                          {msg.text}
                        </Typography>
                      </Box>
                    </Paper>
                  </Box>
                );
              })}
            </Stack>
          </Container>
        )}
      </Box>

      {/* Sticky Bottom Composer */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 10,
          pb: { xs: 1.5, sm: 2 },
          pt: 1,
          bgcolor: (theme) => alpha(theme.palette.background.default, 0.95),
          backdropFilter: 'blur(8px)',
        }}
      >
        <ChatComposer onSend={handleSendMessage} />
      </Box>
    </Box>
  );
};

export default ChatContainer;
