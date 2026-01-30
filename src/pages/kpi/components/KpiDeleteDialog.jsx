import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";

const KpiDeleteDialog = ({ open, onCancel, onConfirm }) => (
  <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
    <DialogTitle>Delete Confirmation</DialogTitle>
    <DialogContent>
      <Typography>Are you sure you want to delete?</Typography>
    </DialogContent>
    <DialogActions>
      <Button onClick={onCancel} variant="contained" size="small" color="info">
        Cancel
      </Button>
      <Button onClick={onConfirm} variant="contained" color="error" size="small">
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

export default KpiDeleteDialog;
