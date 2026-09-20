/**
 * @module pages/NotFound
 * @description 404 page featuring dedicated notFound_404.svg asset.
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import MuiButton from '../components/reusable/MuiButton.jsx';
import notFoundSvg from '../assets/notFound_404.svg';

/**
 * 404 Not Found error page rendering the dedicated vector illustration asset
 * (client/src/assets/notFound_404.svg) and a return-to-home CTA.
 *
 * @function NotFound
 * @returns {JSX.Element} The rendered 404 error page.
 */
export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, sm: 8, md: 10 }, textAlign: 'center', my: 'auto' }}>
      <Box
        component="img"
        src={notFoundSvg}
        alt="404 Page Not Found Illustration"
        sx={(theme) => ({
          width: '100%',
          maxWidth: { xs: 280, sm: 380, md: 440 },
          height: 'auto',
          mb: 4,
          filter: 'drop-shadow(0 12px 24px rgba(32, 101, 209, 0.15))',
          ...theme.applyStyles('dark', {
            filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5))',
          }),
        })}
      />
      <Typography
        variant="h1"
        sx={{
          fontWeight: 800,
          fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
          letterSpacing: '-0.02em',
          mb: 1.5,
          color: 'text.primary',
        }}
      >
        Page Not Found
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          mb: 4,
          maxWidth: 480,
          mx: 'auto',
          fontSize: { xs: '0.95rem', sm: '1.05rem' },
          lineHeight: 1.6,
        }}
      >
        The requested resource could not be found or has been moved to another location.
      </Typography>
      <MuiButton
        variant="contained"
        size="small"
        startIcon={<ArrowBackIcon fontSize="small" />}
        onClick={() => navigate('/')}
        sx={{ px: 3, py: 1 }}
      >
        Return to Home
      </MuiButton>
    </Container>
  );
};

export default NotFound;
