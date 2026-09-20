/**
 * @module pages/Landing
 * @description Lean page orchestrator for Option A Product Landing Page.
 * Composes domain components from client/src/components/landing/* (HeroSection, FeatureHighlights, LandingFooter).
 */
import Box from '@mui/material/Box';
import HeroSection from '../components/landing/HeroSection.jsx';
import FeatureHighlights from '../components/landing/FeatureHighlights.jsx';
import LandingFooter from '../components/landing/LandingFooter.jsx';

/**
 * Option A Marketing Landing Page orchestrator showcasing the core value propositions of the
 * Agentic AI Report Builder for multi-branch Ethiopian field operations.
 *
 * @component
 * @returns {JSX.Element} The composed public landing page view.
 */
export const Landing = () => {
  return (
    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <HeroSection />
      <FeatureHighlights />
      <LandingFooter />
    </Box>
  );
};

export default Landing;
