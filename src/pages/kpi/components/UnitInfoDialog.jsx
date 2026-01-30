import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
} from "@mui/material";

const UnitInfoDialog = ({ open, onClose, unitInfo }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Unit of Measure (UoM) Information</DialogTitle>
    <DialogContent>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Unit</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Description / Usage Example</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Notes / Typical Industry Application</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {unitInfo.map((row) => (
            <TableRow key={row.unit} sx={{ "& td": { py: 0.25 } }}>
              <TableCell sx={{ fontSize: "0.85rem" }}>{row.unit}</TableCell>
              <TableCell sx={{ fontSize: "0.85rem" }}>{row.desc}</TableCell>
              <TableCell sx={{ fontSize: "0.85rem" }}>{row.notes}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Close</Button>
    </DialogActions>
  </Dialog>
);

export default UnitInfoDialog;
