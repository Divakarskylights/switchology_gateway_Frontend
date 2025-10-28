import React from "react";
import { Stack } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";

export const DateRangePicker = ({ 
  fromDate, 
  toDate, 
  onFromDateChange, 
  onToDateChange, 
  isSmallScreen, 
  disabled 
}) => {
  const textFieldStyles = {
    "& .MuiInputBase-root": {
      height: 40,
      fontSize: "0.8rem",
    },

  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Stack
        direction={isSmallScreen ? "column" : "row"}
        spacing={1}
        sx={{ width: isSmallScreen ? "100%" : "auto" }}
      >
        <DatePicker
          label="From Date"
          value={fromDate}
          onChange={onFromDateChange}
          sx={{ width: isSmallScreen ? "100%" : "auto" }}
          disabled={disabled}
          slotProps={{
            textField: {
              size: "small",
              sx: textFieldStyles,
            },
          }}
        />
        <DatePicker
          label="To Date"
          value={toDate}
          onChange={onToDateChange}
          sx={{ width: isSmallScreen ? "100%" : "auto" }}
          disabled={disabled}
          slotProps={{
            textField: {
              size: "small",
              sx: textFieldStyles,
            },
          }}
        />
      </Stack>
    </LocalizationProvider>
  );
};
