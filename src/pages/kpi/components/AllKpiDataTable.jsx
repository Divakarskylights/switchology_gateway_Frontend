import React from "react";
import {
  Paper,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const AllKpiDataTable = ({
  mergedKpiData,
  formatDateTime,
  menuAnchorEl,
  menuRowIdx,
  handleMenuOpen,
  handleMenuClose,
  handleView,
  handleDelete,
}) => (
  <Paper elevation={1}>
    <Typography variant="h6" sx={{ fontSize: "1.05rem", ml: 1, pt: 1 }}>
      All KPI Data
    </Typography>
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              Sl. No
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
              Parameter
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              Value
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              Unit
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              Created Date (From - To)
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
              Updated Date
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {mergedKpiData.length > 0 ? (
            mergedKpiData.map((row, idx) => (
              <TableRow key={`${row.combineId}-${idx}`} sx={{ height: 0 }}>
                <TableCell sx={{ py: 0.1, whiteSpace: "nowrap", fontSize: "10px" }}>
                  {idx + 1}
                </TableCell>
                <TableCell sx={{ py: 0.1, width: "30%", fontSize: "10px" }}>
                  {row.parameters || "-"}
                </TableCell>
                <TableCell sx={{ py: 0.1, whiteSpace: "nowrap", fontSize: "10px" }}>
                  {row.values || "-"}
                </TableCell>
                <TableCell sx={{ py: 0.1, whiteSpace: "nowrap", fontSize: "10px" }}>
                  {row.units || "-"}
                </TableCell>
                <TableCell sx={{ py: 0.1, whiteSpace: "nowrap", fontSize: "10px" }}>
                  {`${formatDateTime(row.createdFromDateTime)} - ${formatDateTime(row.createdToDateTime)}`}
                </TableCell>
                <TableCell sx={{ py: 0.1, whiteSpace: "nowrap", fontSize: "10px" }}>
                  {row.updatedDate ? new Date(row.updatedDate).toLocaleString() : "-"}
                </TableCell>
                <TableCell align="right" sx={{ py: 0.5 }}>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, idx)}
                    aria-label="more options"
                    size="small"
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchorEl}
                    open={menuRowIdx === idx}
                    onClose={handleMenuClose}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                  >
                    <MenuItem onClick={handleView}>View</MenuItem>
                    <MenuItem onClick={() => handleDelete(row)}>Delete</MenuItem>
                  </Menu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} align="center">
                No KPI data available.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  </Paper>
);

export default AllKpiDataTable;
