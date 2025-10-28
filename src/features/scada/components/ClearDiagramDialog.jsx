// ClearDiagramDialog.js
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const ClearDiagramDialog = ({
  isOpen,
  setIsDeleteConfirmOpen,
  onConfirm,
  hasModelId,
}) => {
  return (
    <Dialog open={isOpen} onClose={() => setIsDeleteConfirmOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium' }}>
        Clear Diagram
      </DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to clear the current diagram?</Typography>
        <Typography variant="caption" color="textSecondary">
          This will {hasModelId ? 'remove the saved diagram from the database and ' : ''}reset your canvas.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={() => setIsDeleteConfirmOpen(false)} variant="outlined">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          {hasModelId ? 'Delete and Clear' : 'Clear Canvas'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearDiagramDialog;