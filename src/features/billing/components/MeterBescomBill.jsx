import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography,
} from "@mui/material";

const ElectricityBillingTable = ({ onClose }) => {
    const tableRef = useRef();

    const data = [
        { meter: "Ground Floor: Furlenco", ebPresentReading: 43384, ebPrevious: 40995, bill: 30825 },
        { meter: "1st Floor: Bank", ebPresentReading: 81856, ebPrevious: 77457, bill: 56765 },
    ];

    const enrichedData = data.map(row => ({
        ...row,
        difference: row.ebPresentReading - row.ebPrevious,
    }));
    const totals = {
        ebPresentReading: enrichedData.reduce((sum, row) => sum + row.ebPresentReading, 0),
        ebPrevious: enrichedData.reduce((sum, row) => sum + row.ebPrevious, 0),
        difference: enrichedData.reduce((sum, row) => sum + row.difference, 0),
        bill: enrichedData.reduce((sum, row) => sum + row.bill, 0),
    };
    const totalPercentage = totals.difference > 0 ? 100 : 0;
    enrichedData.forEach(row => {
        row.percentage = totals.difference > 0 ? ((row.difference / totals.difference) * 100).toFixed(2) : 0;
    });

    const handlePrint = useReactToPrint({
        content: () => tableRef.current,
        documentTitle: "Electricity Billing Table",
    });

    return (
        <>
            <div ref={tableRef}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    BESCOM/ EB Recording Date: 01 Nov 2024
                </Typography>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="electricity billing table">
                        <TableHead>
                            <TableRow>
                                {["Meter", "EB Present Reading", "EB Previous", "Difference", "Percentage", "Bill Rs."].map((header) => (
                                    <TableCell
                                        key={header}
                                        sx={{ fontWeight: "bold", padding: "4px 8px", fontSize: "0.875rem" }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrichedData.map((row, index) => (
                                <TableRow key={index}>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{row.meter}</TableCell>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{row.ebPresentReading}</TableCell>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{row.ebPrevious}</TableCell>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{row.difference}</TableCell>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{row.percentage}%</TableCell>
                                    <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>₹ {row.bill}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                        <TableBody>
                            <TableRow>
                                <TableCell sx={{ fontWeight: "bold", padding: "4px 8px", fontSize: "0.75rem" }}>Total</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{totals.ebPresentReading}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{totals.ebPrevious}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{totals.difference}</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>{totalPercentage}%</TableCell>
                                <TableCell sx={{ padding: "4px 8px", fontSize: "0.75rem" }}>₹ {totals.bill}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
            <Button onClick={handlePrint} size="small" variant="contained" color="primary" sx={{ m: 1 }}>
                Export to PDF
            </Button>
            <Button onClick={onClose} variant="contained" size="small" color="primary" sx={{ m: 1 }}>
                Close
            </Button>
        </>
    );
};

export default ElectricityBillingTable;
