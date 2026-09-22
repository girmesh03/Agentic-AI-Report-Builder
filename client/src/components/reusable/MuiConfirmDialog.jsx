/**
 * @module components/reusable/MuiConfirmDialog
 * @description Generic confirmation dialog for destructive actions, deletions, and cancellations with slotProps and focus safeguards.
 */
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import MuiButton from './MuiButton.jsx';

/**
 * Standard confirmation dialog adhering to Section 10.8 reusable component law.
 * Provides accessible confirm and cancel action buttons with loading state handling,
 * MUI v6 slotProps architecture, and explicit focus trap safeguards.
 *
 * @component MuiConfirmDialog
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether the confirmation dialog is visible.
 * @param {string} props.title - Dialog title heading.
 * @param {string} [props.message] - Descriptive explanation or warning text.
 * @param {string} [props.confirmText='Confirm'] - Label for confirmation button.
 * @param {string} [props.cancelText='Cancel'] - Label for cancellation button.
 * @param {'error'|'primary'|'secondary'|'warning'|'info'|'success'} [props.confirmColor='error'] - Confirm button theme color.
 * @param {Function} props.onConfirm - Callback triggered on confirm button click.
 * @param {Function} props.onClose - Callback triggered on cancel button or backdrop click.
 * @param {boolean} [props.loading=false] - Whether confirmation async action is processing.
 * @param {boolean} [props.disableEnforceFocus=true] - Disables modal focus trap for clean browser automation & DevTools.
 * @param {boolean} [props.disableRestoreFocus=true] - Disables returning focus to trigger on modal dismissal.
 * @param {React.ReactNode} [props.children] - Optional custom body elements rendered below the message.
 * @returns {JSX.Element} Rendered confirmation dialog modal.
 */
export const MuiConfirmDialog = ({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  onConfirm,
  onClose,
  loading = false,
  disableEnforceFocus = true,
  disableRestoreFocus = true,
  children,
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      disableEnforceFocus={disableEnforceFocus}
      disableRestoreFocus={disableRestoreFocus}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      slotProps={{
        paper: {
          sx: { borderRadius: 2, p: 1 },
        },
      }}
    >
      <DialogTitle id="confirm-dialog-title" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
        {title}
      </DialogTitle>
      <DialogContent>
        {message && (
          <DialogContentText id="confirm-dialog-description" sx={{ mb: children ? 2 : 0 }}>
            {message}
          </DialogContentText>
        )}
        {children}
      </DialogContent>
      <DialogActions sx={{ px: 2, pb: 1 }}>
        <MuiButton
          variant="outlined"
          color="inherit"
          onClick={onClose}
          disabled={loading}
          size="small"
        >
          {cancelText}
        </MuiButton>
        <MuiButton
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          loading={loading}
          size="small"
        >
          {confirmText}
        </MuiButton>
      </DialogActions>
    </Dialog>
  );
};

export default MuiConfirmDialog;
