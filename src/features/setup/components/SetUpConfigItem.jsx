
import React from 'react';
import { Box, TextField, Typography, MenuItem, ListSubheader } from '@mui/material';

const ConfigItem = ({
  label,
  labelAction,
  value,
  onChange,
  select,
  options = [],
  disabled,
  name,
  required,
  type = 'text',
}) => {
  const normalizedOptions = Array.isArray(options) ? options : [];
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    if (onChange) onChange(name, newValue);
  };

  const safeValue =
    select && normalizedOptions.length && !normalizedOptions.some((opt) => opt.value === value)
      ? ''
      : value === null || value === undefined
        ? ''
        : value;

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {label}
        </Typography>
        {labelAction || null}
      </Box>
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
        {select && normalizedOptions.map((option, index) => {
          if (option.type === 'subheader') {
            return (
              <ListSubheader key={`subheader-${index}`} sx={{ fontWeight: 700, fontSize: 12 }}>
                {option.label}
              </ListSubheader>
            );
          }
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          );
        })}
      </TextField>
    </>
  );
};

export default ConfigItem;