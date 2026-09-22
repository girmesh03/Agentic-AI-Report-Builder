/**
 * @module components/reports/VisitDialog
 * @description Modal dialog for adding or editing a visited branch interval.
 * Captures branch selection, 24-hour clockIn time, and 24-hour clockOut time.
 */
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import MuiDialog from '../reusable/MuiDialog.jsx';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiTimePicker from '../reusable/MuiTimePicker.jsx';
import { useGetBranchesQuery } from '../../redux/features/branches/branchApi.js';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * Inner form component with isolated local state.
 * Mounted with a unique key so state resets cleanly on open/close without effects.
 */
const VisitFormContent = ({ branches, initialData, onSave, onClose }) => {
  const initialBranch = useMemo(() => {
    if (!initialData) return null;
    return (
      branches.find((b) => b._id === initialData.branch) || {
        _id: initialData.branch,
        name: initialData.branchName,
      }
    );
  }, [branches, initialData]);

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [clockIn, setClockIn] = useState(initialData?.clockIn || '09:00');
  const [clockOut, setClockOut] = useState(initialData?.clockOut || '11:00');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!selectedBranch) {
      newErrors.branch = 'Please select a branch';
    }
    if (!TIME_REGEX.test(clockIn)) {
      newErrors.clockIn = 'Must be HH:mm (24-hour format)';
    }
    if (!TIME_REGEX.test(clockOut)) {
      newErrors.clockOut = 'Must be HH:mm (24-hour format)';
    }
    if (TIME_REGEX.test(clockIn) && TIME_REGEX.test(clockOut) && clockIn >= clockOut) {
      newErrors.clockOut = 'Departure must be after arrival time';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      branch: selectedBranch._id,
      branchName: selectedBranch.name,
      clockIn,
      clockOut,
    });
    onClose();
  };

  return (
    <>
      <Box component="form" sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Autocomplete
          size="small"
          options={branches}
          getOptionLabel={(opt) => opt.name || ''}
          value={selectedBranch}
          onChange={(_e, val) => setSelectedBranch(val)}
          isOptionEqualToValue={(option, val) => option._id === val?._id}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Branch"
              placeholder="Search store branch..."
              error={Boolean(errors.branch)}
              helperText={errors.branch}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Box sx={{ flex: 1 }}>
            <MuiTimePicker
              label="Arrival (Clock-In)"
              value={clockIn}
              onChange={(val) => setClockIn(val)}
              fullWidth
            />
            {errors.clockIn && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                {errors.clockIn}
              </Typography>
            )}
          </Box>

          <Box sx={{ flex: 1 }}>
            <MuiTimePicker
              label="Departure (Clock-Out)"
              value={clockOut}
              onChange={(val) => setClockOut(val)}
              fullWidth
            />
            {errors.clockOut && (
              <Typography variant="caption" color="error.main" sx={{ display: 'block', mt: 0.5 }}>
                {errors.clockOut}
              </Typography>
            )}
          </Box>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Visits will be automatically ordered chronologically by arrival time.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        <MuiButton variant="outlined" size="small" onClick={onClose}>
          Cancel
        </MuiButton>
        <MuiButton variant="contained" size="small" onClick={handleSave}>
          Save Visit
        </MuiButton>
      </Stack>
    </>
  );
};

/**
 * Visited Branch Interval modal dialog.
 *
 * @component VisitDialog
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether dialog is open.
 * @param {Function} props.onClose - Close callback.
 * @param {Function} props.onSave - Save callback receiving { branch, branchName, clockIn, clockOut }.
 * @param {object} [props.initialData=null] - Pre-filled visit data for edit mode.
 * @returns {JSX.Element} Rendered visit dialog.
 */
export const VisitDialog = ({ open, onClose, onSave, initialData = null }) => {
  const { data: branchResponse } = useGetBranchesQuery({ limit: 100, isArchived: false });
  const branches = useMemo(() => branchResponse?.data?.docs || [], [branchResponse]);

  return (
    <MuiDialog
      open={open}
      onClose={onClose}
      title={initialData ? 'Edit Branch Visit' : 'Add Visited Branch Interval'}
      maxWidth="xs"
      actions={null}
    >
      {open && (
        <VisitFormContent
          key={initialData ? `${initialData.branch}-${initialData.clockIn}` : 'new-visit'}
          branches={branches}
          initialData={initialData}
          onSave={onSave}
          onClose={onClose}
        />
      )}
    </MuiDialog>
  );
};

export default VisitDialog;
