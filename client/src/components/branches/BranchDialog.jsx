/**
 * @module components/branches/BranchDialog
 * @description Standardized, reusable modal dialog for creating and editing company branches.
 * Powered by react-hook-form with onBlur validation and duplicate collision resolution.
 */
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import MuiDialog from '../reusable/MuiDialog.jsx';
import MuiTextField from '../reusable/MuiTextField.jsx';
import {
  useCreateBranchMutation,
  useUpdateBranchMutation,
} from '../../redux/features/branches/branchApi.js';
import { ETHIOPIAN_PHONE_REGEX } from '../../utils/constants.js';

/**
 * Reusable modal dialog for creating and editing company branches.
 *
 * @component BranchDialog
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether dialog is open.
 * @param {Function} props.onClose - Close dialog callback.
 * @param {boolean} [props.isEdit=false] - Edit mode toggle.
 * @param {object|null} [props.branch=null] - Branch to edit if isEdit is true.
 * @returns {JSX.Element} Rendered Branch Dialog.
 */
export const BranchDialog = ({ open, onClose, isEdit = false, branch = null }) => {
  const [createBranch, { isLoading: isCreating }] = useCreateBranchMutation();
  const [updateBranch, { isLoading: isUpdating }] = useUpdateBranchMutation();
  const isSubmitting = isCreating || isUpdating;

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      name: '',
      phone: '',
      address: '',
    },
  });

  // Synchronize form values when opening dialog in edit mode
  useEffect(() => {
    if (open) {
      if (isEdit && branch) {
        reset({
          name: branch.name || '',
          phone: branch.phone || '',
          address: branch.address || '',
        });
      } else {
        reset({
          name: '',
          phone: '',
          address: '',
        });
      }
    }
  }, [open, isEdit, branch, reset]);

  const onSubmit = async (formData) => {
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone?.trim() || null,
        address: formData.address?.trim() || null,
      };

      if (isEdit && branch?._id) {
        await updateBranch({
          branchId: branch._id,
          ...payload,
        }).unwrap();
      } else {
        await createBranch(payload).unwrap();
      }

      onClose();
    } catch (err) {
      // Handle 409 Conflict duplicate name collision
      if (err?.status === 409 || err?.data?.message?.includes('already exists')) {
        setError('name', {
          type: 'manual',
          message: 'A branch with this name already exists for your account.',
        });
      } else {
        setError('root', {
          type: 'manual',
          message: err?.data?.message || 'Failed to save branch. Please try again.',
        });
      }
    }
  };

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Branch' : 'Add New Branch'}
      icon={<StorefrontOutlined />}
      submitLabel={isEdit ? 'Save Changes' : 'Create Branch'}
      onSubmit={handleSubmit(onSubmit)}
      loading={isSubmitting}
      disabled={isSubmitting}
      maxWidth="sm"
    >
      <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2.5}>
          {/* Branch Name Field */}
          <Controller
            name="name"
            control={control}
            rules={{
              required: 'Branch name is required',
              minLength: { value: 1, message: 'Branch name cannot be empty' },
              maxLength: { value: 100, message: 'Branch name cannot exceed 100 characters' },
            }}
            render={({ field }) => (
              <MuiTextField
                {...field}
                label="Branch Name"
                placeholder="e.g., Bole Medhanialem, ሳርቤት"
                required
                fullWidth
                error={Boolean(errors.name)}
                helperText={errors.name?.message}
                startIcon={<StorefrontOutlined fontSize="small" />}
                onClear={() => field.onChange('')}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Contact Phone Field */}
          <Controller
            name="phone"
            control={control}
            rules={{
              pattern: {
                value: ETHIOPIAN_PHONE_REGEX,
                message: 'Phone must follow Ethiopian format (+251XXXXXXXXX)',
              },
            }}
            render={({ field }) => (
              <MuiTextField
                {...field}
                label="Contact Phone (Optional)"
                placeholder="+251911223344"
                fullWidth
                error={Boolean(errors.phone)}
                helperText={errors.phone?.message || 'Ethiopian mobile format: +251 followed by 9 digits'}
                startIcon={<PhoneOutlined fontSize="small" />}
                onClear={() => field.onChange('')}
                disabled={isSubmitting}
              />
            )}
          />

          {/* Address / Location Field */}
          <Controller
            name="address"
            control={control}
            rules={{
              maxLength: { value: 250, message: 'Address cannot exceed 250 characters' },
            }}
            render={({ field }) => (
              <MuiTextField
                {...field}
                label="Physical Address / Landmark (Optional)"
                placeholder="e.g., Bole, near Edna Mall, 2nd Floor"
                fullWidth
                multiline
                rows={2}
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
                startIcon={<LocationOnOutlined fontSize="small" />}
                onClear={() => field.onChange('')}
                disabled={isSubmitting}
              />
            )}
          />

          {errors.root && (
            <Box sx={{ color: 'error.main', fontSize: '0.8125rem' }}>
              {errors.root.message}
            </Box>
          )}
        </Stack>
      </Box>
    </MuiDialog>
  );
};

export default BranchDialog;
