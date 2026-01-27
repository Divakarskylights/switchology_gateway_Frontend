import React from 'react';
import { TextField, Checkbox, FormControlLabel, Button, Typography, Box, MenuItem, IconButton } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const MetersBillFormContent = ({ form, handleChange, isValid, onClose, onSubmit, initialData, meters, tariffData, onOpenTariffSettings }) => {
    console.log("tariffData=>",tariffData);
    
    return (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold" }}>
                Generate Report for the Meters
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TextField
                    select
                    value={form.tariff}
                    label="Tariff"
                    onChange={handleChange("tariff")}
                    size="small"
                    fullWidth
                    required
                >
                    {tariffData.length === 0 ? (
                        <MenuItem disabled>No tariffs available</MenuItem>
                    ) : (
                        tariffData.map((tariff) => (
                            <MenuItem key={tariff.id} value={tariff.tariffName}>
                                {tariff.tariffName}
                            </MenuItem>
                        ))
                    )}
                </TextField>
                <IconButton 
                    color="primary" 
                    onClick={onOpenTariffSettings}
                    size="small"
                    title="Add New Tariff"
                >
                    <AddCircleOutlineIcon />
                </IconButton>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 2 }}>
                <TextField
                    select={!initialData}
                    disabled={!!initialData}
                    value={form.firstMeter}
                    label="Meter Name"
                    onChange={handleChange("firstMeter")}
                    size="small"
                >
                    {meters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)}
                </TextField>
                <TextField value="WH Received" label="Parameter" disabled size="small" />
            </Box>
        
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
                <Button size="small" onClick={onClose} variant="contained" color="error">
                    Cancel
                </Button>
                <Button
                    size="small"
                    onClick={() => onSubmit(form)}
                    disabled={!isValid}
                    variant="contained"
                    color="primary"
                >
                    Submit
                </Button>
            </Box>
        </Box>
    );
};

export default MetersBillFormContent; 
