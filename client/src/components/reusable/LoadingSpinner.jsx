/**
 * @module components/reusable/LoadingSpinner
 * @description Standardized reusable loading spinner for route transitions, async operations, and lazy containers.
 */
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/**
 * Standardized reusable loading indicator component.
 * Displays a centered circular progress indicator with an optional status message.
 *
 * @component
 * @param {object} props - Component properties.
 * @param {string} [props.message='Loading...'] - Text description displayed below the spinner.
 * @param {string | number} [props.height='100%'] - Container height or minHeight.
 * @param {'small' | 'medium' | 'large'} [props.size='small'] - Spinner indicator dimension scale.
 * @param {object} [props.sx={}] - Additional emotion sx styling overrides.
 * @returns {JSX.Element} The rendered centered loading spinner container.
 */
export const LoadingSpinner = ({
  message = 'Loading...',
  height = '100%',
  size = 'small',
  sx = {},
}) => {
  const progressSize = size === 'large' ? 48 : size === 'medium' ? 36 : 24;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        minHeight: height,
        height,
        gap: 1.5,
        p: 3,
        boxSizing: 'border-box',
        ...sx,
      }}
    >
      <CircularProgress size={progressSize} color="primary" disableShrink />
      {Boolean(message) && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 500,
            letterSpacing: '0.01em',
            textAlign: 'center',
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
