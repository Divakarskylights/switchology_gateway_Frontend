import React from 'react';
import {
    Box, Button, Checkbox, ListItemText,
    MenuItem, TextField, Typography,
} from '@mui/material';

// Reusable Meter Select Component
export const MeterSelect = ({ value, options, onChange }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ minWidth: 100 }}>Meter Name:</Typography>
      <TextField
        select
        size="small"
        value={value || ''}
        onChange={onChange}
        sx={{ width: 200 }}
      >
        {/* <MenuItem value="">Select Meter</MenuItem> */}
        {options?.length ? options.map((item) => (
          <MenuItem key={item} value={item}>{item}</MenuItem>
        )) : <MenuItem value="" disabled>No meters available</MenuItem>}
      </TextField>
    </Box>
  );
  
  // Reusable Parameter Select Component
  export const ParameterSelect = ({ value, options, onChange, disabled, onView }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ minWidth: 100 }}>Parameters:</Typography>
      <TextField
        select
        SelectProps={{ multiple: true, renderValue: (selected) => selected.join(', ') }}
        size="small"
        value={value || []}
        onChange={onChange}
        disabled={disabled}
        sx={{ width: 200 }}
      >
        {options?.length ? options.map((name) => (
          <MenuItem key={name} value={name}>
            <Checkbox checked={value.includes(name)} />
            <ListItemText primary={name} />
          </MenuItem>
        )) : <MenuItem value="" disabled>No parameters available</MenuItem>}
      </TextField>
      <Button
        variant="contained"
        size="small"
        onClick={onView}
        disabled={!value.length}
      >
        View
      </Button>
    </Box>
  );
  
  // Reusable Interval Input Component
  export const IntervalInput = ({ duration, type, onChange }) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ minWidth: 100 }}>Data Interval:</Typography>
      <TextField
        type="number"
        size="small"
        value={duration}
        onChange={(e) => onChange('duration', e.target.value)}
        inputProps={{ min: 0 }}
        sx={{ width: 80 }}
      />
      <TextField
        select
        size="small"
        value={type}
        onChange={(e) => onChange('type', e.target.value)}
        sx={{ width: 60 }}
      >
        {['s', 'm', 'h'].map((unit) => (
          <MenuItem key={unit} value={unit}>{unit}</MenuItem>
        ))}
      </TextField>
    </Box>
  );
  

