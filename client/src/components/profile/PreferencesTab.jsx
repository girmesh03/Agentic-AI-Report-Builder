/**
 * @module components/profile/PreferencesTab
 * @description Preferences tab with modern visual theme cards (Light, Dark, System) and UI display options.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import SettingsBrightnessOutlined from '@mui/icons-material/SettingsBrightnessOutlined';
import { useColorScheme } from '@mui/material/styles';

/**
 * Modern visual theme card option.
 *
 * @param {object} props - Component props.
 * @param {string} props.id - Option ID ('light', 'dark', 'system').
 * @param {string} props.title - Card title.
 * @param {string} props.description - Explanatory text.
 * @param {React.ReactNode} props.icon - MUI icon component.
 * @param {boolean} props.selected - Whether this option is selected.
 * @param {Function} props.onSelect - Callback on selection.
 * @returns {JSX.Element} The rendered selectable card.
 */
const ThemeCard = ({ id, title, description, icon, selected, onSelect }) => (
  <Paper
    elevation={0}
    onClick={() => onSelect(id)}
    sx={{
      p: 2.5,
      cursor: 'pointer',
      borderRadius: 2,
      border: '2px solid',
      borderColor: selected ? 'primary.main' : 'divider',
      bgcolor: selected ? 'action.selected' : 'background.paper',
      transition: 'all 0.2s ease-in-out',
      display: 'flex',
      alignItems: 'flex-start',
      gap: 2,
      '&:hover': {
        borderColor: selected ? 'primary.main' : 'text.secondary',
        bgcolor: 'action.hover',
      },
    }}
  >
    <Box
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: selected ? 'primary.main' : 'action.focus',
        color: selected ? 'primary.contrastText' : 'text.secondary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {icon}
    </Box>

    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Radio
          checked={selected}
          size="small"
          value={id}
          sx={{ p: 0 }}
          aria-label={`Select ${title} theme`}
        />
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
        {description}
      </Typography>
    </Box>
  </Paper>
);

/**
 * Preferences tab component for Section 10.6.5.
 * Provides interactive visual theme cards and display preferences.
 *
 * @component PreferencesTab
 * @returns {JSX.Element} Rendered preferences view.
 */
export const PreferencesTab = () => {
  const { mode, setMode } = useColorScheme();

  const themes = [
    {
      id: 'light',
      title: 'Light Mode',
      description: 'Clean, high-contrast light theme suitable for daylight environments.',
      icon: <LightModeOutlined fontSize="small" />,
    },
    {
      id: 'dark',
      title: 'Dark Mode',
      description: 'Low-light theme engineered to reduce eye strain during evening shifts.',
      icon: <DarkModeOutlined fontSize="small" />,
    },
    {
      id: 'system',
      title: 'System Default',
      description: 'Automatically synchronizes with your device or operating system appearance.',
      icon: <SettingsBrightnessOutlined fontSize="small" />,
    },
  ];

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto' }}>
      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
        Appearance & Theme
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Select your preferred color scheme for the supervisor dashboard and reporting tools.
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%' }}>
        {themes.map((t) => (
          <ThemeCard
            key={t.id}
            id={t.id}
            title={t.title}
            description={t.description}
            icon={t.icon}
            selected={mode === t.id}
            onSelect={setMode}
          />
        ))}
      </Box>
    </Box>
  );
};

export default PreferencesTab;
