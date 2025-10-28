import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
} from "@mui/material";

const BillingDetails = ({ data }) => {
  return (
    <Box>
      <Typography fontSize="12px" fontWeight="bold" >
        Billing Details
      </Typography>

      {/* First Table */}
      <TableContainer sx={{ mb: 0.4, border: '1px solid #ccc', borderRadius: "5px" }}>
        <Table size="small">
          <TableBody>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb', py: 0.5, width: "20%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  RR No.
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0, width: "14%" }}>
                <Typography fontSize="10px"  >
                {data.tenantMeterId}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', py: 0.5, width: "13%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Account ID
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0, width: "10%" }}>
                <Typography fontSize="10px"  >
                  {data.tenantMeterId}
                </Typography>
              </TableCell>
    
                 <TableCell sx={{ backgroundColor: '#f9fafb', py: 0.5, width: "13%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Bill Date
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0.5, width: "10%" }} >
                <Typography fontSize="10px"  >
                  {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb', py: 0.5, width: "10%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Billing Period
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0.5, width: "14%" }} >
                <Typography fontSize="10px" fontWeight="bold" >
                  {data.period ? new Date(data.period.split('-')[0]).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''} - {data.period ? new Date(data.period.split('-')[1]).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                </Typography>
              </TableCell>
           
              <TableCell sx={{ backgroundColor: '#f9fafb', py: 0.5, width: "13%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Due Date
                </Typography>
              </TableCell>
              <TableCell sx={{ py: 0.5, width: "10%" }} >
                <Typography fontSize="10px">
                  {(() => {
                    if (!data.period) return '';
                    const baseDate = new Date(data.period.split('-')[0]);
                    baseDate.setDate(baseDate.getDate() + 15);
                    return baseDate.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
                  })()}
                </Typography>

              </TableCell>
              {/* <TableCell sx={{ fontsize: "10px", backgroundColor: '#f9fafb', py: 0.5, width: "15%" }}>Discount Date</TableCell>
              <TableCell sx={{ fontsize: "10px", py: 0.5, width: "15%" }} >Unknown</TableCell> */}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Second Table */}
      <TableContainer sx={{ border: '1px solid #ccc', borderRadius: "5px" }}>
        <Table size="small">
          <TableBody>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb', width: "25%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Name & Address:
                </Typography>
              </TableCell>
              <TableCell colSpan={7} >
                <Typography fontSize="10px"  >
                  {data.meterLableName} -{data.buildingName} - {data.orgName} - {data.address}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Tariff
                </Typography>
              </TableCell>
              <TableCell sx={{ width: "15%" }}>
                <Typography fontSize="10px"  >
                  {data.tariff}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb', width: "40%" }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Wheeling Energy
                </Typography>
              </TableCell>
              <TableCell sx={{}}>
                <Typography fontSize="10px"  >
                  0</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Contract Demand (KVA)
                </Typography>
              </TableCell>
              <TableCell sx={{}}>
                <Typography fontSize="10px"  >
                  {data.contractDemand}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Special Energy
                </Typography>
              </TableCell>
              <TableCell sx={{}}>
                <Typography fontSize="10px"  >
                  0</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  90% of CD (KVA)
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  {data.contractDemand * 0.9}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Base Consumption
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  0</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Recorded Demand (KVA)
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  {data.contractDemand * 0.9}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Power Cut
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  0
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Billing Demand (KVA)
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  {data.contractDemand * 0.9}
                </Typography>
              </TableCell>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Power Cut Energy Entitlement Demand Entitlement
                </Typography>
              </TableCell>
              <TableCell>
                <Typography fontSize="10px"  >
                  0
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ backgroundColor: '#f9fafb' }}>
                <Typography fontSize="10px" fontWeight="bold" >
                  Type
                </Typography>
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>
                <Typography fontSize="10px"  >
                  {data.tariff}
                </Typography>
              </TableCell>

            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BillingDetails;

