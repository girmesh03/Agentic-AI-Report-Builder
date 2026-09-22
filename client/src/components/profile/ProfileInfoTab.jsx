/**
 * @module components/profile/ProfileInfoTab
 * @description Profile information tab with avatar upload, identity hero, responsive 2-column form, and save controls.
 */
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import PersonOutline from '@mui/icons-material/PersonOutline';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import BadgeOutlined from '@mui/icons-material/BadgeOutlined';
import PhotoCameraOutlined from '@mui/icons-material/PhotoCameraOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import MuiTextField from '../reusable/MuiTextField.jsx';
import MuiButton from '../reusable/MuiButton.jsx';
import { selectCurrentUser } from '../../redux/features/auth/authSlice.js';
import { useUpdateProfileMutation, useUploadAvatarMutation } from '../../redux/features/auth/authApi.js';
import { ETHIOPIAN_PHONE_REGEX } from '../../utils/constants.js';

/**
 * Profile information tab component for Section 10.6.5.
 * Features an identity hero section with avatar upload, role chip, and 2-column field grid.
 *
 * @component ProfileInfoTab
 * @returns {JSX.Element} Rendered profile info form.
 */
export const ProfileInfoTab = () => {
  const user = useSelector(selectCurrentUser);
  const [updateProfile, { isLoading: updating }] = useUpdateProfileMutation();
  const [uploadAvatar, { isLoading: uploading }] = useUploadAvatarMutation();
  const [message, setMessage] = useState({ type: '', text: '' });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
      position: user?.position || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        position: user.position || '',
      });
    }
  }, [user, reset]);

  /** Handles profile info form submission. */
  const onSubmit = async (data) => {
    setMessage({ type: '', text: '' });
    if (!isDirty) {
      setMessage({ type: 'info', text: 'No changes detected to save.' });
      return;
    }
    try {
      await updateProfile(data).unwrap();
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to update profile.' });
    }
  };

  /** Handles avatar file selection and upload. */
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMessage({ type: '', text: '' });
    const formData = new FormData();
    formData.append('avatar', file);
    try {
      await uploadAvatar(formData).unwrap();
      setMessage({ type: 'success', text: 'Avatar updated successfully.' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.data?.message || 'Failed to upload avatar.' });
    }
  };

  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <Box>
      {message.text && (
        <Alert
          severity={message.type}
          sx={{ mb: 3 }}
          onClose={() => setMessage({ type: '', text: '' })}
        >
          {message.text}
        </Alert>
      )}

      {/* Identity Hero Section */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          p: 1.75,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
          border: '1px solid',
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={
              user?.avatar
                ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/${user.avatar}`
                : undefined
            }
            sx={{
              width: 80,
              height: 80,
              fontSize: '1.75rem',
              fontWeight: 700,
              bgcolor: 'primary.main',
              boxShadow: 2,
            }}
          >
            {userInitials}
          </Avatar>
          <Tooltip title={uploading ? 'Uploading...' : 'Change avatar'}>
            <Box
              component="label"
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                bgcolor: 'background.paper',
                borderRadius: '50%',
                boxShadow: 2,
                cursor: uploading ? 'default' : 'pointer',
              }}
            >
              <IconButton
                component="span"
                size="small"
                disabled={uploading}
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: 'background.paper',
                  border: '1.5px solid',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                {uploading ? (
                  <CircularProgress size={14} />
                ) : (
                  <PhotoCameraOutlined sx={{ fontSize: 15, color: 'text.secondary' }} />
                )}
              </IconButton>
              <input
                type="file"
                hidden
                accept="image/jpeg,image/png,image/webp"
                disabled={uploading}
                onChange={handleAvatarChange}
              />
            </Box>
          </Tooltip>
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5, flexWrap: 'wrap' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }} noWrap>
              {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Supervisor'}
            </Typography>
            <Chip
              label={user?.role?.toUpperCase() || 'SUPERVISOR'}
              size="small"
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
            />
            <Chip
              icon={<CheckCircleOutline sx={{ fontSize: '14px !important' }} />}
              label="Active Account"
              size="small"
              color="success"
              variant="outlined"
              sx={{ fontWeight: 500, fontSize: '0.7rem', height: 22 }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }} noWrap>
            {user?.email || 'No email registered'}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.75rem' }}>
            {user?.position || 'Area Supervisor'}
          </Typography>
        </Box>
      </Box>

      {/* Profile Form Header */}
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        Personal Details
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Update your personal identity and contact numbers below.
      </Typography>

      {/* Profile Form */}
      <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 1.75,
            mb: 1.75,
          }}
        >
          <MuiTextField
            label="First Name"
            startIcon={<PersonOutline fontSize="small" />}
            error={!!errors.firstName}
            helperText={errors.firstName?.message}
            fullWidth
            {...register('firstName', {
              required: 'First name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
          />
          <MuiTextField
            label="Last Name"
            startIcon={<PersonOutline fontSize="small" />}
            error={!!errors.lastName}
            helperText={errors.lastName?.message}
            fullWidth
            {...register('lastName', {
              required: 'Last name is required',
              minLength: { value: 2, message: 'At least 2 characters' },
            })}
          />
          <MuiTextField
            label="Email Address"
            startIcon={<EmailOutlined fontSize="small" />}
            value={user?.email || ''}
            disabled
            helperText="Managed by organization - cannot be changed"
            fullWidth
          />
          <MuiTextField
            label="Phone Number"
            placeholder="+251912345678"
            startIcon={<PhoneOutlined fontSize="small" />}
            error={!!errors.phone}
            helperText={errors.phone?.message || 'Format: +251XXXXXXXXX'}
            fullWidth
            {...register('phone', {
              pattern: {
                value: ETHIOPIAN_PHONE_REGEX,
                message: 'Enter a valid Ethiopian phone number (+251XXXXXXXXX)',
              },
            })}
          />
          <Box sx={{ gridColumn: { xs: '1', sm: '1 / -1' } }}>
            <MuiTextField
              label="Position / Title"
              placeholder="e.g. Area Supervisor - Addis Ababa North"
              startIcon={<BadgeOutlined fontSize="small" />}
              error={!!errors.position}
              helperText={errors.position?.message}
              fullWidth
              {...register('position', {
                maxLength: { value: 100, message: 'Maximum 100 characters' },
              })}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {/* Action Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, justifyContent: 'flex-end' }}>
          <MuiButton
            variant="outlined"
            size="small"
            disabled={!isDirty || updating}
            onClick={() =>
              reset({
                firstName: user?.firstName || '',
                lastName: user?.lastName || '',
                phone: user?.phone || '',
                position: user?.position || '',
              })
            }
          >
            Reset
          </MuiButton>
          <MuiButton
            type="submit"
            variant="contained"
            size="small"
            loading={updating}
            disabled={updating}
          >
            Save Changes
          </MuiButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ProfileInfoTab;
