import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Button } from '@mui/material';

const RelayConfigWarningDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Warning - Relay Configuration</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          You are about to modify relay configurations.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Changing relay modes and schedules can affect system operation. Please ensure:
        </Typography>
        <Box component="ul" sx={{ mt: 1, mb: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            • You understand the impact of relay configuration changes
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            • Changes will be saved only after clicking "Save Configuration"
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
            • OUTPUT relays can control physical devices when configured
          </Typography>
        </Box>
        <Typography variant="body2" color="warning.main" fontWeight="medium">
          Do you want to proceed with relay configuration?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary">
          I Understand, Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RelayConfigWarningDialog;
