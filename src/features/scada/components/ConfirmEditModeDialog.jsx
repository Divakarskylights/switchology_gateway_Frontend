// ConfirmEditModeDialog.js
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grow from '@mui/material/Grow';

const ConfirmEditModeDialog = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      aria-labelledby="confirm-edit-mode-dialog-title"
      TransitionComponent={Grow}
      PaperProps={{ sx: { borderRadius: 2, boxShadow: 5 } }}
    >
      <DialogTitle id="confirm-edit-mode-dialog-title" sx={{ textAlign: 'center', fontWeight: 'medium' }}>
        Enter Edit Mode?
      </DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ textAlign: 'center' }}>
          Entering edit mode will allow you to make changes to the diagram. Ensure you save your work.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary" size="small">
          Cancel
        </Button>
        <Button
          onClick={(e) => {
            e.stopPropagation(); // prevent event bubbling to Dialog
            onConfirm();
          }}
          variant="contained"
          color="primary"
          size="small"
          autoFocus>
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmEditModeDialog;