import React from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
} from "@mui/material";

const DetailedBill = ({data}) => {
  // Helper function to safely format numbers
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
    <Box>
      <Typography fontWeight="bold" fontSize="12px">
        Your Detailed Bill
      </Typography>

      <TableContainer sx={{ border: "1px solid #ccc", borderRadius: "5px" }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f9fafb", '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Description
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px", fontWeight: "bold", textAlign: "right" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Amount (Rs.)
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Demand Charges: {data.contractDemand * 0.9}KVA at Rs.{data.rawDemandChargesRsKva}/KVA 
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.demandCharges)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Energy Charges: {formatNumber(data.rowAdjNetConsumption)}KWh at Rs.{data.rawEnergyChargesRsKwh}/KWh 
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.adjEnergyCharges)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                    Fuel Cost Adj Rs.
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.fcaCharges)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Interest on Revenue Rs.
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.interOnReven)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Interest on Tax Rs.
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.interOnTax)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Tax {data.rawTaxPercent}% of (Energy Charges)
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.adjTax)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Current Bill Amount
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹{formatNumber(data.adjCurrentBillAmount)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Arrears
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}  >
                <Typography fontSize="10px"  fontWeight="bold" >
                  Bill Correction
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  FAC Short claim adjustment
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Bill rounding adjustment
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px"  >₹-</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ fontWeight: "bold", '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}  >
                <Typography fontSize="10px"  fontWeight="bold" >
                  Net EB Payable Amount
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px" fontWeight="bold" >₹{formatNumber(data.adjCurrentBillAmount)}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  DG Energy {data.dg_netConsumption} KWh at Rs. {data.dgTariff || 0}/KWh
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px" fontWeight="bold">₹{formatNumber(data.dg_netConsumption * (data.dgTariff || 0))}</Typography>
              </TableCell>
            </TableRow>
            <TableRow sx={{ backgroundColor: "#f9fafb", fontWeight: "bold", '& .MuiTableCell-root': { py: 0 } }}>
              <TableCell sx={{ fontsize: "10px" }}>
                <Typography fontSize="10px"  fontWeight="bold" >
                  Total Payable Amount
                </Typography>
              </TableCell>
              <TableCell sx={{ fontsize: "10px"  }} align="right">
                <Typography fontSize="10px" fontWeight="bold">₹{formatNumber(data.adjCurrentBillAmount + (data.dg_netConsumption * (data.dgTariff || 0)))}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DetailedBill;

