/**
 * @module components/profile/DangerZoneTab
 * @description Danger zone tab for permanent supervisor account deletion with sentinel confirmation.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiConfirmDialog from '../reusable/MuiConfirmDialog.jsx';
import MuiTextField from '../reusable/MuiTextField.jsx';
import { useDeleteAccountMutation } from '../../redux/features/auth/authApi.js';
import { ACCOUNT_DELETION_SENTINEL, APP_ROUTES } from '../../utils/constants.js';

/**
 * Danger zone tab for permanent account deletion per Section 10.6.5 and 11.4.13.
 * Requires explicit 'DELETE' sentinel input before triggering 7-collection atomic cascade.
 *
 * @component DangerZoneTab
 * @returns {JSX.Element} Rendered danger zone card with deletion controls.
 */
export const DangerZoneTab = () => {
  const navigate = useNavigate();
  const [deleteAccount, { isLoading }] = useDeleteAccountMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');

  /** Opens the confirmation dialog. */
  const handleOpenDialog = () => {
    setConfirmation('');
    setError('');
    setDialogOpen(true);
  };

  /** Closes the confirmation dialog. */
  const handleCloseDialog = () => {
    if (!isLoading) {
      setDialogOpen(false);
      setConfirmation('');
      setError('');
    }
  };

  /** Handles confirmed account deletion. */
  const handleConfirmDelete = async () => {
    if (confirmation !== ACCOUNT_DELETION_SENTINEL) {
      setError(`Please type ${ACCOUNT_DELETION_SENTINEL} in all caps to confirm.`);
      return;
    }
    setError('');
    try {
      await deleteAccount({ confirmation: ACCOUNT_DELETION_SENTINEL }).unwrap();
      navigate(APP_ROUTES.LOGIN, { replace: true });
    } catch (err) {
      setError(err?.data?.message || 'Failed to delete account.');
    }
  };

  const cascadeItems = [
    'Profile credentials, authentication sessions, and refresh tokens',
    'Created branches, assigned personnel links, and branch metrics',
    'Report drafts, published executive summaries, and generated PDFs',
    'AI assistant conversation threads, prompts, and context memories',
  ];

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'error.main', mb: 0.5 }}>
        Danger Zone
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Irreversible actions regarding your account and associated organizational data.
      </Typography>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.35)' : 'rgba(211, 47, 47, 0.25)',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(244, 67, 54, 0.05)' : 'rgba(211, 47, 47, 0.03)',
          width: '100%',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <WarningAmberIcon color="error" />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
            Delete Supervisor Account
          </Typography>
        </Box>

        <Typography variant="body2" color="text.primary" sx={{ mb: 1.5, fontSize: '0.875rem' }}>
          Once you delete your account, there is no going back. All data across the 7 application
          collections will be permanently purged in an atomic transaction:
        </Typography>

        <List dense sx={{ mb: 2, pl: 1 }}>
          {cascadeItems.map((item) => (
            <ListItem key={item} disableGutters sx={{ py: 0.25 }}>
              <ListItemIcon sx={{ minWidth: 20 }}>
                <FiberManualRecordIcon sx={{ fontSize: 6, color: 'error.main' }} />
              </ListItemIcon>
              <ListItemText
                primary={item}
                slotProps={{
                  primary: {
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: 1 }}>
          <MuiButton
            variant="outlined"
            color="error"
            size="small"
            onClick={handleOpenDialog}
          >
            Delete My Account
          </MuiButton>
        </Box>
      </Paper>

      {/* Confirmation Sentinel Dialog */}
      <MuiConfirmDialog
        open={dialogOpen}
        title="Confirm Permanent Deletion"
        message="This action is immediate and non-reversible. Please type DELETE below to verify your intent."
        confirmText="Permanently Delete Account"
        confirmColor="error"
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDialog}
        loading={isLoading}
      >
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <MuiTextField
          label={`Type ${ACCOUNT_DELETION_SENTINEL} to confirm`}
          placeholder={ACCOUNT_DELETION_SENTINEL}
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          error={!!error && confirmation !== ACCOUNT_DELETION_SENTINEL}
          fullWidth
          autoComplete="off"
          sx={{ mt: 1.5 }}
        />
      </MuiConfirmDialog>
    </Box>
  );
};

export default DangerZoneTab;
