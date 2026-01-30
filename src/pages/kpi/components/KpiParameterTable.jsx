import React from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from "@mui/material";

const KpiParameterTable = ({
  fields,
  fromDate,
  toDate,
  textfieldStyle,
  handleFieldChange,
  fieldsDisabled,
}) => (
  <Box sx={{ position: "relative" }}>
    <TableContainer
      sx={{
        maxWidth: "100%",
        overflowX: "auto",
        opacity: fromDate && toDate ? 1 : 0.5,
      }}
    >
      <Table size="small" sx={{ minWidth: 400 }}>
        <TableHead>
          <TableRow sx={{ height: 26, "& th, & td": { py: 0.25 } }}>
            <TableCell align="center" sx={{ fontWeight: "bold", py: 0.25 }}>
              Parameters
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", py: 0.25 }}>
              Values
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", py: 0.25 }}>
              Unit
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {fields
            .filter(
              (field) => field.parameter !== "from_date" && field.parameter !== "to_date",
            )
            .map((field, idx) => (
              <TableRow key={field.parameter || idx}>
                <TableCell align="center">
                  <TextField
                    type="text"
                    value={field.parameter}
                    onChange={(e) =>
                      handleFieldChange(idx, "parameter", e.target.value)
                    }
                    size="small"
                    fullWidth
                    disabled
                    sx={{
                      ...textfieldStyle,
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                  />
                </TableCell>

                <TableCell align="center">
                  <TextField
                    type="text"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(",", ".");
                      if (/^\d*\.?\d*$/.test(rawValue)) {
                        handleFieldChange(idx, "value", rawValue);
                      }
                    }}
                    onKeyDown={(e) => {
                      const allowedKeys = [
                        "Backspace",
                        "Tab",
                        "ArrowLeft",
                        "ArrowRight",
                        "Delete",
                        ".",
                      ];
                      if (
                        (e.ctrlKey || e.metaKey) &&
                        ["a", "c", "v", "x"].includes(e.key.toLowerCase())
                      ) {
                        return;
                      }
                      if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
                        e.preventDefault();
                      }
                      if (e.key === "." && e.currentTarget.value.includes(".")) {
                        e.preventDefault();
                      }
                    }}
                    size="small"
                    disabled={!fromDate || !toDate || fieldsDisabled}
                    sx={textfieldStyle}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    type="text"
                    value={field.unit || ""}
                    size="small"
                    fullWidth
                    disabled
                    sx={{
                      ...textfieldStyle,
                      "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                      },
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </TableContainer>
    {(!fromDate || !toDate) && (
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "rgba(255,255,255,0.6)",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          pointerEvents: "all",
          borderRadius: 2,
        }}
      />
    )}
  </Box>
);

export default KpiParameterTable;
