/**
 * @module components/reusable/MuiDataGrid
 * @description Standardized, highly reusable presentation table wrapping @mui/x-data-grid Community Edition.
 * Completely agnostic across domain resources (Branches, Reports, etc.).
 * Inversion of control: caller pages inject custom toolbars and empty overlays via `slots` and `slotProps`.
 */
import Box from '@mui/material/Box';
import { DataGrid } from '@mui/x-data-grid';
import { alpha } from '@mui/material/styles';

/**
 * Standardized DataGrid wrapper for MUI X Community Edition.
 * Conforms to Master Technical Specification Section 10.8.
 *
 * @component MuiDataGrid
 * @param {object} props - Component properties.
 * @param {Array<object>} [props.rows=[]] - Row items to display.
 * @param {Array<object>} [props.columns=[]] - Column definitions with flex widths.
 * @param {boolean} [props.loading=false] - Whether data is actively loading.
 * @param {number} [props.rowCount] - Total server row count for server-side pagination.
 * @param {object} [props.paginationModel] - Current pagination state { page, pageSize }.
 * @param {Function} [props.onPaginationModelChange] - Callback for pagination state changes.
 * @param {Array<number>} [props.pageSizeOptions=[5, 10, 25, 50]] - Page size selector options.
 * @param {string} [props.paginationMode='server'] - 'server' or 'client' pagination mode.
 * @param {string} [props.sortingMode='server'] - 'server' or 'client' sorting mode.
 * @param {Array<object>} [props.sortModel] - Current sort state.
 * @param {Function} [props.onSortModelChange] - Callback for sort changes.
 * @param {object} [props.slots={}] - Injected component slots (toolbar, noRowsOverlay, etc.).
 * @param {object} [props.slotProps={}] - Injected slot props.
 * @param {Function} [props.getRowId=(row) => row._id || row.id] - Row unique identifier resolver.
 * @param {boolean} [props.disableRowSelectionOnClick=true] - Prevent row selection on cell click.
 * @param {boolean} [props.autoHeight=false] - Dynamic height sizing.
 * @param {object} [props.sx={}] - Additional sx styling overrides.
 * @returns {JSX.Element} Rendered agnostic DataGrid.
 */
export const MuiDataGrid = ({
  rows = [],
  columns = [],
  loading = false,
  rowCount,
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [5, 10, 25, 50],
  paginationMode = 'server',
  sortingMode = 'server',
  sortModel,
  onSortModelChange,
  slots = {},
  slotProps = {},
  getRowId = (row) => row._id || row.id,
  disableRowSelectionOnClick = true,
  autoHeight = false,
  sx = {},
  ...rest
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        minHeight: 400,
        height: autoHeight ? 'auto' : 580,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        paginationMode={paginationMode}
        sortingMode={sortingMode}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        slots={slots}
        slotProps={slotProps}
        getRowId={getRowId}
        disableRowSelectionOnClick={disableRowSelectionOnClick}
        autoHeight={autoHeight}
        density="comfortable"
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          bgcolor: 'background.paper',
          fontFamily: (theme) => theme.typography.fontFamily,
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? alpha(theme.palette.background.paper, 0.6)
                : alpha(theme.palette.primary.main, 0.03),
            borderBottom: '1px solid',
            borderColor: 'divider',
            fontWeight: 700,
            fontSize: '0.8125rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontWeight: 700,
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid',
            borderColor: (theme) => alpha(theme.palette.divider, 0.6),
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            py: 1,
          },
          '& .MuiDataGrid-row': {
            transition: 'background-color 0.15s ease',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.primary.main, 0.04),
            },
          },
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid',
            borderColor: 'divider',
            minHeight: 48,
          },
          '& .MuiTablePagination-root': {
            fontSize: '0.8125rem',
          },
          '& .MuiDataGrid-overlayWrapper': {
            minHeight: 280,
          },
          ...sx,
        }}
        {...rest}
      />
    </Box>
  );
};

export default MuiDataGrid;
