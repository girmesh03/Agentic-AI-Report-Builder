/**
 * @module components/auth/RegisterForm
 * @description Decomposed registration form with email/password/confirmPassword fields and validation.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import GoogleIcon from '@mui/icons-material/Google';
import MuiTextField from '../reusable/MuiTextField.jsx';
import MuiButton from '../reusable/MuiButton.jsx';
import { useRegisterMutation } from '../../redux/features/auth/authApi.js';
import { APP_ROUTES, EMAIL_REGEX } from '../../utils/constants.js';

/**
 * Registration form component with react-hook-form validation and RTK Query register mutation.
 *
 * @component RegisterForm
 * @returns {JSX.Element} Rendered registration form card.
 */
export const RegisterForm = () => {
  const navigate = useNavigate();
  const [registerUser, { isLoading }] = useRegisterMutation();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  /**
   * Handles registration form submission.
   * @param {{ email: string, password: string, confirmPassword: string }} data - Validated form payload.
   */
  const onSubmit = async (data) => {
    setServerError('');
    try {
      await registerUser(data).unwrap();
      navigate(APP_ROUTES.LOGIN, { replace: true });
    } catch (err) {
      const errorMessage =
        err?.data?.details?.[0]?.message ||
        err?.data?.message ||
        'Registration failed. Please try again.';
      setServerError(errorMessage);
    }
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
          Create Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Register to start generating daily Amharic reports.
        </Typography>

        {serverError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setServerError('')}>
            {serverError}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <MuiTextField
            label="Email"
            placeholder="your.email@example.com"
            autoComplete="email"
            startIcon={<EmailOutlined fontSize="small" />}
            error={!!errors.email}
            helperText={errors.email?.message}
            sx={{ mb: 2 }}
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: EMAIL_REGEX,
                message: 'Enter a valid email address',
              },
            })}
          />

          <MuiTextField
            label="Password"
            isPassword
            autoComplete="new-password"
            startIcon={<LockOutlined fontSize="small" />}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 2 }}
            {...register('password', {
              required: 'Password is required',
              minLength: {
                value: 8,
                message: 'Password must be at least 8 characters',
              },
              validate: {
                hasUppercase: (v) =>
                  /[A-Z]/.test(v) || 'Password must contain at least one uppercase letter',
                hasLowercase: (v) =>
                  /[a-z]/.test(v) || 'Password must contain at least one lowercase letter',
                hasNumber: (v) =>
                  /[0-9]/.test(v) || 'Password must contain at least one number',
              },
            })}
          />

          <MuiTextField
            label="Confirm Password"
            isPassword
            autoComplete="new-password"
            startIcon={<LockOutlined fontSize="small" />}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
            sx={{ mb: 3 }}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v, formValues) => v === formValues.password || 'Passwords do not match',
            })}
          />

          <MuiButton
            type="submit"
            variant="contained"
            fullWidth
            size="small"
            loading={isLoading}
            sx={{ mb: 2 }}
          >
            Create Account
          </MuiButton>
        </Box>

        <Divider sx={{ my: 2 }}>
          <Typography variant="caption" color="text.secondary">
            OR
          </Typography>
        </Divider>

        <MuiButton
          variant="outlined"
          fullWidth
          size="small"
          startIcon={<GoogleIcon fontSize="small" />}
          sx={{ mb: 2 }}
          disabled
        >
          Continue with Google
        </MuiButton>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" underline="hover" fontWeight={600}>
            Sign In
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
