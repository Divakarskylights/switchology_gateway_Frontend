// import React from "react";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";
// import { Box, Grid } from "@mui/material"; // Removed TextField, Typography, IconButton as they are part of MobileDatePicker's rendering
// import dayjs from "dayjs";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import { MobileDatePicker } from "@mui/x-date-pickers/MobileDatePicker"; 

// import { useDateRange } from "./useRangeDate.js";

// const DateRange = () => {
//   const { dateRange, setDateRange } = useDateRange();

//   const handleStartDateChange = (newValue) => {
//     if (newValue && dayjs(newValue).isValid()) {
//       const newStartDate = dayjs(newValue).startOf('day').toDate();
//       // Ensure endDate is not before newStartDate
//       const currentEndDate = dayjs(dateRange.endDate).endOf('day').toDate();
//       const finalEndDate = newStartDate > currentEndDate ? newStartDate : currentEndDate;
      
//       setDateRange({
//         startDate: newStartDate,
//         endDate: finalEndDate,
//         label: 'Custom Range', // Dates changed manually
//       });
//     }
//   };

//   const handleEndDateChange = (newValue) => {
//     if (newValue && dayjs(newValue).isValid()) {
//       const newEndDate = dayjs(newValue).endOf('day').toDate();
//       // Ensure startDate is not after newEndDate
//       const currentStartDate = dayjs(dateRange.startDate).startOf('day').toDate();
//       const finalStartDate = newEndDate < currentStartDate ? newEndDate : currentStartDate;

//       setDateRange({
//         startDate: finalStartDate,
//         endDate: newEndDate,
//         label: 'Custom Range', // Dates changed manually
//       });
//     }
//   };
  
//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Grid container spacing={1} alignItems="center" sx={{width: "100%"}}>
//         <Grid item xs={12} sm={6}>
//             <MobileDatePicker
//                 label="Start Date"
//                 value={dayjs(dateRange.startDate)}
//                 onChange={handleStartDateChange}
//                 slotProps={{
//                     textField: {
//                         size: 'small',
//                         fullWidth: true,
//                         InputProps: {
//                             style: { height: '35px', fontSize: '0.8rem', paddingLeft: '8px', paddingRight:'8px' },
//                             startAdornment: (
//                                 <AccessTimeIcon sx={{ fontSize: "18px", color: 'action.active', mr:0.5 }} />
//                             )
//                         }
//                     }
//                 }}
//             />
//         </Grid>
//         <Grid item xs={12} sm={6}>
//              <MobileDatePicker
//                 label="End Date"
//                 value={dayjs(dateRange.endDate)}
//                 onChange={handleEndDateChange}
//                 minDate={dayjs(dateRange.startDate)} // Prevent end date from being before start date
//                 slotProps={{
//                     textField: {
//                         size: 'small',
//                         fullWidth: true,
//                         InputProps: {
//                             style: { height: '35px', fontSize: '0.8rem', paddingLeft: '8px', paddingRight:'8px' },
//                             startAdornment: (
//                                 <AccessTimeIcon sx={{ fontSize: "18px", color: 'action.active', mr:0.5 }} />
//                             )
//                         }
//                     }
//                 }}
//             />
//         </Grid>
//         {/* Optional: Display for the label, could be useful for debugging or if shortcuts were implemented elsewhere */}
//         {/* <Grid item xs={12}>
//             <Typography variant="caption">Selected Range Type: {dateRange.label}</Typography>
//         </Grid> */}
//       </Grid>
//     </LocalizationProvider>
//   );
// };

// export default DateRange;
