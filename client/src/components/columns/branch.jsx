/**
 * @module components/columns/branch
 * @description DataGrid column definitions for Company Branches table.
 * Uses flex sizing exclusively (zero hardcoded pixel widths) per Section 10.7.
 */
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined';

/**
 * Generates DataGrid columns configured with action callbacks.
 *
 * @function getBranchColumns
 * @param {object} callbacks - Action handler callbacks.
 * @param {Function} callbacks.onViewDetails - Handler for View Details action.
 * @param {Function} callbacks.onEdit - Handler for Edit action.
 * @param {Function} callbacks.onArchive - Handler for Archive action.
 * @param {Function} callbacks.onRestore - Handler for Restore action.
 * @returns {Array<object>} Array of GridColDef definitions.
 */
export const getBranchColumns = ({ onViewDetails, onEdit, onArchive, onRestore }) => [
  {
    field: 'name',
    headerName: 'Branch Name',
    flex: 1.5,
    minWidth: 160,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <StorefrontOutlined
          fontSize="small"
          sx={{ color: 'primary.main', flexShrink: 0, opacity: 0.85 }}
        />
        <Typography
          variant="body2"
          fontWeight={600}
          noWrap
          sx={{
            cursor: 'pointer',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
          }}
          onClick={() => onViewDetails?.(params.row)}
        >
          {params.value}
        </Typography>
      </Box>
    ),
  },
  {
    field: 'phone',
    headerName: 'Phone',
    flex: 1.1,
    minWidth: 140,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', minWidth: 0 }}>
        {params.value ? (
          <>
            <PhoneOutlined fontSize="small" sx={{ fontSize: 16, opacity: 0.7, flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.value}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'address',
    headerName: 'Address / Location',
    flex: 1.6,
    minWidth: 180,
    renderCell: (params) => (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', minWidth: 0 }}>
        {params.value ? (
          <>
            <LocationOnOutlined fontSize="small" sx={{ fontSize: 16, opacity: 0.7, flexShrink: 0 }} />
            <Typography variant="body2" noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {params.value}
            </Typography>
          </>
        ) : (
          <Typography variant="body2" color="text.disabled">
            —
          </Typography>
        )}
      </Box>
    ),
  },
  {
    field: 'isArchived',
    headerName: 'Status',
    flex: 0.9,
    minWidth: 110,
    renderCell: (params) => {
      const isArchived = Boolean(params.value);
      return (
        <Chip
          label={isArchived ? 'Archived' : 'Active'}
          size="small"
          color={isArchived ? 'warning' : 'success'}
          variant={isArchived ? 'outlined' : 'filled'}
          sx={{
            fontWeight: 600,
            fontSize: '0.75rem',
            height: 22,
          }}
        />
      );
    },
  },
  {
    field: 'createdAt',
    headerName: 'Created',
    flex: 1,
    minWidth: 120,
    valueFormatter: (value) => {
      if (!value) return '—';
      const d = new Date(value);
      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
    },
  },
  {
    field: 'actions',
    headerName: 'Actions',
    flex: 0.9,
    minWidth: 120,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      const branch = params.row;
      const isArchived = Boolean(branch.isArchived);

      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => onViewDetails?.(branch)}
              sx={{
                color: 'info.main',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.info.main, 0.1) },
              }}
            >
              <VisibilityOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit Branch">
            <IconButton
              size="small"
              onClick={() => onEdit?.(branch)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1) },
              }}
            >
              <EditOutlined fontSize="small" />
            </IconButton>
          </Tooltip>

          {isArchived ? (
            <Tooltip title="Restore Branch">
              <IconButton
                size="small"
                onClick={() => onRestore?.(branch)}
                sx={{
                  color: 'success.main',
                  '&:hover': { bgcolor: (theme) => alpha(theme.palette.success.main, 0.1) },
                }}
              >
                <UnarchiveOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="Archive Branch">
              <IconButton
                size="small"
                onClick={() => onArchive?.(branch)}
                sx={{
                  color: 'warning.main',
                  '&:hover': { bgcolor: (theme) => alpha(theme.palette.warning.main, 0.1) },
                }}
              >
                <ArchiveOutlined fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      );
    },
  },
];

export default getBranchColumns;
