
import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Typography, Grow } from '@mui/material'; // Added Grow

export const DGTariffDialog = ({ open, onClose, dgTariff, onStateChange }) => {
  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        maxWidth="xs" 
        fullWidth 
        TransitionComponent={Grow} // Added Grow transition
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5,
            p: 1 // Added some padding
          }
        }}
    >
      <DialogTitle sx={{textAlign: 'center', fontWeight: 'medium'}}>DG Tariff Settings</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please enter the DG Tariff rate for calculating energy charges.
        </Typography>
        <TextField
          label="DG Tariff (Rs)"
          type="number"
          size="small"
          required
          fullWidth
          value={dgTariff}
          onChange={(e) => onStateChange({ dgTariff: Number(e.target.value) })}
        />
      </DialogContent>
      <DialogActions sx={{justifyContent: 'center', gap: 1, pb: 2}}>
        <Button onClick={onClose} variant="outlined" color="secondary" size="small">Cancel</Button>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary" 
          size="small"
          disabled={!dgTariff}
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
}; 
