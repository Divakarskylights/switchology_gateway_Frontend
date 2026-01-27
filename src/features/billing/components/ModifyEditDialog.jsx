
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, DialogContentText, Box, Grow } from "@mui/material"; // Added Grow
import { useState } from "react";

export const ModifyEditDialog = ({ open, onClose, state, handleStateChange, setTableData }) => {
    const [adjNetConsumption, setAdjNetConsumption] = useState(state.adjustmentNetConsumption);
    const handleConfirm = () => {
        handleStateChange({ adjustmentNetConsumption: adjNetConsumption });
        handleStateChange({ openModifyAdjNetConsumption: false });
        setTableData(prevData => prevData.map(row => {
            const gettotalNetconsumption = () => prevData.reduce((sum, row) => sum + row.netConsumption || 0, 0);
            const percentageShare = (row) => (row.netConsumption / gettotalNetconsumption()) * 100 || 0;
            // console.log("percentageShare(row)dcdd", Number(adjNetConsumption) * percentageShare(row) / 100);
            return {
                ...row,
                canShared: false,
                adjustmentNetConsumption: Number(adjNetConsumption),
            };
        }));
    };

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
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium' }}>Net Consumption Value kWh</DialogTitle>
            <DialogContent sx={{ textAlign: 'center' }}>
                <DialogContentText sx={{ color: 'warning.main', fontSize: '14px', mb: 2, textAlign: 'left' }}>
                Note: Enter New Net Consumption, difference with actual meter readings will be shown in Difference kWh Column.
                Bill will be generated based on this new Net Consumption value. Ensure Shared meters are already selected if any.
                </DialogContentText>
                  <TextField
                    label="Adjusted Net Consumption in kWh"
                    size="small"
                    value={adjNetConsumption}
                    onChange={(e) => setAdjNetConsumption(e.target.value)}
                    fullWidth
                    type="number"
                  />
            </DialogContent>
            <DialogActions sx={{justifyContent: 'center', gap: 1, pb: 2}}>
                <Button variant="outlined" color="secondary" size="small" onClick={onClose}>Cancel</Button>
                <Button variant="contained" color="primary" size="small" onClick={handleConfirm}>Confirm</Button>
            </DialogActions>
        </Dialog>
    );
};
