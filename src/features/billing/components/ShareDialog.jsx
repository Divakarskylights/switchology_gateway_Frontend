
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Grow // Added Grow
} from '@mui/material';

export const ShareDialog = ({ 
  open, 
  onClose, 
  onConfirm 
}) => {
  return (
    <Dialog 
        open={open} 
        onClose={onClose} 
        TransitionComponent={Grow} // Added Grow transition
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5,
            p:1 // Added some padding
          }
        }}
    >
      <DialogTitle sx={{textAlign: 'center', fontWeight: 'medium'}}>Confirm Meter Sharing</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This action will remove the selected meter and redistribute its consumption to other meters. 
          You can reapply the data if needed.
        </DialogContentText>
        <DialogContentText sx={{ mt: 2, fontWeight: 'bold', textAlign: 'center' }}>
          Are you sure you want to proceed?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{justifyContent: 'center', gap: 1, pb: 2}}>
        <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
        <Button 
          onClick={onConfirm} 
          color="primary"
          variant="contained"
        >
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};
