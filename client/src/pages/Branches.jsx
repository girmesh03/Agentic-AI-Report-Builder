/**
 * @module pages/Branches
 * @description Branches view orchestrator rendering MuiEmptyState placeholder for Phase 2.
 */
import Container from '@mui/material/Container';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import MuiEmptyState from '../components/reusable/MuiEmptyState.jsx';

/**
 * Branches management orchestrator page.
 * Remains a lean page shell (< 35 lines) per Invariant 9.
 *
 * @function Branches
 * @returns {JSX.Element} Rendered branches view with empty state.
 */
export const Branches = () => {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3 } }}>
      <MuiEmptyState
        icon={<AccountTreeOutlined sx={{ fontSize: 36 }} />}
        title="Branches Management"
        description="Multi-branch configuration, geocoding coordinates, and operational parameters will be activated in Phase 3."
      />
    </Container>
  );
};

export default Branches;
