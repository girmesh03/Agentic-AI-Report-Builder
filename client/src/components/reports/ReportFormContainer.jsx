/**
 * @module components/reports/ReportFormContainer
 * @description Symmetrical Two-Column Container for the In-Canvas 10-Row Report Form.
 * Houses the active form editor on the left (60%) and sticky Plain-Text Amharic Live Preview on the right (40%).
 * Conforms to Master Technical Specification Section 9.7 and Section 10.
 */
import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import IconButton from '@mui/material/IconButton';
import ReportForm from './ReportForm.jsx';
import ReportLivePreview from './ReportLivePreview.jsx';
import MuiConfirmDialog from '../reusable/MuiConfirmDialog.jsx';
import {
  closeReportForm,
  resetDraft,
  setReportConversation,
} from '../../redux/features/reports/reportSlice.js';
import { useCreateReportMutation } from '../../redux/features/reports/reportApi.js';
import { parseEthiopianDateString, ethiopianToGregorian } from '../../utils/ethiopianDate.js';

/**
 * Report Form Container Component.
 *
 * @component ReportFormContainer
 * @returns {JSX.Element} Rendered 2-column container.
 */
export const ReportFormContainer = () => {
  const dispatch = useDispatch();
  const { draft, isDirty } = useSelector((state) => state.reports);
  const user = useSelector((state) => state.auth?.user);

  const [createReport, { isLoading }] = useCreateReportMutation();

  const [isCancelConfirmOpen, setIsCancelConfirmOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const supervisorName =
    user?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Supervisor');

  // Cancel handler: prompt confirmation if changes exist, otherwise dismiss directly
  const handleCancel = useCallback(() => {
    if (isDirty) {
      setIsCancelConfirmOpen(true);
    } else {
      dispatch(closeReportForm());
    }
  }, [isDirty, dispatch]);

  const handleConfirmDiscard = useCallback(() => {
    setIsCancelConfirmOpen(false);
    dispatch(resetDraft());
    dispatch(closeReportForm());
  }, [dispatch]);

  // Form Submission
  const handleSubmit = useCallback(async () => {
    if (!draft.branch) {
      setErrorMessage('Please select a primary branch before compiling the report.');
      return;
    }

    try {
      let datePayload = draft.date;
      const parsedEth = parseEthiopianDateString(draft.date);
      if (parsedEth) {
        const gDate = ethiopianToGregorian(parsedEth.year, parsedEth.month, parsedEth.day);
        datePayload = gDate.toISOString();
      }

      const payload = {
        date: datePayload,
        branch: draft.branch,
        clockIn: draft.clockIn,
        clockOut: draft.clockOut,
        shiftPreset: draft.shiftPreset,
        visits: (draft.visits || []).map((v) => ({
          branch: v.branch,
          clockIn: v.clockIn,
          clockOut: v.clockOut,
        })),
        activities: (draft.activities || []).map((a) => ({
          text: a.text,
          status: a.status || 'completed',
        })),
        issues: draft.noIssue
          ? [{ text: 'በዕለቱ የተፈጠረ ምንም አይነት ችግር የለም።', status: 'no_issue' }]
          : (draft.issues || []).map((i) => ({
              text: i.text,
              status: i.status || 'reported',
            })),
        comments: draft.comments ? [draft.comments] : [],
        audio: draft.audio || [],
      };

      const result = await createReport(payload).unwrap();
      setSuccessMessage('Report successfully compiled and opened in Chat!');
      if (result?.data?.report) {
        dispatch(setReportConversation({ report: result.data.report }));
      }
      setTimeout(() => {
        dispatch(closeReportForm());
      }, 400);
    } catch (err) {
      const msg =
        err?.data?.message ||
        (Array.isArray(err?.data?.errors)
          ? err.data.errors.map((e) => e.msg || e.message).join(', ')
          : null) ||
        err?.message ||
        'Failed to compile and save report.';
      setErrorMessage(msg);
    }
  }, [draft, createReport, dispatch]);

  return (
    <Box sx={{ width: '100%', py: { xs: 1.5, sm: 2.5 } }}>
      {/* Header bar with Back button and status badge */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <IconButton
            size="small"
            onClick={handleCancel}
            aria-label="Back to Conversational Chat"
            sx={{ border: '1px solid', borderColor: 'divider' }}
          >
            <ArrowBackOutlined fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Daily Supervisory Report Form
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              Shift Metadata & Audio Ingestion • Live Amharic Compiler
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Symmetrical Two-Column Grid: Form (60%) | Live Preview (40%) */}
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 7 }}>
          <ReportForm
            onCancel={handleCancel}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <ReportLivePreview draft={draft} supervisorName={supervisorName} />
        </Grid>
      </Grid>

      {/* Confirmation Dialog on Discard */}
      <MuiConfirmDialog
        open={isCancelConfirmOpen}
        title="Discard Draft Report?"
        message="You have unsaved changes in this report draft. Are you sure you want to discard your draft and return to the conversation?"
        confirmText="Discard Draft"
        cancelText="Keep Editing"
        confirmColor="error"
        onConfirm={handleConfirmDiscard}
        onClose={() => setIsCancelConfirmOpen(false)}
      />

      {/* Error Feedback Snackbar */}
      <Snackbar
        open={Boolean(errorMessage)}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setErrorMessage('')} sx={{ width: '100%' }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      {/* Success Feedback Snackbar */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={3000}
        onClose={() => setSuccessMessage('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ width: '100%' }}>
          {successMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReportFormContainer;
