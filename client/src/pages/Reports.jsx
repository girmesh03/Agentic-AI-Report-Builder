/**
 * @module pages/Reports
 * @description Reports ledger orchestrator rendering MuiEmptyState placeholder for Phase 2.
 */
import Container from '@mui/material/Container';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import MuiEmptyState from '../components/reusable/MuiEmptyState.jsx';

/**
 * Daily reports ledger orchestrator page.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Reports
 * @returns {JSX.Element} Rendered reports view with empty state.
 */
export const Reports = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <MuiEmptyState
        icon={<DescriptionOutlined sx={{ fontSize: 36 }} />}
        title="Daily Reports Ledger"
        description="Daily Amharic reports ledger, audit filtering, and multi-channel export actions will be activated in Phase 4."
      />
    </Container>
  );
};

export default Reports;
