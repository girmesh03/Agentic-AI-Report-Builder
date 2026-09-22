/**
 * @module components/profile/SecurityTab
 * @description Security tab for supervisor password changes with live criteria tracker and session revocation notice.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import LockOutlined from '@mui/icons-material/LockOutlined';
import ShieldOutlined from '@mui/icons-material/ShieldOutlined';
import CheckCircle from '@mui/icons-material/CheckCircle';
import RadioButtonUnchecked from '@mui/icons-material/RadioButtonUnchecked';
import MuiTextField from '../reusable/MuiTextField.jsx';
import MuiButton from '../reusable/MuiButton.jsx';
import { useChangePasswordMutation } from '../../redux/features/auth/authApi.js';

/**
 * Security tab component for Section 10.6.5 password management.
 * Provides live criteria feedback and session revocation notice.
 *
 * @component SecurityTab
 * @returns {JSX.Element} Rendered password change view.
 */
export const SecurityTab = () => {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onChange' });

  const newPasswordValue = watch('newPassword', '');

  // Live password validation criteria checks
  const criteria = [
    { label: 'At least 8 characters', met: newPasswordValue.length >= 8 },
    { label: 'At least one uppercase letter (A-Z)', met: /[A-Z]/.test(newPasswordValue) },
    { label: 'At least one lowercase letter (a-z)', met: /[a-z]/.test(newPasswordValue) },
    { label: 'At least one number (0-9)', met: /[0-9]/.test(newPasswordValue) },
  ];

  const allCriteriaMet = criteria.every((c) => c.met);

  /** Handles password change form submission. */
  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    if (!allCriteriaMet) {
      setMessage({
        type: 'error',
        text: 'Please satisfy all password complexity criteria before updating.',
      });
      return;
    }
    try {
      await changePassword(data).unwrap();
      setMessage({
        type: 'success',
        text: 'Password updated successfully. Other active sessions have been revoked.',
      });
      reset();
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to change password.' });
    }
  };

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Security Guidance Notice */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.08)' : 'rgba(25, 118, 210, 0.05)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(33, 150, 243, 0.25)' : 'rgba(25, 118, 210, 0.2)',
        }}
      >
        <ShieldOutlined color="info" sx={{ mt: 0.25 }} />
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'info.main' }}>
            Account Security Policy
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
            Changing your password terminates all active supervisor refresh tokens across other devices.
            Ensure you choose a strong password that you do not use on any other service.
          </Typography>
        </Box>
      </Paper>

      {/* Password Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ width: '100%' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Change Password
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Enter your current password and select a new secure password.
        </Typography>

        <MuiTextField
          label="Current Password"
          isPassword
          autoComplete="current-password"
          startIcon={<LockOutlined fontSize="small" />}
          error={!!errors.currentPassword}
          helperText={errors.currentPassword?.message}
          fullWidth
          sx={{ mb: 1.75 }}
          {...register('currentPassword', {
            required: 'Current password is required',
          })}
        />

        <MuiTextField
          label="New Password"
          isPassword
          autoComplete="new-password"
          startIcon={<LockOutlined fontSize="small" />}
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
          fullWidth
          sx={{ mb: 1.25 }}
          {...register('newPassword', {
            required: 'New password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
            validate: {
              hasUppercase: (v) => /[A-Z]/.test(v) || 'Must contain at least one uppercase letter',
              hasLowercase: (v) => /[a-z]/.test(v) || 'Must contain at least one lowercase letter',
              hasNumber: (v) => /[0-9]/.test(v) || 'Must contain at least one number',
            },
          })}
        />

        {/* Live Password Criteria Tracker */}
        <Box
          sx={{
            p: 1.25,
            mb: 1.75,
            borderRadius: 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 0.75 }}>
            Password Requirements:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            {criteria.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {item.met ? (
                  <CheckCircle sx={{ fontSize: 15, color: 'success.main' }} />
                ) : (
                  <RadioButtonUnchecked sx={{ fontSize: 15, color: 'text.disabled' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    color: item.met ? 'success.main' : 'text.secondary',
                    fontWeight: item.met ? 600 : 400,
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <MuiTextField
          label="Confirm New Password"
          isPassword
          autoComplete="new-password"
          startIcon={<LockOutlined fontSize="small" />}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
          fullWidth
          sx={{ mb: 2 }}
          {...register('confirmPassword', {
            required: 'Please confirm your new password',
            validate: (v, formValues) => v === formValues.newPassword || 'Passwords do not match',
          })}
        />

        <Divider sx={{ my: 1.5 }} />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <MuiButton
            type="submit"
            variant="contained"
            size="small"
            loading={isLoading}
            disabled={isLoading}
          >
            Update Password
          </MuiButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SecurityTab;
