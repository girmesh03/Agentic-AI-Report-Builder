/**
 * @module layouts/Sidebar
 * @description Responsive navigation sidebar with mini-rail mode, navigation links, user footer popover menu, and focus trap safeguards.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import DashboardOutlined from '@mui/icons-material/DashboardOutlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import AddCommentOutlined from '@mui/icons-material/AddCommentOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import Logo from '../components/reusable/Logo.jsx';
import { selectCurrentUser } from '../redux/features/auth/authSlice.js';
import { useLogoutMutation } from '../redux/features/auth/authApi.js';
import { LAYOUT_CONSTANTS, APP_ROUTES } from '../utils/constants.js';

/**
 * @typedef {object} NavItem
 * @property {string} label - Display label for the navigation link.
 * @property {string} path - Route path to navigate to.
 * @property {React.ReactNode} icon - MUI icon element.
 */

/**
 * Primary navigation items rendered in the sidebar.
 * @type {NavItem[]}
 */
const NAV_ITEMS = [
  { label: 'Dashboard', path: APP_ROUTES.DASHBOARD, icon: <DashboardOutlined fontSize="small" /> },
  { label: 'Branches', path: APP_ROUTES.BRANCHES, icon: <AccountTreeOutlined fontSize="small" /> },
  { label: 'Reports', path: APP_ROUTES.REPORTS, icon: <DescriptionOutlined fontSize="small" /> },
];

/**
 * Responsive navigation sidebar component conforming to Section 10.3.2.
 * Supports expanded (240px) and mini-rail (64px) modes on desktop, and temporary overlay on mobile.
 * Features bottom user summary card with identical popover menu to MuiAppbar per Point 9.
 *
 * @component Sidebar
 * @param {object} props - Component properties.
 * @param {boolean} props.open - Whether the sidebar drawer is open.
 * @param {boolean} props.expanded - Whether the sidebar is in expanded (240px) mode.
 * @param {Function} props.onClose - Callback to close the temporary mobile drawer.
 * @param {Function} props.onToggleExpand - Callback to toggle expanded/mini-rail state.
 * @param {boolean} props.isMobile - Whether the current viewport is below md breakpoint.
 * @returns {JSX.Element} Rendered responsive sidebar drawer.
 */
export const Sidebar = ({ open, expanded, onClose, onToggleExpand, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector(selectCurrentUser);
  const [logout] = useLogoutMutation();
  const [loggingOut, setLoggingOut] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const drawerWidth = expanded ? LAYOUT_CONSTANTS.SIDEBAR_EXPANDED_WIDTH : LAYOUT_CONSTANTS.SIDEBAR_MINI_WIDTH;
  const userMenuOpen = Boolean(userMenuAnchor);

  /**
   * Navigates to the specified route and closes mobile drawer.
   * @param {string} path - Target route path.
   */
  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  /** Opens user menu dropdown anchored to footer element. */
  const handleOpenUserMenu = (event) => {
    event.stopPropagation();
    if (event.currentTarget) {
      event.currentTarget.blur();
    }
    setUserMenuAnchor(event.currentTarget);
  };

  /** Closes user menu dropdown. */
  const handleCloseUserMenu = () => {
    if (document.activeElement && typeof document.activeElement.blur === 'function') {
      document.activeElement.blur();
    }
    setUserMenuAnchor(null);
  };

  /** Navigates to user profile view. */
  const handleProfileClick = () => {
    handleCloseUserMenu();
    handleNavigate(APP_ROUTES.PROFILE);
  };

  /** Handles supervisor logout action. */
  const handleLogout = async () => {
    handleCloseUserMenu();
    setLoggingOut(true);
    try {
      await logout().unwrap();
    } catch {
      // Client-side logout proceeds regardless
    }
    setLoggingOut(false);
    navigate(APP_ROUTES.LOGIN, { replace: true });
  };

  /**
   * Checks if a navigation path is the active route.
   * @param {string} path - Route path to check.
   * @returns {boolean} Whether the route is currently active.
   */
  const isActive = (path) => location.pathname.startsWith(path);

  const userInitials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  const drawerContent = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden',
        bgcolor: "background.paper",
      }}
    >
      {/* Header: Logo & Collapse Toggle */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: expanded ? 'space-between' : 'center',
          px: expanded ? 2 : 0,
          py: 1.5,
          minHeight: LAYOUT_CONSTANTS.APPBAR_HEIGHT + 8,
        }}
      >
        {expanded ? (
          <>
            <Logo to={APP_ROUTES.DASHBOARD} size="small" />
            <IconButton onClick={onToggleExpand} size="small" aria-label="Collapse sidebar">
              <ChevronLeftIcon fontSize="small" />
            </IconButton>
          </>
        ) : (
          <Tooltip title="Expand sidebar" placement="right">
            <IconButton onClick={onToggleExpand} size="small" aria-label="Expand sidebar">
              <ChevronRightIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider />

      {/* Top Action: + New Chat */}
      <Box sx={{ px: expanded ? 2 : 1, py: 1 }}>
        {expanded ? (
          <ListItemButton
            onClick={() => handleNavigate(APP_ROUTES.CHAT)}
            sx={{
              borderRadius: 1,
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              '&:hover': { bgcolor: 'primary.dark' },
              justifyContent: 'center',
            }}
          >
            <ListItemIcon sx={{ color: 'inherit', minWidth: 32 }}>
              <AddCommentOutlined fontSize="small" />
            </ListItemIcon>
            <ListItemText
              primary="New Chat"
              slotProps={{ primary: { fontWeight: 600, fontSize: '0.875rem' } }}
            />
          </ListItemButton>
        ) : (
          <Tooltip title="New Chat" placement="right">
            <IconButton
              onClick={() => handleNavigate(APP_ROUTES.CHAT)}
              size="small"
              sx={{
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '&:hover': { bgcolor: 'primary.dark' },
                width: 40,
                height: 40,
                mx: 'auto',
                display: 'flex',
              }}
            >
              <AddCommentOutlined fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Navigation Links */}
      <List sx={{ flexGrow: 1, px: expanded ? 1 : 0.5, py: 0.5 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const button = (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={active}
                sx={{
                  borderRadius: 1,
                  minHeight: 40,
                  justifyContent: expanded ? 'flex-start' : 'center',
                  px: expanded ? 2 : 1,
                  bgcolor: (theme) =>
                    active
                      ? alpha(
                          theme.palette.primary.main,
                          theme.palette.mode === 'dark' ? 0.2 : 0.1
                        )
                      : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  borderLeft: active ? '3px solid' : '3px solid transparent',
                  borderColor: active ? 'primary.main' : 'transparent',
                  '&.Mui-selected': {
                    bgcolor: (theme) =>
                      `${alpha(
                        theme.palette.primary.main,
                        theme.palette.mode === 'dark' ? 0.2 : 0.1
                      )} !important`,
                    color: 'primary.main',
                    borderLeft: '3px solid',
                    borderColor: 'primary.main',
                  },
                  '&:hover, &.Mui-selected:hover': {
                    bgcolor: (theme) =>
                      active
                        ? `${alpha(
                            theme.palette.primary.main,
                            theme.palette.mode === 'dark' ? 0.28 : 0.16
                          )} !important`
                        : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? 'primary.main' : 'text.secondary',
                    minWidth: expanded ? 36 : 'auto',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {expanded && (
                  <ListItemText
                    primary={item.label}
                    slotProps={{
                      primary: {
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 400,
                        color: active ? 'primary.main' : 'text.primary',
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          );

          return expanded ? (
            button
          ) : (
            <Tooltip key={item.label} title={item.label} placement="right">
              {button}
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* Footer: User Profile Summary with Popover Menu */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: expanded ? 1.5 : 1,
          justifyContent: expanded ? 'space-between' : 'center',
          gap: expanded ? 1.5 : 0.5,
          minHeight: 56,
        }}
      >
        {expanded ? (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                minWidth: 0,
                flex: 1,
              }}
            >
              <Avatar
                src={user?.avatar ? `${import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '')}/${user.avatar}` : undefined}
                sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.main', flexShrink: 0 }}
              >
                {userInitials}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                <Typography variant="body2" noWrap fontWeight={600} fontSize="0.8rem">
                  {user?.fullName || user?.email || 'Supervisor'}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap fontSize="0.7rem">
                  {user?.position || 'Area Supervisor'}
                </Typography>
              </Box>
            </Box>
            <Tooltip title="User options">
              <IconButton
                size="small"
                onClick={handleOpenUserMenu}
                aria-label="User options"
                aria-controls={userMenuOpen ? 'sidebar-user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={userMenuOpen ? 'true' : undefined}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        ) : (
          <Tooltip title="User options" placement="right">
            <IconButton
              size="small"
              onClick={handleOpenUserMenu}
              aria-label="User options"
              aria-controls={userMenuOpen ? 'sidebar-user-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={userMenuOpen ? 'true' : undefined}
              sx={{ p: 0.25 }}
            >
              <MoreVertIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* User Popover Menu mirroring MuiAppbar menu */}
      <Menu
        id="sidebar-user-menu"
        anchorEl={userMenuAnchor}
        open={userMenuOpen}
        onClose={handleCloseUserMenu}
        autoFocus={false}
        disableAutoFocusItem={true}
        disableRestoreFocus={true}
        transformOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'top' }}
        slotProps={{
          paper: {
            sx: { minWidth: 180, mb: 1 },
          },
        }}
      >
        <MenuItem onClick={handleProfileClick} dense>
          <ListItemIcon>
            <PersonOutline fontSize="small" />
          </ListItemIcon>
          <ListItemText slotProps={{ primary: { fontSize: '0.875rem' } }}>
            Profile
          </ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} dense disabled={loggingOut}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText slotProps={{ primary: { fontSize: '0.875rem' } }}>
            Logout
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onClose}
        disableEnforceFocus
        disableRestoreFocus
        slotProps={{
          modal: {
            keepMounted: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
          },
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: LAYOUT_CONSTANTS.SIDEBAR_EXPANDED_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      open
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s ease-in-out',
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
