import React, { useEffect, useState, useReducer, memo } from "react";
import {
  TextField, Checkbox, FormControlLabel, Button, Typography, Table, TableContainer,
  TableHead, TableRow, TableCell, TableBody, IconButton, Dialog, Box, MenuItem
} from "@mui/material";

// Reusable BESCOM Dialog Component
export const MeterBescomDialog = memo(({ open, onClose, onSubmit, initialData }) => {
    const [data, setData] = useReducer(
      (state, updates) => ({ ...state, ...updates }),
      { bescom_bill: "", eb_previous: "", eb_present: "", dg_previous: "", dg_present: "", ...initialData }
    );
  
    const handleChange = (field) => (e) => setData({ [field]: e.target.value ? parseFloat(e.target.value) : "" });
    const isValid = Object.values(data).every((val) => !isNaN(val) && val !== "");
  
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="h6" sx={{ textAlign: "center" }}>BESCOM Bill</Typography>
          {["bescom_bill", "eb_previous", "eb_present", "dg_previous", "dg_present"].map((field) => (
            <TextField
              key={field} fullWidth type="number" placeholder={`Enter ${field.replace("_", " ")}`}
              value={data[field]} onChange={handleChange(field)} sx={{ "& .MuiOutlinedInput-root": { height: "40px" } }}
            />
          ))}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button onClick={() => onSubmit(data)} disabled={!isValid} variant="contained" color="info">Submit</Button>
            <Button onClick={onClose} variant="contained" color="secondary">Cancel</Button>
          </Box>
        </Box>
      </Dialog>
    );
  });
