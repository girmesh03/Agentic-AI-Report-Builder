/**
 * @module components/reusable/MuiDialog
 * @description Standardized, accessible modal dialog wrapper conforming to Section 10.8.
 * Features customizable header, scrollable content with dividers, and standardized action buttons.
 */
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import MuiButton from './MuiButton.jsx';

/**
 * Standardized accessible modal dialog component.
 *
 * @component MuiDialog
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether dialog is open.
 * @param {Function} props.onClose - Close handler.
 * @param {string|React.ReactNode} props.title - Modal title.
 * @param {React.ReactNode} [props.icon] - Optional header icon.
 * @param {React.ReactNode} props.children - Dialog body content.
 * @param {React.ReactNode} [props.actions] - Custom footer actions.
 * @param {string} [props.submitLabel='Save'] - Label for primary submit button.
 * @param {string} [props.cancelLabel='Cancel'] - Label for secondary cancel button.
 * @param {Function} [props.onSubmit] - Primary action callback.
 * @param {boolean} [props.loading=false] - Whether primary action is loading.
 * @param {boolean} [props.disabled=false] - Whether primary action is disabled.
 * @param {string} [props.maxWidth='sm'] - Maximum width breakpoint ('xs' | 'sm' | 'md' | 'lg').
 * @param {boolean} [props.fullWidth=true] - Whether dialog occupies full container width.
 * @param {object} [props.sx={}] - Styling overrides.
 * @returns {JSX.Element} Rendered modal dialog.
 */
export const MuiDialog = ({
  open,
  onClose,
  title,
  icon,
  children,
  actions,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  loading = false,
  disabled = false,
  maxWidth = 'sm',
  fullWidth = true,
  sx = {},
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      autoFocus={false}
      disableRestoreFocus={true}
      slotProps={{
        paper: {
          elevation: 6,
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
            ...sx,
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          {icon && (
            <Box
              sx={{
                display: 'inline-flex',
                color: 'primary.main',
              }}
            >
              {icon}
            </Box>
          )}
          <Typography variant="h6" fontWeight={700} component="span">
            {title}
          </Typography>
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={loading}
          size="small"
          sx={{
            color: 'text.secondary',
            '&:hover': { color: 'text.primary' },
          }}
        >
          <CloseOutlined fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {children}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions
        sx={{
          p: 2,
          px: 3,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        {actions !== undefined ? (
          actions
        ) : (
          <>
            <MuiButton
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onClose}
              disabled={loading}
            >
              {cancelLabel}
            </MuiButton>
            {onSubmit && (
              <MuiButton
                variant="contained"
                size="small"
                onClick={onSubmit}
                loading={loading}
                disabled={disabled}
              >
                {submitLabel}
              </MuiButton>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default MuiDialog;
