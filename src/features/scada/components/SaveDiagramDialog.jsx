// SaveDiagramDialog.js
import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

const SaveDiagramDialog = ({
  isOpen,
  setIsSaveDiagramDialogOpen,
  onConfirm,
  diagramNameInput,
  setDiagramNameInput,
  diagramDescriptionInput,
  setDiagramDescriptionInput,
}) => {

  return (
    <Dialog open={isOpen} onClose={() => setIsSaveDiagramDialogOpen(false)} fullWidth maxWidth="xs">
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium' }}>
        Save SCADA Diagram
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Diagram Name"
          type="text"
          fullWidth
          variant="outlined"
          size="small"
          disabled={true}
          value={diagramNameInput}
          sx={{ mb: 2 }}
          onChange={(e) => setDiagramNameInput(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={3}
          variant="outlined"
          size="small"
          value={diagramDescriptionInput}
          onChange={(e) => setDiagramDescriptionInput(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={() => setIsSaveDiagramDialogOpen(false)} variant="outlined" size="small">
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" size="small">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveDiagramDialog;