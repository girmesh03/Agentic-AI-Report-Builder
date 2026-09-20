/**
 * @module components/reusable/MuiButton
 * @description Standardized button wrapper with loading state, forwardRef, and responsive iconification.
 */
import { forwardRef } from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

/**
 * Standardized forwardRef button wrapper adhering to the project UI design standards.
 * Features built-in loading spinner, small sizing default, and mobile `xs` responsive iconification.
 *
 * @component
 * @param {object} props - Button props.
 * @param {React.ReactNode} props.children - Button label or contents.
 * @param {boolean} [props.loading=false] - Whether to show circular progress indicator.
 * @param {boolean} [props.disabled=false] - Whether button is disabled.
 * @param {React.ReactNode} [props.startIcon] - Leading icon element.
 * @param {React.ReactNode} [props.endIcon] - Trailing icon element.
 * @param {boolean} [props.responsiveIconOnly=false] - Whether to collapse to icon-only on xs viewport.
 * @param {string} [props.tooltipTitle] - Accessible tooltip label when iconified.
 * @param {'small' | 'medium' | 'large'} [props.size='small'] - Component size (defaults to 'small').
 * @param {object} [props.sx={}] - Emotion sx styling overrides.
 * @param {React.Ref<HTMLButtonElement>} ref - Forwarded DOM element reference.
 * @returns {JSX.Element} Rendered MUI button with responsive protections.
 */
export const MuiButton = forwardRef(
  (
    {
      children,
      loading = false,
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

    const buttonElement = (
      <Button
        ref={ref}
        size={size}
        disabled={disabled || loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : !showIconOnly ? startIcon : null}
        endIcon={!showIconOnly ? endIcon : null}
        sx={{
          flexShrink: 0,
          minWidth: showIconOnly ? 40 : undefined,
          px: showIconOnly ? 1 : undefined,
          ...sx,
        }}
        {...props}
      >
        {showIconOnly ? icon : children}
      </Button>
    );

    if (showIconOnly && (tooltipTitle || typeof children === 'string')) {
      return (
        <Tooltip title={tooltipTitle || children} arrow>
          <span>{buttonElement}</span>
        </Tooltip>
      );
    }

    return buttonElement;
  }
);

MuiButton.displayName = 'MuiButton';
export default MuiButton;
