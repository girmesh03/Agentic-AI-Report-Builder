/**
 * @module components/branches/BranchContainer
 * @description Primary container for Company Branches management directory.
 * Orchestrates DataGrid vs Card view switching, search filtering, active/archived tabs,
 * pagination, and Create/Edit/Archive modal dialogs.
 */
import { useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Grid from '@mui/material/Grid2';
import Pagination from '@mui/material/Pagination';
import AddOutlined from '@mui/icons-material/AddOutlined';
import TableViewOutlined from '@mui/icons-material/TableViewOutlined';
import ViewModuleOutlined from '@mui/icons-material/ViewModuleOutlined';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiDataGrid from '../reusable/MuiDataGrid.jsx';
import MuiDataGridToolbar from '../reusable/MuiDataGridToolbar.jsx';
import MuiConfirmDialog from '../reusable/MuiConfirmDialog.jsx';
import LoadingSpinner from '../reusable/LoadingSpinner.jsx';
import BranchCard from './BranchCard.jsx';
import BranchDialog from './BranchDialog.jsx';
import BranchEmptyOverlay from './BranchEmptyOverlay.jsx';
import { getBranchColumns } from '../columns/branch.jsx';
import {
  setIsArchivedFilter,
  setViewMode,
  setPagination,
  openCreateDialog,
  openEditDialog,
  closeDialog,
} from '../../redux/features/branches/branchSlice.js';
import {
  useGetBranchesQuery,
  useArchiveBranchMutation,
  useRestoreBranchMutation,
} from '../../redux/features/branches/branchApi.js';

export const BranchContainer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    searchQuery,
    isArchivedFilter,
    viewMode,
    page,
    limit,
    sort,
    isDialogOpen,
    dialogMode,
    selectedBranch,
  } = useSelector((state) => state.branches);

  // RTK Query hooks
  const {
    data: branchResponse,
    isLoading,
    isFetching,
  } = useGetBranchesQuery({
    page,
    limit,
    search: searchQuery,
    isArchived: isArchivedFilter,
    sort,
  });

  const [archiveBranch, { isLoading: isArchiving }] = useArchiveBranchMutation();
  const [restoreBranch, { isLoading: isRestoring }] = useRestoreBranchMutation();

  // Local state for archive confirmation dialog
  const [archiveTarget, setArchiveTarget] = useState(null);

  const branches = branchResponse?.data?.docs || [];
  const totalDocs = branchResponse?.data?.totalDocs || 0;
  const totalPages = branchResponse?.data?.totalPages || 1;

  // Navigation handlers
  const handleViewDetails = useCallback((branch) => {
    navigate(`/branches/${branch._id}/details`);
  }, [navigate]);

  const handleEdit = useCallback((branch) => {
    dispatch(openEditDialog(branch));
  }, [dispatch]);

  const handleArchiveClick = useCallback((branch) => {
    setArchiveTarget(branch);
  }, []);

  const handleConfirmArchive = async () => {
    if (archiveTarget?._id) {
      await archiveBranch(archiveTarget._id).unwrap();
      setArchiveTarget(null);
    }
  };

  const handleRestoreClick = useCallback(async (branch) => {
    if (branch?._id) {
      await restoreBranch(branch._id).unwrap();
    }
  }, [restoreBranch]);

  // DataGrid Column Definitions memoized with callbacks
  const columns = useMemo(
    () =>
      getBranchColumns({
        onViewDetails: handleViewDetails,
        onEdit: handleEdit,
        onArchive: handleArchiveClick,
        onRestore: handleRestoreClick,
      }),
    [handleViewDetails, handleEdit, handleArchiveClick, handleRestoreClick]
  );

  // Pagination change handler
  const handlePaginationModelChange = (model) => {
    dispatch(
      setPagination({
        page: model.page + 1, // DataGrid is 0-indexed; backend is 1-indexed
        limit: model.pageSize,
      })
    );
  };

  // Empty state overlay for DataGrid slots
  const CustomNoRowsOverlay = useMemo(
    () => () => (
      <BranchEmptyOverlay
        onAddBranch={() => dispatch(openCreateDialog())}
        isFiltered={Boolean(searchQuery)}
      />
    ),
    [dispatch, searchQuery]
  );

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 }, px: { xs: 2, sm: 3 } }}>
      {/* Header Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
          mb: 3,
        }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="h5"
            fontWeight={700}
            noWrap
            sx={{
              letterSpacing: '-0.02em',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
          >
            Company Branches
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
          >
            Manage your company store and inspection branch locations.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
          {/* View Mode Toggle Button Group */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_e, next) => next && dispatch(setViewMode(next))}
            size="small"
            sx={{
              display: 'inline-flex',
              '& .MuiToggleButton-root': {
                p: 0.75,
                height: 32,
              },
            }}
          >
            <ToggleButton value="grid" aria-label="table view">
              <TableViewOutlined fontSize="small" />
            </ToggleButton>
            <ToggleButton value="card" aria-label="card view">
              <ViewModuleOutlined fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Single Create Branch Button: on xs renders as icon button, on sm+ full text button */}
          <MuiButton
            variant="contained"
            size="small"
            responsiveIconOnly={true}
            startIcon={<AddOutlined />}
            tooltipTitle="Add Branch"
            onClick={() => dispatch(openCreateDialog())}
            sx={{ flexShrink: 0, height: 32 }}
          >
            Add Branch
          </MuiButton>
        </Box>
      </Box>

      {/* Tabs: Active vs Archived */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={isArchivedFilter ? 1 : 0}
          onChange={(_e, val) => dispatch(setIsArchivedFilter(val === 1))}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Active Branches" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab label="Archived" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>
      </Box>

      {/* Main Content Area */}
      {viewMode === 'grid' ? (
        <MuiDataGrid
          rows={branches}
          columns={columns}
          loading={isLoading || isFetching}
          rowCount={totalDocs}
          paginationModel={{ page: page - 1, pageSize: limit }}
          onPaginationModelChange={handlePaginationModelChange}
          pageSizeOptions={[5, 10, 25, 50]}
          slots={{
            toolbar: MuiDataGridToolbar,
            noRowsOverlay: CustomNoRowsOverlay,
            noResultsOverlay: CustomNoRowsOverlay,
          }}
        />
      ) : (
        /* Card Layout View */
        <Box sx={{ width: '100%' }}>
          {isLoading ? (
            <LoadingSpinner message="Loading branches..." height={320} />
          ) : branches.length === 0 ? (
            <BranchEmptyOverlay
              onAddBranch={() => dispatch(openCreateDialog())}
              isFiltered={Boolean(searchQuery)}
            />
          ) : (
            <>
              <Box sx={{ px: { xs: 0.5, sm: 0 }, width: '100%' }}>
                <Grid container spacing={{ xs: 2, sm: 2.5 }}>
                  {branches.map((branch) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={branch._id}>
                      <BranchCard
                        branch={branch}
                        onViewDetails={handleViewDetails}
                        onEdit={handleEdit}
                        onArchive={handleArchiveClick}
                        onRestore={handleRestoreClick}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Mobile Card Pagination */}
              {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_e, p) => dispatch(setPagination({ page: p }))}
                    color="primary"
                    shape="rounded"
                    size="small"
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}

      {/* Branch Create / Edit Modal Dialog */}
      <BranchDialog
        open={isDialogOpen}
        onClose={() => dispatch(closeDialog())}
        isEdit={dialogMode === 'edit'}
        branch={selectedBranch}
      />

      {/* Archive Confirmation Dialog */}
      <MuiConfirmDialog
        open={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
        title="Archive Branch"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? Archived branches can be restored at any time, but will be hidden from daily reporting.`}
        confirmText="Archive Branch"
        confirmColor="warning"
        loading={isArchiving || isRestoring}
      />
    </Container>
  );
};

export default BranchContainer;
