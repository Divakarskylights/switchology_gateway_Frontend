import React from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { Box, Grid } from "@mui/material"; 
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"; 

import { useDateRange } from "../../redux/store/useDateRange";

const DateRange = () => {
  const { dateRange, setDateRange } = useDateRange();

  const handleStartDateChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      const newStartDate = dayjs(newValue).startOf('day').toDate();
      const currentEndDate = dayjs(dateRange.endDate).endOf('day').toDate();
      const finalEndDate = newStartDate > currentEndDate ? newStartDate : currentEndDate;
      
      setDateRange({
        startDate: newStartDate,
        endDate: finalEndDate,
        label: 'Custom Range', 
      });
    }
  };

  const handleEndDateChange = (newValue) => {
    if (newValue && dayjs(newValue).isValid()) {
      const newEndDate = dayjs(newValue).endOf('day').toDate();
      const currentStartDate = dayjs(dateRange.startDate).startOf('day').toDate();
      const finalStartDate = newEndDate < currentStartDate ? newEndDate : currentStartDate;

      setDateRange({
        startDate: finalStartDate,
        endDate: newEndDate,
        label: 'Custom Range',
      });
    }
  };
  
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Grid container spacing={1} alignItems="center" sx={{width: "100%"}}>
        <Grid item xs={12} sm={6}>
            <MobileDatePicker
                label="Start Date"
                value={dayjs(dateRange.startDate)}
                onChange={handleStartDateChange}
                slotProps={{
                    textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                            style: { height: '35px', fontSize: '0.8rem', paddingLeft: '8px', paddingRight:'8px' },
                            startAdornment: (
                                <AccessTimeIcon sx={{ fontSize: "18px", color: 'action.active', mr:0.5 }} />
                            )
                        }
                    }
                }}
            />
        </Grid>
        <Grid item xs={12} sm={6}>
             <MobileDatePicker
                label="End Date"
                value={dayjs(dateRange.endDate)}
                onChange={handleEndDateChange}
                minDate={dayjs(dateRange.startDate)} 
                slotProps={{
                    textField: {
                        size: 'small',
                        fullWidth: true,
                        InputProps: {
                            style: { height: '35px', fontSize: '0.8rem', paddingLeft: '8px', paddingRight:'8px' },
                            startAdornment: (
                                <AccessTimeIcon sx={{ fontSize: "18px", color: 'action.active', mr:0.5 }} />
                            )
                        }
                    }
                }}
            />
        </Grid>
      </Grid>
    </LocalizationProvider>
  );
};

export default DateRange;
