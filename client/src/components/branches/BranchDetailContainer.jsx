/**
 * @module components/branches/BranchDetailContainer
 * @description Detail view container for a single company branch.
 * Displays branch metadata, statistics summary, and associated audit reports ledger.
 */
import { useState } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { alpha } from '@mui/material/styles';
import ArrowBackOutlined from '@mui/icons-material/ArrowBackOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import AssessmentOutlined from '@mui/icons-material/AssessmentOutlined';
import ReportProblemOutlined from '@mui/icons-material/ReportProblemOutlined';
import DescriptionOutlined from '@mui/icons-material/DescriptionOutlined';
import MuiButton from '../reusable/MuiButton.jsx';
import MuiEmptyState from '../reusable/MuiEmptyState.jsx';
import LoadingSpinner from '../reusable/LoadingSpinner.jsx';
import BranchDialog from './BranchDialog.jsx';
import { useGetBranchByIdQuery } from '../../redux/features/branches/branchApi.js';

export const BranchDetailContainer = () => {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { data: response, isLoading, error } = useGetBranchByIdQuery(branchId);
  const branch = response?.data;

  if (isLoading) {
    return <LoadingSpinner message="Loading branch details..." height="70vh" />;
  }

  if (error || !branch) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <MuiEmptyState
          icon={<StorefrontOutlined sx={{ fontSize: 40 }} />}
          title="Branch Not Found"
          description="The requested company branch could not be found or has been removed."
          action={
            <MuiButton
              variant="contained"
              size="small"
              startIcon={<ArrowBackOutlined />}
              onClick={() => navigate('/branches')}
            >
              Back to Branches
            </MuiButton>
          }
        />
      </Container>
    );
  }

  const isArchived = Boolean(branch.isArchived);

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3 } }}>
      {/* Breadcrumbs Navigation */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2, fontSize: '0.875rem' }}>
        <Link
          component={RouterLink}
          to="/dashboard"
          underline="hover"
          color="inherit"
        >
          Dashboard
        </Link>
        <Link
          component={RouterLink}
          to="/branches"
          underline="hover"
          color="inherit"
        >
          Branches
        </Link>
        <Typography color="text.primary" fontWeight={600}>
          {branch.name}
        </Typography>
      </Breadcrumbs>

      {/* Main Header Banner */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mb: 3,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 }, minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: { xs: 42, sm: 56 },
              height: { xs: 42, sm: 56 },
              borderRadius: '50%',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <StorefrontOutlined sx={{ fontSize: { xs: 22, sm: 28 } }} />
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                noWrap
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  fontSize: { xs: '1.125rem', sm: '1.5rem' },
                }}
              >
                {branch.name}
              </Typography>
              <Chip
                label={isArchived ? 'Archived' : 'Active'}
                size="small"
                color={isArchived ? 'warning' : 'success'}
                variant={isArchived ? 'outlined' : 'filled'}
                sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22, flexShrink: 0 }}
              />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              sx={{ mt: 0.5, overflow: 'hidden', textOverflow: 'ellipsis' }}
            >
              Registered on {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : '—'}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          <MuiButton
            variant="outlined"
            size="small"
            responsiveIconOnly={true}
            startIcon={<ArrowBackOutlined />}
            tooltipTitle="All Branches"
            onClick={() => navigate('/branches')}
          >
            All Branches
          </MuiButton>
          <MuiButton
            variant="contained"
            size="small"
            responsiveIconOnly={true}
            startIcon={<EditOutlined />}
            tooltipTitle="Edit Branch"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Branch
          </MuiButton>
        </Stack>
      </Paper>

      {/* KPI Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Phone Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <PhoneOutlined fontSize="small" />
              <Typography variant="caption" fontWeight={600} textTransform="uppercase">
                Contact Phone
              </Typography>
            </Box>
            <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
              {branch.phone || 'None provided'}
            </Typography>
          </Paper>
        </Grid>

        {/* Address Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'text.secondary' }}>
              <LocationOnOutlined fontSize="small" />
              <Typography variant="caption" fontWeight={600} textTransform="uppercase">
                Physical Location
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
              {branch.address || 'No physical address or landmark registered'}
            </Typography>
          </Paper>
        </Grid>

        {/* Audits / Reports Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'primary.main' }}>
              <AssessmentOutlined fontSize="small" />
              <Typography variant="caption" fontWeight={600} textTransform="uppercase">
                Total Audits Logged
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {branch.totalReports || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Associated operational reports
            </Typography>
          </Paper>
        </Grid>

        {/* Open Issues Count */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, color: 'warning.main' }}>
              <ReportProblemOutlined fontSize="small" />
              <Typography variant="caption" fontWeight={600} textTransform="uppercase">
                Open Issues
              </Typography>
            </Box>
            <Typography variant="h5" fontWeight={700}>
              {branch.openIssues || 0}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Requiring supervisor intervention
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Associated Reports Section */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
          Associated Audit Reports
        </Typography>

        <MuiEmptyState
          icon={<DescriptionOutlined sx={{ fontSize: 36 }} />}
          title="No reports logged for this branch yet"
          description="Operational reports associated with this branch will be listed here once recorded via the Report Builder."
          action={
            <MuiButton
              variant="contained"
              size="small"
              onClick={() => navigate('/chat')}
            >
              Start New Report
            </MuiButton>
          }
          sx={{ border: 'none', bgcolor: 'transparent', p: 2 }}
        />
      </Paper>

      {/* Edit Dialog */}
      <BranchDialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        isEdit={true}
        branch={branch}
      />
    </Container>
  );
};

export default BranchDetailContainer;
