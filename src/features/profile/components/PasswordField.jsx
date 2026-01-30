import React, { useState } from "react";
import {
  TextField,
  InputAdornment,
  IconButton,
  FormHelperText,
  Box
} from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const PasswordField = ({
  label,
  name,
  value = "",
  onChange,
  error,
  helperText,
  required,
  disabled = false,
  fullWidth = true,
}) => {
  const [show, setShow] = useState(false);

  const handleToggle = () => setShow((prev) => !prev);

  const handleMouseDown = (event) => {
    event.preventDefault();
  };

  return (
    <Box sx={{ width: "100%" }}>
      <TextField
        fullWidth={fullWidth}
        size="small"
        type={show ? "text" : "password"}
        label={label}
        name={name}
        value={value}
        onChange={onChange}
        error={Boolean(error)}
        helperText={helperText}
        required={required}
        disabled={disabled}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleToggle}
                onMouseDown={handleMouseDown}
                edge="end"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {typeof error === "string" && (
        <FormHelperText error sx={{ ml: 1 }}>
          {error}
        </FormHelperText>
      )}
    </Box>
  );
};

export default PasswordField;
