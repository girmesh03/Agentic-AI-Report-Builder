/**
 * @module components/auth/LoginForm
 * @description Decomposed login form with email/password fields, validation, and Google OAuth button.
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router';
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
import { useLoginMutation } from '../../redux/features/auth/authApi.js';
import { APP_ROUTES, EMAIL_REGEX } from '../../utils/constants.js';

/**
 * Login form component with react-hook-form validation, RTK Query login mutation,
 * and Google OAuth 2.0 PKCE initiation button.
 *
 * @component LoginForm
 * @returns {JSX.Element} Rendered login form card.
 */
export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [login, { isLoading }] = useLoginMutation();
  const [serverError, setServerError] = useState('');

  const from = location.state?.from?.pathname || APP_ROUTES.DASHBOARD;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onBlur' });

  /**
   * Handles login form submission.
   * @param {{ email: string, password: string }} data - Validated form payload.
   */
  const onSubmit = async (data) => {
    setServerError('');
    try {
      await login(data).unwrap();
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err?.data?.message || 'Invalid credentials. Please try again.');
    }
  };

  return (
    <Card variant="outlined" sx={{ width: '100%', maxWidth: 420 }}>
      <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5, textAlign: 'center' }}>
          Sign In
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Welcome back! Enter your credentials to continue.
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
            autoComplete="current-password"
            startIcon={<LockOutlined fontSize="small" />}
            error={!!errors.password}
            helperText={errors.password?.message}
            sx={{ mb: 3 }}
            {...register('password', {
              required: 'Password is required',
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
            Sign In
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
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} to="/register" underline="hover" fontWeight={600}>
            Sign Up
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
