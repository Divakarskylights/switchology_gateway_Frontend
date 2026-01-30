import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Select,
  MenuItem,
  Button,
  IconButton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";

const AddParameterDialog = ({
  open,
  onClose,
  dialogParameters,
  textfieldStyle,
  onParameterNameChange,
  onUnitChange,
  onRemoveParameter,
  onAddParameter,
  unitOptions,
  isSubmitDisabled,
  onSubmit,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle align="center">Add KPI Parameters</DialogTitle>
    <DialogContent>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Parameter Name</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {dialogParameters.map((param, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <TextField
                  value={param.parameter}
                  onChange={(e) => onParameterNameChange(idx, e.target.value)}
                  size="small"
                  sx={{ ...textfieldStyle, minWidth: 300 }}
                />
              </TableCell>
              <TableCell>
                <Select
                  value={param.unit}
                  onChange={(e) => onUnitChange(idx, e.target.value)}
                  size="small"
                  displayEmpty
                  fullWidth
                  sx={{ ...textfieldStyle, minWidth: 100 }}
                >
                  <MenuItem value="">
                    <em>Select Unit</em>
                  </MenuItem>
                  {unitOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => onRemoveParameter(idx)}
                  disabled={dialogParameters.length === 1}
                  color="error"
                >
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {dialogParameters.length < 10 && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddParameter}
          size="small"
          sx={{ alignSelf: "flex-start", mt: 2 }}
        >
          Add Parameter
        </Button>
      )}
    </DialogContent>
    <DialogActions sx={{ justifyContent: "center" }}>
      <Button onClick={onClose} variant="contained" size="small" color="info">
        Cancel
      </Button>
      <Button
        onClick={onSubmit}
        variant="contained"
        size="small"
        disabled={isSubmitDisabled}
      >
        Submit
      </Button>
    </DialogActions>
  </Dialog>
);

export default AddParameterDialog;
