/**
 * @module components/profile/ProfileContainer
 * @description Master profile container hosting page header, styled Paper frame, tab navigation with icons, and domain tab panels.
 */
import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Link as RouterLink } from 'react-router';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PersonOutline from '@mui/icons-material/PersonOutline';
import LockOutlined from '@mui/icons-material/LockOutlined';
import TuneOutlined from '@mui/icons-material/TuneOutlined';
import WarningAmberOutlined from '@mui/icons-material/WarningAmberOutlined';
import ProfileInfoTab from './ProfileInfoTab.jsx';
import SecurityTab from './SecurityTab.jsx';
import PreferencesTab from './PreferencesTab.jsx';
import DangerZoneTab from './DangerZoneTab.jsx';
import { APP_ROUTES } from '../../utils/constants.js';

/**
 * Tab panel wrapper component.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - Panel contents.
 * @param {number} props.value - Active tab index.
 * @param {number} props.index - Current panel index.
 * @returns {JSX.Element|null} Rendered panel.
 */
const TabPanel = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 2, sm: 2.5 } }}>
          {children}
        </Box>
      )}
    </div>
  );
};

/**
 * Consolidated supervisor profile container with modern Material 3 styling.
 *
 * @component ProfileContainer
 * @returns {JSX.Element} The rendered profile container.
 */
export const ProfileContainer = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Breadcrumb Navigation */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
        aria-label="breadcrumb"
        sx={{ mb: 1.5 }}
      >
        <Link
          component={RouterLink}
          to={APP_ROUTES.DASHBOARD}
          underline="hover"
          color="text.secondary"
          fontSize="0.8rem"
        >
          Dashboard
        </Link>
        <Typography color="text.primary" fontSize="0.8rem" fontWeight={500}>
          Profile
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 700, letterSpacing: '-0.01em', mb: 0.5 }}>
          Account Settings
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage your personal information, security credentials, and application preferences.
        </Typography>
      </Box>

      {/* Card Container Framing Tabs */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        {/* Navigation Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.default' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="Profile navigation tabs"
            sx={{
              minHeight: 48,
              '& .MuiTab-root': {
                minHeight: 48,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
                gap: 1,
                py: 1,
                px: 2.5,
              },
            }}
          >
            <Tab
              id="profile-tab-0"
              aria-controls="profile-tabpanel-0"
              icon={<PersonOutline fontSize="small" />}
              iconPosition="start"
              label="Profile Info"
            />
            <Tab
              id="profile-tab-1"
              aria-controls="profile-tabpanel-1"
              icon={<LockOutlined fontSize="small" />}
              iconPosition="start"
              label="Security"
            />
            <Tab
              id="profile-tab-2"
              aria-controls="profile-tabpanel-2"
              icon={<TuneOutlined fontSize="small" />}
              iconPosition="start"
              label="Preferences"
            />
            <Tab
              id="profile-tab-3"
              aria-controls="profile-tabpanel-3"
              icon={<WarningAmberOutlined fontSize="small" />}
              iconPosition="start"
              label="Danger Zone"
              sx={{
                '&.Mui-selected': {
                  color: 'error.main',
                },
              }}
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <ProfileInfoTab />
        </TabPanel>
        <TabPanel value={activeTab} index={1}>
          <SecurityTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <PreferencesTab />
        </TabPanel>
        <TabPanel value={activeTab} index={3}>
          <DangerZoneTab />
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default ProfileContainer;
