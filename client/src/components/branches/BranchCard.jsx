/**
 * @module components/branches/BranchCard
 * @description Card view representation of a company branch for mobile viewports and card layout.
 */
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import StorefrontOutlined from '@mui/icons-material/StorefrontOutlined';
import PhoneOutlined from '@mui/icons-material/PhoneOutlined';
import LocationOnOutlined from '@mui/icons-material/LocationOnOutlined';
import VisibilityOutlined from '@mui/icons-material/VisibilityOutlined';
import EditOutlined from '@mui/icons-material/EditOutlined';
import ArchiveOutlined from '@mui/icons-material/ArchiveOutlined';
import UnarchiveOutlined from '@mui/icons-material/UnarchiveOutlined';

/**
 * Responsive Branch Card presentation component.
 *
 * @component BranchCard
 * @param {object} props - Component properties.
 * @param {object} props.branch - Branch entity document.
 * @param {Function} [props.onViewDetails] - Handler for viewing branch details.
 * @param {Function} [props.onEdit] - Handler for editing branch.
 * @param {Function} [props.onArchive] - Handler for archiving branch.
 * @param {Function} [props.onRestore] - Handler for restoring branch.
 * @returns {JSX.Element} Rendered branch card.
 */
export const BranchCard = ({
  branch,
  onViewDetails,
  onEdit,
  onArchive,
  onRestore,
}) => {
  const isArchived = Boolean(branch.isArchived);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.4),
          boxShadow: (theme) =>
            theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0,0,0,0.5)'
              : '0 4px 20px rgba(0,0,0,0.06)',
        },
      }}
    >
      {/* Top Section: Icon, Name, Status Chip */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1, mr: 1 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                flexShrink: 0,
              }}
            >
              <StorefrontOutlined fontSize="small" />
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
                variant="subtitle1"
                fontWeight={700}
                noWrap
                sx={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  '&:hover': { color: 'primary.main' },
                }}
                onClick={() => onViewDetails?.(branch)}
              >
                {branch.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Added {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString() : '—'}
              </Typography>
            </Box>
          </Box>

          <Chip
            label={isArchived ? 'Archived' : 'Active'}
            size="small"
            color={isArchived ? 'warning' : 'success'}
            variant={isArchived ? 'outlined' : 'filled'}
            sx={{ fontWeight: 600, fontSize: '0.75rem', height: 22, flexShrink: 0 }}
          />
        </Box>

        {/* Details: Phone & Address */}
        <Stack spacing={1} sx={{ my: 1.5 }}>
          {branch.phone && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', minWidth: 0 }}>
              <PhoneOutlined fontSize="small" sx={{ fontSize: 16, opacity: 0.75, flexShrink: 0 }} />
              <Typography variant="body2" noWrap sx={{ fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {branch.phone}
              </Typography>
            </Box>
          )}

          {branch.address && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, color: 'text.secondary', minWidth: 0 }}>
              <LocationOnOutlined fontSize="small" sx={{ fontSize: 16, opacity: 0.75, mt: 0.25, flexShrink: 0 }} />
              <Typography
                variant="body2"
                sx={{
                  lineHeight: 1.4,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {branch.address}
              </Typography>
            </Box>
          )}

          {!branch.phone && !branch.address && (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
              No contact details or address provided.
            </Typography>
          )}
        </Stack>
      </Box>

      {/* Bottom Actions Toolbar */}
      <Box
        sx={{
          pt: 1.5,
          mt: 1.5,
          borderTop: '1px solid',
          borderColor: (theme) => alpha(theme.palette.divider, 0.6),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 0.5,
        }}
      >
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
    </Paper>
  );
};

export default BranchCard;
