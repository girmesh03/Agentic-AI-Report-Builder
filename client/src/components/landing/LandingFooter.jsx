/**
 * @module components/landing/LandingFooter
 * @description Footer component for Option A Product Landing Page.
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

/**
 * Landing Footer component displaying copyright notices, version chip, and legal links.
 *
 * @component
 * @returns {JSX.Element} The rendered footer component.
 */
export const LandingFooter = () => {
  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 4,
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} Report Builder. All rights reserved. Standardized Amharic Operational Intelligence.
          </Typography>

          <Stack direction="row" spacing={3} alignItems="center">
            <Chip label="v1.0.0" size="small" sx={{ fontWeight: 600 }} />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              Privacy Policy
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
            >
              Terms of Service
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default LandingFooter;
