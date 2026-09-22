/**
 * @module pages/Dashboard
 * @description Lean orchestrator page rendering dashboard domain components.
 */
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import WelcomeBanner from '../components/dashboard/WelcomeBanner.jsx';

/**
 * Dashboard page orchestrator. Hosts the WelcomeBanner and placeholder content.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 * KPI cards and charts will be added in Phase 8.
 *
 * @function Dashboard
 * @returns {JSX.Element} The rendered dashboard page view.
 */
export const Dashboard = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <WelcomeBanner />
      <Typography variant="body2" color="text.secondary">
        Dashboard analytics, KPI cards, and charts will be activated in Phase 8.
      </Typography>
    </Container>
  );
};

export default Dashboard;
