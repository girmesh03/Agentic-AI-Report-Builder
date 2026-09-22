/**
 * @module layouts/MuiAppbar
 * @description Sticky top AppBar for the protected AppShell with strictly 3 right-side controls, mobile toggle visibility, and focus trap safeguards.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Box from '@mui/material/Box';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import { selectCurrentUser } from '../redux/features/auth/authSlice.js';
import { useLogoutMutation } from '../redux/features/auth/authApi.js';
import { useThemeMode } from '../theme/useThemeMode.js';
import { APP_ROUTES } from '../utils/constants.js';

/**
 * Sticky top application bar for the authenticated AppShell layout.
 * Strictly renders 3 right-side controls per Section 10.3.3:
 * Global Search, Theme Toggle, and User Avatar menu.
 * Displays mobile menu toggle icon button only on xs and sm breakpoints.
 *
 * @component MuiAppbar
 * @param {object} props - Component properties.
 * @param {Function} props.onMenuClick - Callback toggling the sidebar drawer on mobile.
 * @returns {JSX.Element} Rendered sticky AppBar.
 */
export const MuiAppbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const { mode, toggleTheme } = useThemeMode();
  const [logout] = useLogoutMutation();
  const [anchorEl, setAnchorEl] = useState(null);

  const menuOpen = Boolean(anchorEl);

  /** Opens the user avatar dropdown menu. */
  const handleAvatarClick = (event) => {
    if (event.currentTarget) {
      event.currentTarget.blur();
    }
    setAnchorEl(event.currentTarget);
  };

  /** Closes the user avatar dropdown menu. */
  const handleMenuClose = () => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    setAnchorEl(null);
  };

  /** Navigates to profile page. */
  const handleProfile = () => {
    handleMenuClose();
    navigate(APP_ROUTES.PROFILE);
  };

  /** Handles supervisor logout and redirect. */
  const handleLogout = async () => {
    handleMenuClose();
    try {
      await logout().unwrap();
    } catch {
      // Client-side logout proceeds regardless
    }
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        flexShrink: 0,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        color: 'text.primary',
        zIndex: (theme) => theme.zIndex.appBar,
      }}
    >
      <Toolbar variant="dense" sx={{ justifyContent: 'space-between', minHeight: 48 }}>
        {/* Left Section: Sidebar Toggle (Strictly visible only on xs and sm per Point 10) */}
        <IconButton
          onClick={onMenuClick}
          size="small"
          edge="start"
          aria-label="Toggle sidebar"
          sx={{ display: { xs: 'inline-flex', md: 'none' }, mr: 1 }}
        >
          <MenuIcon fontSize="small" />
        </IconButton>

        {/* Spacer for desktop layout when hamburger is hidden */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }} />

        {/* Right Section: Strictly 3 Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* 1. Global Search (Wrapped in span to prevent Tooltip on disabled child error per Point 11) */}
          <Tooltip title="Search">
            <Box component="span" sx={{ display: 'inline-flex' }}>
              <IconButton size="small" aria-label="Global search" disabled>
                <SearchIcon fontSize="small" />
              </IconButton>
            </Box>
          </Tooltip>

          {/* 2. Theme Toggle */}
          <Tooltip title={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
            <IconButton onClick={toggleTheme} size="small" aria-label="Toggle theme">
              {mode === 'dark' ? (
                <Brightness7Icon fontSize="small" />
              ) : (
                <Brightness4Icon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>

          {/* 3. User Avatar */}
          <Tooltip title="Account">
            <IconButton onClick={handleAvatarClick} size="small" aria-label="User menu">
              <Avatar
                src={
                  user?.avatar
                    ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/${user.avatar}`
                    : undefined
                }
                sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.main' }}
              >
                {userInitials}
              </Avatar>
            </IconButton>
          </Tooltip>

          {/* Avatar Dropdown Menu with focus trap safeguards per Point 8 */}
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            autoFocus={false}
            disableAutoFocusItem={true}
            disableRestoreFocus={true}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { minWidth: 180, mt: 0.5 },
              },
            }}
          >
            <MenuItem onClick={handleProfile} dense>
              <ListItemIcon>
                <PersonOutline fontSize="small" />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { fontSize: '0.875rem' } }}>
                Profile
              </ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} dense>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText slotProps={{ primary: { fontSize: '0.875rem' } }}>
                Logout
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default MuiAppbar;
