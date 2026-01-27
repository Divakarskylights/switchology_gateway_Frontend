import React from "react";
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";

const MeterReadings = ({data}) => {
  const formatNumber = (value) => {
    if (value === null || value === undefined) return '0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num)
      ? '0.00'
      : num.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
  };
  return (
    <>
      <Typography fontWeight="bold" fontSize="12px">
        Meter Readings:
      </Typography>
      <TableContainer sx={{ border: '1px solid #ccc', borderRadius: "5px"}}>
        <Table size="small"  aria-label="meter readings">
          <TableHead>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 }, backgroundColor: "gray.100" }}>
              <TableCell sx={{ fontSize: "13px", fontWeight: "bold" }}>
                <Typography fontSize="11px"  fontWeight="bold" textAlign="left">
                  Description
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: "13px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" textAlign="right">
                  EB Meter
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: "13px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" textAlign="right">
                  DG Meter
                </Typography>
              </TableCell>
              <TableCell sx={{ fontSize: "13px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" textAlign="right">
                  PF
                </Typography>
              </TableCell>
              {/* <TableCell sx={{ fontSize: "13px", fontWeight: "bold" }}>
                <Typography fontSize="10px"  fontWeight="bold" textAlign="right">
                  Net Consumption
                </Typography>
              </TableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }}  >
                <Typography fontSize="10px"  fontWeight="bold" >
                    Present Reading ({data.period ? new Date(data.period.split('-')[1]).toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric' }) : ''})
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }} align="right">
                <Typography fontSize="10px"  >  
                  {data.eb_present ? formatNumber(data.eb_present) : '0.00'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.dg_present ? formatNumber(data.dg_present) : '0.00'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }} align="right">
                <Typography fontSize="10px"  >
                  {data.md_present ? formatNumber(data.md_present) : '0.00'}
                </Typography>
              </TableCell>
              {/* <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.pf_present ? Number(data.pf_present).toFixed(2) : '0.00'}
                </Typography>
              </TableCell> */}
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Previous Reading ({data.period ? new Date(data.period.split('-')[0]).toLocaleDateString('en-IN', {day: '2-digit', month: '2-digit', year: 'numeric' }) : ''})
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                  {data.eb_previous ? formatNumber(data.eb_previous) : '0.00'}
                </Typography> 
              </TableCell>
              <TableCell sx={{ fontsize: "10px",  }} align="right">
                <Typography fontSize="10px"  >
                  {data.md_previous ? formatNumber(data.md_previous) : '0.00'}
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.pf_previous ? formatNumber(data.pf_previous) : '0.00'}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Difference
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                  {data.eb_present && data.eb_previous ? formatNumber(data.eb_present - data.eb_previous) : 0}
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                  {data.dg_present && data.dg_previous ? formatNumber(data.dg_present - data.dg_previous) : 0}
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                  {data.md_present && data.md_previous ? formatNumber(data.md_present - data.md_previous) : 0}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Meter Constant
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                    1
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                    1
                </Typography>
              </TableCell>
              <TableCell  align="right">
                <Typography fontSize="10px"  >
                    1
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{  backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Consumption
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontSize="10px"  >
                  {data.eb_present && data.eb_previous ? formatNumber(data.eb_present - data.eb_previous) : 0}
                </Typography>
              </TableCell>
              <TableCell sx={{  backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.dg_present && data.dg_previous ? formatNumber(data.dg_present - data.dg_previous) : 0}
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontSize="10px"  >
                  {data.md_present && data.md_previous ? formatNumber(data.md_present - data.md_previous) : 0}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{  backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Less/Adjt Consumption
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontSize="10px"  >
                  {data.rowAdjNetConsumptionkwh ? formatNumber(data.rowAdjNetConsumptionkwh) : 0}
                </Typography>
              </TableCell>
              <TableCell sx={{  backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {0}
                </Typography>
              </TableCell>
              <TableCell sx={{  backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >  
                  {0}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{  backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px"  fontWeight="bold" >  
                    Net Consumption
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography fontSize="10px"  >
                  {data.rowAdjNetConsumption ? formatNumber(data.rowAdjNetConsumption) : 0}
                </Typography>
              </TableCell>
              <TableCell sx={{  backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.dg_netConsumption ? formatNumber(data.dg_netConsumption) : 0}
                </Typography>
              </TableCell>
              <TableCell sx={{  backgroundColor: '#f9fafb' }} align="right">
                <Typography fontSize="10px"  >
                  {data.pf_netConsumption ? formatNumber(data.pf_netConsumption) : 0}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default MeterReadings;

