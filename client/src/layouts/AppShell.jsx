/**
 * @module layouts/AppShell
 * @description Protected authenticated layout shell with sidebar, sticky AppBar, and isolated scrollable outlet.
 */
import { useState } from 'react';
import { Outlet, useNavigation } from 'react-router';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar.jsx';
import MuiAppbar from './MuiAppbar.jsx';
import LoadingSpinner from '../components/reusable/LoadingSpinner.jsx';

/**
 * Authenticated application shell layout enforcing Section 10.3 and Invariant 11.
 * Composes responsive Sidebar + sticky MuiAppbar + isolated scrollable content outlet.
 * Outer container locks to 100vh with overflow hidden; only the inner main area scrolls.
 *
 * @component AppShell
 * @returns {JSX.Element} Rendered authenticated layout shell.
 */
export const AppShell = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigation = useNavigation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  /** Toggles the mobile temporary drawer. */
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setSidebarExpanded((prev) => !prev);
    }
  };

  /** Closes the mobile temporary drawer. */
  const handleDrawerClose = () => {
    setMobileOpen(false);
  };

  /** Toggles sidebar between expanded and mini-rail. */
  const handleToggleExpand = () => {
    setSidebarExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        maxHeight: '100vh',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Responsive Sidebar */}
      <Sidebar
        open={mobileOpen}
        expanded={isMobile ? true : sidebarExpanded}
        onClose={handleDrawerClose}
        onToggleExpand={handleToggleExpand}
        isMobile={isMobile}
      />

      {/* Right Flex Column: AppBar + Scrollable Content */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        {/* Sticky Top AppBar: Excluded from page scroll */}
        <MuiAppbar onMenuClick={handleDrawerToggle} />

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
    </Box>
  );
};

export default AppShell;
