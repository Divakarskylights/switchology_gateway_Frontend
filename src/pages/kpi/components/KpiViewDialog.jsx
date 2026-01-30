import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Button,
} from "@mui/material";

const KpiViewDialog = ({ open, onClose, rowData }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>KPI Row Details</DialogTitle>
    <DialogContent>
      {rowData && (
        <Table size="small">
          <TableBody>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Parameter
              </TableCell>
              <TableCell>{rowData.parameters || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Value
              </TableCell>
              <TableCell>{rowData.values || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Unit
              </TableCell>
              <TableCell>{rowData.units || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Created Date
              </TableCell>
              <TableCell>{rowData.createdDateDisplay || "-"}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                Updated Date
              </TableCell>
              <TableCell>
                {rowData.updatedDate
                  ? new Date(rowData.updatedDate).toLocaleString()
                  : "-"}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="contained" size="small">
        Close
      </Button>
    </DialogActions>
  </Dialog>
);

export default KpiViewDialog;
