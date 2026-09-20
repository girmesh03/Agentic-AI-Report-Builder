/**
 * @module components/landing/HeroSection
 * @description Hero showcase section for Option A Product Landing Page.
 */
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import { useNavigate } from 'react-router';
import MuiButton from '../reusable/MuiButton.jsx';
import heroImg from '../../assets/hero.png';

/**
 * Hero Section component for the landing page.
 * Displays value proposition header, Amharic-first badge, primary CTAs, and the visual hero illustration.
 *
 * @component
 * @returns {JSX.Element} The rendered hero section.
 */
export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={(theme) => ({
        py: { xs: 6, sm: 8, md: 10 },
        background: 'linear-gradient(180deg, rgba(239, 246, 255, 0.6) 0%, rgba(248, 250, 252, 0) 100%)',
        ...theme.applyStyles('dark', {
          background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0) 100%)',
        }),
      })}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 4, md: 6 },
          }}
        >
          {/* Left Content Column */}
          <Box sx={{ flex: 1, maxWidth: { md: 620 } }}>
            <Chip
              label="Amharic-First Field Operations"
              color="primary"
              variant="outlined"
              size="small"
              sx={{ mb: 2.5, fontWeight: 600, px: 1 }}
            />

            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                letterSpacing: '-0.02em',
                lineHeight: { xs: 1.25, md: 1.2 },
                color: 'text.primary',
                mb: 2.5,
              }}
            >
              Standardized Daily Amharic Reporting for Multi-Branch Operations
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', sm: '1.125rem' },
                color: 'text.secondary',
                lineHeight: 1.7,
                mb: 4,
              }}
            >
              Speak naturally in Amharic during branch audits. Automatically compile locked, company-ready daily reports
              with zero mechanical typing fatigue.
            </Typography>

            {/* Primary Action CTAs */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
              <MuiButton
                variant="contained"
                size="small"
                endIcon={<ArrowForwardIcon fontSize="small" />}
                onClick={() => navigate('/register')}
                sx={{ py: 1, px: 2.5 }}
              >
                Get Started Free
              </MuiButton>

              <MuiButton
                variant="outlined"
                size="small"
                startIcon={<LockOpenIcon fontSize="small" />}
                onClick={() => navigate('/login')}
                sx={{ py: 1, px: 2 }}
              >
                Sign In
              </MuiButton>
            </Stack>
          </Box>

          {/* Right Graphic Column */}
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              maxWidth: { xs: 340, sm: 440, md: 500 },
            }}
          >
            <Box
              component="img"
              src={heroImg}
              alt="Agentic AI Report Builder Hero Graphic"
              sx={(theme) => ({
                width: '100%',
                height: 'auto',
                maxHeight: 440,
                objectFit: 'contain',
                borderRadius: 3,
                filter: 'drop-shadow(0 12px 24px rgba(37, 99, 235, 0.15))',
                ...theme.applyStyles('dark', {
                  filter: 'drop-shadow(0 12px 24px rgba(0, 0, 0, 0.5))',
                }),
              })}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HeroSection;
