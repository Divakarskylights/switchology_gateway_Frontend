import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

const ConfirmDeleteDialog = ({ open, onClose, onConfirm }) => {
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle textAlign={'center'}>Confirm Meter Deletion</DialogTitle>
        <DialogContent>
          <div>
            <span>
              Deleting this meter will delete all its data, including any setups in SCADA page and Bill Generation Page.
            </span>
            <br />
            <span style={{ fontWeight: 600 }}>
              Confirm to Delete this meter?
            </span>
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} sx={{mr: 1}} color="primary" variant="outlined" size="small">No</Button>
          <Button onClick={onConfirm} sx={{mr: 1}} color="error" variant="contained" size="small">Yes</Button>
        </DialogActions>
      </Dialog>
    );
  }

export default ConfirmDeleteDialog;