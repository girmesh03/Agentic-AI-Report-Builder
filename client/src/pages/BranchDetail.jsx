/**
 * @module pages/BranchDetail
 * @description Lean page orchestrator for company branch details view.
 */
import BranchDetailContainer from '../components/branches/BranchDetailContainer.jsx';

/**
 * Branch details page orchestrator.
 * Remains strictly under 35 lines of code per Invariant 9.
 *
 * @function BranchDetail
 * @returns {JSX.Element}
 */
export const BranchDetail = () => {
  return <BranchDetailContainer />;
};

export default BranchDetail;
