/**
 * @module components/reusable/MuiDatePicker
 * @description Standardized, reusable Ethiopian Date Picker button trigger and popover.
 * Adheres strictly to:
 * - Value in Ethiopian Date format DD-MM-YY (e.g. 12-01-19)
 * - Default: Today (Ethiopian Calendar)
 * - Zero Amharic text (all English & numeric)
 * - Month selector: September (Meskerem) ... August (Nehase), and Pagume
 * - Button render with start calendar icon and end clear icon
 * - 100% responsive on extra small (xs) screens
 */
import { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CalendarTodayOutlined from '@mui/icons-material/CalendarTodayOutlined';
import CloseOutlined from '@mui/icons-material/CloseOutlined';
import ChevronLeftOutlined from '@mui/icons-material/ChevronLeftOutlined';
import ChevronRightOutlined from '@mui/icons-material/ChevronRightOutlined';
import MuiButton from './MuiButton.jsx';
import {
  ETHIOPIAN_MONTH_NAMES_EN,
  getTodayEthiopianDate,
  parseEthiopianDateString,
  ethiopianToGregorian,
} from '../../utils/ethiopianDate.js';

const WEEKDAYS_EN = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/**
 * Reusable MuiDatePicker component.
 *
 * @component MuiDatePicker
 * @param {object} props - Component properties.
 * @param {string} [props.value] - Ethiopian date string in DD-MM-YY format.
 * @param {Function} props.onChange - Callback receiving the selected DD-MM-YY string.
 * @param {boolean} [props.disabled=false] - Whether picker is disabled.
 * @param {boolean} [props.fullWidth=false] - Whether button expands full width.
 * @param {string} [props.size='small'] - Button size.
 * @param {string} [props.placeholder='Select Date'] - Placeholder when empty.
 * @returns {JSX.Element} Rendered date picker button & popover.
 */
export const MuiDatePicker = ({
  value,
  onChange,
  disabled = false,
  fullWidth = false,
  size = 'small',
  placeholder = 'Select Date',
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);

  const todayStr = useMemo(() => getTodayEthiopianDate(), []);
  const activeValue = value !== undefined && value !== null ? value : todayStr;

  const parsedActive = useMemo(() => {
    return parseEthiopianDateString(activeValue) || parseEthiopianDateString(todayStr);
  }, [activeValue, todayStr]);

  // View state for browsing months/years in the popover
  const [viewYear, setViewYear] = useState(parsedActive?.year || 2019);
  const [viewMonth, setViewMonth] = useState(parsedActive?.month || 1);

  const handleOpen = (e) => {
    if (disabled) return;
    if (parsedActive) {
      setViewYear(parsedActive.year);
      setViewMonth(parsedActive.month);
    }
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

  const handleSelectDay = (day) => {
    const dd = String(day).padStart(2, '0');
    const mm = String(viewMonth).padStart(2, '0');
    const yy = String(viewYear % 100).padStart(2, '0');
    const newDateStr = `${dd}-${mm}-${yy}`;
    if (onChange) {
      onChange(newDateStr);
    }
    handleClose();
  };

  const handleTodayClick = () => {
    if (onChange) {
      onChange(todayStr);
    }
    handleClose();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(13);
      setViewYear((prev) => prev - 1);
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 13) {
      setViewMonth(1);
      setViewYear((prev) => prev + 1);
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  // Calculate days in the current Ethiopian month
  const daysInMonth = useMemo(() => {
    if (viewMonth <= 12) return 30;
    // Month 13 is Pagume: 6 days in leap year, 5 days otherwise
    return viewYear % 4 === 3 ? 6 : 5;
  }, [viewMonth, viewYear]);

  // Calculate starting weekday offset (Monday = 0 ... Sunday = 6)
  const startDayOffset = useMemo(() => {
    try {
      const greg = ethiopianToGregorian(viewYear, viewMonth, 1);
      return (greg.getUTCDay() + 6) % 7;
    } catch {
      return 0;
    }
  }, [viewYear, viewMonth]);

  const yearOptions = useMemo(() => {
    const years = [];
    const currentEthYear = parsedActive?.year || 2019;
    for (let y = currentEthYear - 5; y <= currentEthYear + 5; y++) {
      years.push(y);
    }
    return years;
  }, [parsedActive]);

  return (
    <>
      <MuiButton
        variant="outlined"
        size={size}
        color="inherit"
        disabled={disabled}
        onClick={handleOpen}
        fullWidth={fullWidth}
        startIcon={<CalendarTodayOutlined fontSize="small" sx={{ color: 'primary.main' }} />}
        endIcon={
          activeValue && !disabled ? (
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
              aria-label="Clear date"
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
          color: activeValue ? 'text.primary' : 'text.secondary',
          minWidth: 140,
        }}
      >
        {activeValue || placeholder}
      </MuiButton>

      {/* Popover Calendar Grid */}
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
              width: 310,
              maxWidth: 'calc(100vw - 32px)',
              borderRadius: 2,
              boxShadow: 4,
              border: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'none',
              backgroundColor: 'background.default',
            },
          },
        }}
      >
        {/* Navigation Header */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <IconButton size="small" onClick={handlePrevMonth} aria-label="Previous Month">
            <ChevronLeftOutlined fontSize="small" />
          </IconButton>

          <Stack direction="row" spacing={1} alignItems="center">
            {/* Month Selector (September ... August, Pagume) */}
            <Select
              size="small"
              value={viewMonth}
              onChange={(e) => setViewMonth(Number(e.target.value))}
              sx={{ fontSize: '0.825rem', height: 32 }}
            >
              {ETHIOPIAN_MONTH_NAMES_EN.map((mName, idx) => (
                <MenuItem key={mName} value={idx + 1} sx={{ fontSize: '0.825rem' }}>
                  {mName}
                </MenuItem>
              ))}
            </Select>

            {/* Year Selector */}
            <Select
              size="small"
              value={viewYear}
              onChange={(e) => setViewYear(Number(e.target.value))}
              sx={{ fontSize: '0.825rem', height: 32 }}
            >
              {yearOptions.map((y) => (
                <MenuItem key={y} value={y} sx={{ fontSize: '0.825rem' }}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <IconButton size="small" onClick={handleNextMonth} aria-label="Next Month">
            <ChevronRightOutlined fontSize="small" />
          </IconButton>
        </Stack>

        {/* Weekday Row (Mo, Tu, We, Th, Fr, Sa, Su) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            mb: 0.75,
            textAlign: 'center',
          }}
        >
          {WEEKDAYS_EN.map((wd) => (
            <Typography
              key={wd}
              variant="caption"
              sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.75rem' }}
            >
              {wd}
            </Typography>
          ))}
        </Box>

        {/* Days Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: 0.5,
            mb: 1.5,
          }}
        >
          {/* Offset empty slots */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <Box key={`offset-${i}`} sx={{ width: '100%', height: 32 }} />
          ))}

          {/* Day buttons 1..daysInMonth */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected =
              parsedActive?.year === viewYear &&
              parsedActive?.month === viewMonth &&
              parsedActive?.day === dayNum;

            const isToday =
              todayStr ===
              `${String(dayNum).padStart(2, '0')}-${String(viewMonth).padStart(2, '0')}-${String(
                viewYear % 100
              ).padStart(2, '0')}`;

            return (
              <Box
                key={`day-${dayNum}`}
                role="button"
                tabIndex={0}
                onClick={() => handleSelectDay(dayNum)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') handleSelectDay(dayNum);
                }}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: 32,
                  borderRadius: '50%',
                  fontSize: '0.8rem',
                  fontWeight: isSelected || isToday ? 700 : 500,
                  cursor: 'pointer',
                  bgcolor: isSelected ? 'primary.main' : 'transparent',
                  color: isSelected ? 'primary.contrastText' : isToday ? 'primary.main' : 'text.primary',
                  border: isToday && !isSelected ? '1px solid' : 'none',
                  borderColor: 'primary.main',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isSelected ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                {dayNum}
              </Box>
            );
          })}
        </Box>

        {/* Footer shortcuts */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}
        >
          <MuiButton size="small" variant="text" color="inherit" onClick={handleClear}>
            Clear
          </MuiButton>
          <MuiButton size="small" variant="text" color="primary" onClick={handleTodayClick}>
            Today
          </MuiButton>
        </Stack>
      </Popover>
    </>
  );
};

export default MuiDatePicker;
