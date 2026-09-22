/**
 * @module components/reusable/MuiTextField
 * @description Standardized TextField wrapper with start/end adornments, password toggle, and error helper text using MUI v6 slotProps.
 */
import { useState, forwardRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Clear from '@mui/icons-material/Clear';

/**
 * Standardized custom TextField component conforming to Section 10.8 reusable input law.
 * Enforces size="small", contextual adornments, password visibility toggles, and inline error text
 * using MUI v6 slotProps architecture.
 *
 * @component MuiTextField
 * @param {object} props - Component properties.
 * @param {React.ReactNode} [props.startIcon] - Optional icon element to render at input start.
 * @param {React.ReactNode} [props.endIcon] - Optional custom end adornment icon element.
 * @param {boolean} [props.isPassword=false] - Whether this input behaves as a password field with toggle.
 * @param {Function} [props.onClear] - Optional clear button click callback.
 * @param {string} [props.type='text'] - HTML input type.
 * @param {boolean} [props.error=false] - Error state flag.
 * @param {string} [props.helperText] - Supporting or validation error message text.
 * @param {string} [props.size='small'] - Input size (defaults to 'small').
 * @param {boolean} [props.fullWidth=true] - Whether input spans full container width.
 * @param {object} [props.slotProps] - MUI v6 slotProps configuration object.
 * @param {import('react').Ref<HTMLInputElement>} ref - Forwarded DOM element ref.
 * @returns {JSX.Element} Rendered MUI TextField component.
 */
export const MuiTextField = forwardRef(
  (
    {
      startIcon,
      endIcon,
      isPassword = false,
      onClear,
      type = 'text',
      error = false,
      helperText,
      size = 'small',
      fullWidth = true,
      slotProps = {},
      ...rest
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
      setShowPassword((prev) => !prev);
    };

    const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;

    // Build Start Adornment if startIcon is provided
    const existingStartAdornment = slotProps.input?.startAdornment;
    const resolvedStartAdornment = startIcon ? (
      <InputAdornment position="start">
        {startIcon}
      </InputAdornment>
    ) : (
      existingStartAdornment
    );

    // Build End Adornment (password toggle > custom clear > endIcon > existing endAdornment)
    const existingEndAdornment = slotProps.input?.endAdornment;
    let resolvedEndAdornment = existingEndAdornment;
    if (isPassword) {
      resolvedEndAdornment = (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={handleTogglePassword}
            edge="end"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
          </IconButton>
        </InputAdornment>
      );
    } else if (onClear && rest.value) {
      resolvedEndAdornment = (
        <InputAdornment position="end">
          <IconButton
            size="small"
            onClick={onClear}
            edge="end"
            aria-label="Clear input"
          >
            <Clear fontSize="small" />
          </IconButton>
        </InputAdornment>
      );
    } else if (endIcon) {
      resolvedEndAdornment = (
        <InputAdornment position="end">
          {endIcon}
        </InputAdornment>
      );
    }

    return (
      <TextField
        ref={ref}
        type={resolvedType}
        error={error}
        helperText={helperText}
        size={size}
        fullWidth={fullWidth}
        variant="outlined"
        slotProps={{
          ...slotProps,
          input: {
            ...slotProps.input,
            startAdornment: resolvedStartAdornment,
            endAdornment: resolvedEndAdornment,
          },
          formHelperText: {
            ...slotProps.formHelperText,
            sx: error
              ? { color: 'error.main', ...slotProps.formHelperText?.sx }
              : slotProps.formHelperText?.sx,
          },
        }}
        {...rest}
      />
    );
  }
);

MuiTextField.displayName = 'MuiTextField';

export default MuiTextField;
