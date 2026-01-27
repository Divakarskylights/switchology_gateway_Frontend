import React from 'react';
import { Box, TextField, Typography, MenuItem } from '@mui/material';

const ConfigItem = ({ label, value, onChange, select, options = [], disabled, name, required }) => {
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (onChange) onChange(name, newValue);
  };

  // Ensure value is valid for select; fallback to '' if not in options
  const safeValue = select && options.length && !options.some(opt => opt.value === value) ? '' : value || '';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', px: 1, py: 0.5 }}>
      <Typography variant="body1">{label}</Typography>
      <TextField
        select={select}
        fullWidth
        required={required}
        disabled={disabled}
        value={safeValue}
        onChange={handleInputChange}
        size="small"
        sx={{ mt: 0.5 }}
      >
        {select && options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
};

export default ConfigItem;