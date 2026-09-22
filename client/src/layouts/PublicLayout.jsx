/**
 * @module layouts/PublicLayout
 * @description Public header (Theme toggle, Login, Sign Up) + Isolated scrollable Outlet for public views.
 */
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Container from '@mui/material/Container';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Outlet, useNavigate, useNavigation } from 'react-router';
import Logo from '../components/reusable/Logo.jsx';
import MuiButton from '../components/reusable/MuiButton.jsx';
import LoadingSpinner from '../components/reusable/LoadingSpinner.jsx';
import { useThemeMode } from '../theme/useThemeMode.js';

/**
 * Public Layout component framing unauthenticated marketing and auth views.
 * Features a fixed-top AppBar with Logo, Theme toggle, Login, and Sign Up action controls.
 * Enforces isolated viewport scrolling where only the inner main content area scrolls while
 * the AppBar remains strictly fixed and excluded from page scroll.
 *
 * @component
 * @returns {JSX.Element} The rendered public navigation shell with isolated scrollable outlet.
 */
export const PublicLayout = () => {
  const navigate = useNavigate();
  const navigation = useNavigation();
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Rigid Top Header: Excluded from page scroll */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between', py: 1 }}>
            {/* Left Section: Brand Logo */}
            <Logo to="/" size="small" />

            {/* Right Section: Theme Toggle, Login, Sign Up */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
              <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                <IconButton onClick={toggleTheme} color="inherit" size="small" sx={{ p: 1 }}>
                  {mode === 'dark' ? <Brightness7Icon fontSize="small" /> : <Brightness4Icon fontSize="small" />}
                </IconButton>
              </Tooltip>

              <MuiButton
                variant="outlined"
                size="small"
                startIcon={<LoginIcon fontSize="small" />}
                responsiveIconOnly
                tooltipTitle="Login"
                onClick={() => navigate('/login')}
              >
                Login
              </MuiButton>

              <MuiButton
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon fontSize="small" />}
                responsiveIconOnly
                tooltipTitle="Sign Up"
                onClick={() => navigate('/register')}
              >
                Sign Up
              </MuiButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content: Sole Scrollable Container */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {navigation.state === 'loading' ? (
          <LoadingSpinner message="Navigating..." height="100%" />
        ) : (
          <Outlet />
        )}
      </Box>
    </Box>
  );
};

export default PublicLayout;
