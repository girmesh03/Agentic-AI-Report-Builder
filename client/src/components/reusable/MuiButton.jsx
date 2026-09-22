/**
 * @module components/reusable/MuiButton
 * @description Standardized button wrapper with loading state, forwardRef, layout shift prevention, and responsive iconification.
 */
import { forwardRef } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import Box from '@mui/material/Box';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Standardized forwardRef button wrapper adhering to the project UI design standards.
 * Features built-in loading spinner, layout-shift-free loading states, small sizing default,
 * and mobile `xs` responsive iconification.
 *
 * @component MuiButton
 * @param {object} props - Button props.
 * @param {React.ReactNode} props.children - Button label or contents.
 * @param {boolean} [props.loading=false] - Whether to show circular progress indicator.
 * @param {'start' | 'center' | 'end'} [props.loadingPosition='start'] - Spinner positioning during loading.
 * @param {string} [props.loadingText] - Optional alternative text displayed during loading.
 * @param {boolean} [props.disabled=false] - Whether button is disabled.
 * @param {React.ReactNode} [props.startIcon] - Leading icon element.
 * @param {React.ReactNode} [props.endIcon] - Trailing icon element.
 * @param {boolean} [props.responsiveIconOnly=false] - Whether to collapse to icon-only on xs viewport.
 * @param {string} [props.tooltipTitle] - Accessible tooltip label when iconified or hovered.
 * @param {'small' | 'medium' | 'large'} [props.size='small'] - Component size (defaults to 'small').
 * @param {object} [props.sx={}] - Emotion sx styling overrides.
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded DOM element reference.
 * @returns {JSX.Element} Rendered MUI button with responsive and loading protections.
 */
export const MuiButton = forwardRef(
  (
    {
      children,
      loading = false,
      loadingPosition = 'start',
      loadingText,
      disabled = false,
      startIcon,
      endIcon,
      responsiveIconOnly = false,
      tooltipTitle,
      size = 'small',
      sx = {},
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const isXs = useMediaQuery(theme.breakpoints.down('sm'));
    const showIconOnly = responsiveIconOnly && isXs && (startIcon || endIcon);
    const icon = startIcon || endIcon;

    // Spinner element with standard sizing matching button small scale
    const spinner = <CircularProgress size={16} color="primary" />;

    // Resolve startIcon:
    // If showIconOnly: no startIcon (the icon is rendered as children)
    // If loading and startIcon provided (or loadingPosition is 'start' and no endIcon): render spinner
    let resolvedStartIcon = null;
    if (!showIconOnly) {
      if (loading) {
        if (loadingPosition === 'start' && !loadingText) {
          resolvedStartIcon = spinner;
        } else if (startIcon) {
          resolvedStartIcon = spinner;
        }
      } else {
        resolvedStartIcon = startIcon || null;
      }
    }

    // Resolve endIcon: hide while loading to prevent icon/spinner visual clash
    let resolvedEndIcon = null;
    if (!showIconOnly) {
      if (loading) {
        if (loadingPosition === 'end') {
          resolvedEndIcon = spinner;
        }
      } else {
        resolvedEndIcon = endIcon || null;
      }
    }

    // Resolve button children content:
    let resolvedChildren;
    if (showIconOnly) {
      // In icon-only mode, if loading, display ONLY the spinner (never spinner + icon)
      resolvedChildren = loading ? spinner : icon;
    } else if (loading && loadingText) {
      resolvedChildren = (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          {spinner}
          <span>{loadingText}</span>
        </Box>
      );
    } else {
      resolvedChildren = children;
    }

    const variant = props.variant || 'contained';
    const color = props.color || 'primary';

    const buttonElement = (
      <Button
        ref={ref}
        size={size}
        disabled={disabled || loading}
        startIcon={resolvedStartIcon}
        endIcon={resolvedEndIcon}
        sx={{
          flexShrink: 0,
          minWidth: showIconOnly ? 40 : undefined,
          px: showIconOnly ? 1 : undefined,
          '&.Mui-disabled': {
            cursor: 'not-allowed',
            ...(variant === 'contained' && {
              color: 'rgba(255, 255, 255, 0.92) !important',
              bgcolor:
                color === 'error'
                  ? 'rgba(239, 68, 68, 0.45) !important'
                  : 'rgba(19, 91, 236, 0.45) !important',
              boxShadow: 'none !important',
              border: 'none !important',
            }),
            ...(variant === 'outlined' && {
              color: (t) =>
                color === 'error'
                  ? 'rgba(239, 68, 68, 0.8) !important'
                  : (t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7) !important' : 'rgba(15, 23, 42, 0.65) !important'),
              borderColor: (t) => `${t.palette.divider} !important`,
              bgcolor: 'transparent !important',
            }),
            ...(variant === 'text' && {
              color: (t) =>
                t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.7) !important' : 'rgba(15, 23, 42, 0.65) !important',
            }),
          },
          ...sx,
        }}
        {...props}
      >
        {resolvedChildren}
      </Button>
    );

    // If tooltip is requested (or icon-only mode with text label):
    // Always wrap in a <span> to safely support disabled states without firing MUI Tooltip events warning
    const effectiveTooltip = tooltipTitle || (showIconOnly && typeof children === 'string' ? children : null);

    if (effectiveTooltip) {
      return (
        <Tooltip title={effectiveTooltip} arrow>
          <Box component="span" sx={{ display: 'inline-flex', flexShrink: 0 }}>
            {buttonElement}
          </Box>
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

MuiButton.displayName = 'MuiButton';
export default MuiButton;
