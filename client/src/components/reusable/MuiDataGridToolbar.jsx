/**
 * @module components/reusable/MuiDataGridToolbar
 * @description Standardized, reusable DataGrid toolbar component using MUI X Community components.
 * Completely agnostic and decoupled; passed to MuiDataGrid via `slots={{ toolbar: MuiDataGridToolbar }}`
 * or composed directly from caller page containers.
 */
import Stack from '@mui/material/Stack';
import {
  GridToolbarContainer,
  GridToolbarColumnsButton,
  GridToolbarFilterButton,
  GridToolbarDensitySelector,
} from '@mui/x-data-grid';
/**
 * Standardized DataGrid Toolbar component for Community Edition.
 *
 * @component MuiDataGridToolbar
 * @param {object} props - Component properties.
 * @param {boolean} [props.showColumnsButton=true] - Whether to render columns visibility button.
 * @param {boolean} [props.showFilterButton=false] - Whether to render community filter button.
 * @param {boolean} [props.showDensitySelector=true] - Whether to render density selector.
 * @param {React.ReactNode} [props.children] - Additional controls.
 * @param {object} [props.sx={}] - Additional sx styling overrides.
 * @returns {JSX.Element} Rendered DataGrid toolbar.
 */
export const MuiDataGridToolbar = ({
  showColumnsButton = true,
  showFilterButton = false,
  showDensitySelector = true,
  children,
  sx = {},
}) => {
  return (
    <GridToolbarContainer
      sx={{
        p: { xs: 1, sm: 1.5 },
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 1,
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...sx,
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        flexWrap="wrap"
      >
        {showColumnsButton && (
          <GridToolbarColumnsButton
            slotProps={{
              button: {
                size: 'small',
                sx: { textTransform: 'none', fontWeight: 600, color: 'text.secondary' },
              },
            }}
          />
        )}

        {showFilterButton && (
          <GridToolbarFilterButton
            slotProps={{
              button: {
                size: 'small',
                sx: { textTransform: 'none', fontWeight: 600, color: 'text.secondary' },
              },
            }}
          />
        )}

        {showDensitySelector && (
          <GridToolbarDensitySelector
            slotProps={{
              button: {
                size: 'small',
                sx: { textTransform: 'none', fontWeight: 600, color: 'text.secondary' },
              },
            }}
          />
        )}

        {children}
      </Stack>
    </GridToolbarContainer>
  );
};

export default MuiDataGridToolbar;
