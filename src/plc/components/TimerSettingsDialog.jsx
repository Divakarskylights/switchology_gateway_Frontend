import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Stack, Typography, TextField, Select, MenuItem, Button } from '@mui/material';

export default function TimerSettingsDialog({
  open,
  type,
  delay,
  operator,
  value,
  onClose,
  onSave,
  onChangeDelay,
  onChangeOperator,
  onChangeValue,
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 1.5 }}>
        {type} Settings
      </DialogTitle>
      <DialogContent sx={{ p: 2, bgcolor: '#f8f9fa' }}>
        {(type === 'TON' || type === 'TOF') && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary">Delay (ms)</Typography>
              <TextField
                size="small"
                type="number"
                fullWidth
                value={delay}
                onChange={onChangeDelay}
                inputProps={{ min: 0 }}
              />
            </Stack>
          </Box>
        )}
        {type === 'COMPARE' && (
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'white', border: '1px solid #e0e0e0' }}>
            <Stack spacing={2}>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">Operator</Typography>
                <Select size="small" value={operator} onChange={onChangeOperator} sx={{ minWidth: 120 }}>
                  <MenuItem value="==">==</MenuItem>
                  <MenuItem value=">">{'>'}</MenuItem>
                  <MenuItem value=">=">{'>='}</MenuItem>
                  <MenuItem value="<">{'<'}</MenuItem>
                  <MenuItem value="<=">{'<='}</MenuItem>
                  <MenuItem value="!=">!=</MenuItem>
                </Select>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="caption" color="text.secondary">Value</Typography>
                <TextField size="small" type="number" fullWidth value={value} onChange={onChangeValue} />
              </Stack>
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 1.5, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
        <Button variant="outlined" size="small" onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontWeight: 600,
            '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
