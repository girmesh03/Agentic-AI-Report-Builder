/**
 * @module components/dashboard/WelcomeBanner
 * @description Greeting banner displaying supervisor name and current date.
 */
import { useSelector } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import WavingHandIcon from '@mui/icons-material/WavingHand';
import { selectCurrentUser } from '../../redux/features/auth/authSlice.js';

/**
 * Welcome banner component for the Dashboard page.
 * Displays supervisor greeting with their full name and the current date.
 *
 * @component WelcomeBanner
 * @returns {JSX.Element} Rendered welcome greeting banner.
 */
export const WelcomeBanner = () => {
  const user = useSelector(selectCurrentUser);
  const displayName = user?.fullName || user?.firstName || 'Supervisor';
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 2,
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <WavingHandIcon fontSize="small" />
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
            Welcome back, {displayName}!
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, fontSize: '0.8rem' }}>
            {today}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default WelcomeBanner;
