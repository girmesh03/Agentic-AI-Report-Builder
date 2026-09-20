/**
 * @module components/reusable/Logo
 * @description Brand logo component combining vector icon and typography.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { Link as RouterLink } from 'react-router';

/**
 * Brand Logo component combining an assessment vector icon and brand typography.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {string} [props.to='/'] - Router destination link.
 * @param {'small' | 'medium' | 'large'} [props.size='small'] - Display scale (defaults to 'small').
 * @param {boolean} [props.showText=true] - Whether to render text next to the icon.
 * @param {object} [props.sx={}] - Emotion sx style overrides.
 * @returns {JSX.Element} The rendered brand logo link.
 */
export const Logo = ({ to = '/', size = 'small', showText = true, sx = {} }) => {
  const iconSize = size === 'large' ? 32 : size === 'medium' ? 24 : 20;
  const fontSize = size === 'large' ? '1.25rem' : size === 'medium' ? '1.05rem' : '0.95rem';

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1.25,
        textDecoration: 'none',
        color: 'inherit',
        userSelect: 'none',
        ...sx,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize + 10,
          height: iconSize + 10,
          borderRadius: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          boxShadow: '0 2px 8px -2px rgba(37, 99, 235, 0.4)',
        }}
      >
        <AssessmentIcon sx={{ fontSize: iconSize }} />
      </Box>
      {showText && (
        <Typography
          variant="h6"
          component="span"
          sx={{
            fontWeight: 700,
            fontSize,
            letterSpacing: '-0.01em',
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          Report Builder
        </Typography>
      )}
    </Box>
  );
};

export default Logo;
