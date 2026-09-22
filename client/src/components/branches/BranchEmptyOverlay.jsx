/**
 * @module components/branches/BranchEmptyOverlay
 * @description Standardized empty overlay for company branches data grid and card views.
 * Reuses MuiEmptyState to provide actionable guidance when no branches match.
 */
import Box from '@mui/material/Box';
import AddOutlined from '@mui/icons-material/AddOutlined';
import AccountTreeOutlined from '@mui/icons-material/AccountTreeOutlined';
import MuiEmptyState from '../reusable/MuiEmptyState.jsx';
import MuiButton from '../reusable/MuiButton.jsx';

/**
 * Empty overlay component tailored for branches view.
 *
 * @component BranchEmptyOverlay
 * @param {object} props - Component properties.
 * @param {Function} [props.onAddBranch] - Callback to open create branch dialog.
 * @param {boolean} [props.isFiltered=false] - Whether empty state is due to search/filter query.
 * @returns {JSX.Element} Rendered empty state overlay.
 */
export const BranchEmptyOverlay = ({ onAddBranch, isFiltered = false }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: 280,
        p: 3,
      }}
    >
      <MuiEmptyState
        icon={<AccountTreeOutlined sx={{ fontSize: 36 }} />}
        title={isFiltered ? 'No matching branches found' : 'No branches registered yet'}
        description={
          isFiltered
            ? 'No branches match your current search query or filter criteria. Try clearing the search box.'
            : 'You have not registered any store or inspection branch locations yet. Add your first branch to begin generating reports.'
        }
        action={
          onAddBranch && !isFiltered ? (
            <MuiButton
              variant="contained"
              size="small"
              startIcon={<AddOutlined />}
              onClick={onAddBranch}
            >
              Add Your First Branch
            </MuiButton>
          ) : null
        }
        sx={{
          border: 'none',
          bgcolor: 'transparent',
          boxShadow: 'none',
          p: 0,
        }}
      />
    </Box>
  );
};

export default BranchEmptyOverlay;
