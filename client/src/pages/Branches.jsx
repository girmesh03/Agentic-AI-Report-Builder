/**
 * @module pages/Branches
 * @description Lean page orchestrator for company branches management view.
 */
import BranchContainer from '../components/branches/BranchContainer.jsx';

/**
 * Branches directory page orchestrator.
 * Remains strictly under 35 lines of code per Invariant 9.
 *
 * @function Branches
 * @returns {JSX.Element}
 */
export const Branches = () => {
  return <BranchContainer />;
};

export default Branches;
