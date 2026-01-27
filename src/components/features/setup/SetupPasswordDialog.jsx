import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, TextField, Typography } from '@mui/material';

const SetupPasswordDialog = ({ open, onClose, onConfirm, dialogType }) => {
  const [password, setPassword] = useState('');

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  const handleConfirm = () => {
    onConfirm(password);
    setPassword('');
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogContent>
        <Typography variant="h6">Enter password to {dialogType === 'delete' ? 'delete Meter' : 'add new Meter'}</Typography>
        <TextField
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          size="small"
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{ mr: 2, mt: 0 }} >
        <Button variant="contained" size="small" onClick={handleClose} sx={{ width: 60 }}>Cancel</Button>
        <Button variant="contained" size="small" onClick={handleConfirm} sx={{ width: 60 }}>Proceed</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SetupPasswordDialog;