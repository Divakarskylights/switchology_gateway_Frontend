import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { configInit } from '../../../components/layout/globalvariable';


const TariffTable = ({ 
    loading, 
    tariffData, 
    fields, 
    // configInit, // This prop is not needed if configInit is imported directly
    handleEdit, 
    handleDeleteClick 
}) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ fontSize: '0.675rem', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Created Date</TableCell>
                        <TableCell sx={{ fontSize: '0.675rem', fontWeight: 'bold', textAlign: 'center', width: '5%' }}>Updated Date</TableCell>
                        {fields.map((field) => (
                            <TableCell key={field.name} sx={{ fontSize: '0.675rem', fontWeight: 'bold', textAlign: 'center' }}>{field.label}</TableCell>
                        ))}
                        <TableCell sx={{ fontSize: '0.675rem', fontWeight: 'bold', textAlign: 'center' }}>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading ? (
                        <TableRow>
                            <TableCell colSpan={fields.length + 3} sx={{ textAlign: 'center' }}>
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : tariffData?.tariffs.map((tariff) => (
                        <TableRow key={tariff.id}>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>
                                {configInit.formatDatesInTariff(tariff.createdDate)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>
                                {configInit.formatDatesInTariff(tariff.updatedDate)}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.tariffName}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.percentOfCdKva}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.demandChargesRsKva}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.energyChargesRsKwh}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.fuelCostAdjRsKwh}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.interestOnRevenue}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.interestOnTax}</TableCell>
                            <TableCell sx={{ textAlign: 'center', fontSize: '0.675rem' }}>{tariff.taxPercent}</TableCell>
                            <TableCell sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                                <IconButton 
                                    color="primary" 
                                    size="small"
                                    onClick={() => handleEdit(tariff)}
                                >
                                    <EditIcon />
                                </IconButton>
                                <IconButton 
                                    color="error" 
                                    size="small"
                                    onClick={() => handleDeleteClick(tariff)}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default TariffTable;
