
import React from 'react';
import { TextField, Typography, MenuItem } from '@mui/material';

const ConfigItem = ({ label, value, onChange, select, options = [], disabled, name, required, type = 'text' }) => {
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (onChange) onChange(name, newValue);
  };

  const safeValue = select && options.length && !options.some(opt => opt.value === value) ? '' : (value === null || value === undefined ? '' : value);

  return (
    <>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>{label}</Typography>
      <TextField
        select={select}
        fullWidth
        required={required}
        disabled={disabled}
        value={safeValue}
        onChange={handleInputChange}
        size="small"
        type={type}
        inputProps={type === 'number' ? { min: 1, step: 1 } : {}}
      >
        {select && options.map(option => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
};

export default ConfigItem;