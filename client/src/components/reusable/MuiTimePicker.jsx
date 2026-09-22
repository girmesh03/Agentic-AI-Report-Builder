/**
 * @module components/reusable/MuiTimePicker
 * @description Standardized, reusable 24-hour Time Picker button trigger and analog clock popover.
 * Features:
 * - Button render with start clock icon and end clear icon
 * - Value in 24-hour format HH:mm (e.g. 08:30, 17:00)
 * - Clock version popover with analog circular clock face (TimeClock)
 * - 100% responsive on extra small (xs) screens
 */
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccessTimeOutlined from '@mui/icons-material/AccessTimeOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimeClock } from '@mui/x-date-pickers/TimeClock';
import dayjs from 'dayjs';
import MuiButton from './MuiButton.jsx';

/**
 * Reusable MuiTimePicker component.
 *
 * @component MuiTimePicker
 * @param {object} props - Component properties.
 * @param {string} [props.value=''] - 24-hour time string (HH:mm).
 * @param {Function} props.onChange - Callback receiving the selected HH:mm string.
 * @param {boolean} [props.disabled=false] - Whether picker is disabled.
 * @param {boolean} [props.fullWidth=false] - Whether button expands full width.
 * @param {string} [props.size='small'] - Button size.
 * @param {string} [props.placeholder='Select Time'] - Placeholder when empty.
 * @param {string} [props.label] - Optional header label.
 * @param {boolean} [props.ampm=false] - Whether to use 12h AM/PM or 24h format (defaults to 24h).
 * @returns {JSX.Element} Rendered time picker button & clock popover.
 */
export const MuiTimePicker = ({
  value = '',
  onChange,
  disabled = false,
  fullWidth = false,
  size = 'small',
  placeholder = 'Select Time',
  label = '',
  ampm = false,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const dayjsValue = useMemo(() => {
    if (!value || typeof value !== 'string') return null;
    const parts = value.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    return dayjs().hour(h).minute(m).second(0);
  }, [value]);

  const handleOpen = (e) => {
    if (disabled) return;
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (onChange) {
      onChange('');
    }
  };

  const handleClockChange = (newVal) => {
    if (!newVal || !dayjs.isDayjs(newVal)) return;
    const formatted = newVal.format('HH:mm');
    if (onChange) {
      onChange(formatted);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
        {label && (
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            {label}
          </Typography>
        )}

        <MuiButton
          variant="outlined"
          size={size}
          color="inherit"
          disabled={disabled}
          onClick={handleOpen}
          fullWidth={fullWidth}
          startIcon={<AccessTimeOutlined fontSize="small" sx={{ color: 'primary.main' }} />}
          endIcon={
            value && !disabled ? (
              <Box
                component="span"
                role="button"
                tabIndex={0}
                onClick={handleClear}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleClear(e);
                }}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 0.25,
                  borderRadius: '50%',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover', color: 'error.main' },
                }}
                aria-label="Clear time"
              >
                <CloseOutlined sx={{ fontSize: 16 }} />
              </Box>
            ) : null
          }
          sx={{
            justifyContent: 'space-between',
            px: 1.5,
            py: 0.75,
            fontWeight: 600,
            fontFamily: 'monospace, sans-serif',
            letterSpacing: 0.5,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            color: value ? 'text.primary' : 'text.secondary',
            minWidth: 120,
          }}
        >
          {value || placeholder}
        </MuiButton>

        {/* Popover Clock Face */}
        <Popover
          open={isOpen}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              sx: {
                p: 1.5,
                borderRadius: 2,
                boxShadow: 4,
                border: '1px solid',
                borderColor: 'divider',
                maxWidth: 'calc(100vw - 32px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                backgroundImage: 'none',
                backgroundColor: 'background.default',
              },
            },
          }}
        >
          <Box sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
              {value || '08:30'}
            </Typography>
          </Box>

          <TimeClock
            value={dayjsValue || dayjs().hour(8).minute(30)}
            onChange={handleClockChange}
            ampm={ampm}
            views={['hours', 'minutes']}
            sx={{
              maxWidth: 260,
              maxHeight: 260,
            }}
          />

          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ width: '100%', mt: 1 }}>
            <MuiButton size="small" variant="text" color="inherit" onClick={handleClear}>
              Clear
            </MuiButton>
            <MuiButton size="small" variant="contained" color="primary" onClick={handleClose}>
              Done
            </MuiButton>
          </Stack>
        </Popover>
      </Box>
    </LocalizationProvider>
  );
};

export default MuiTimePicker;
