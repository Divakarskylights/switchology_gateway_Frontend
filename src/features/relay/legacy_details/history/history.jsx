import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Grid, Box, Typography, Alert } from '@mui/material';
import { configInit } from '../../../../component/global/globalvariable';

export default function History() {
    const [historyData, setHistoryData] = useState([]);
    const [error, setError] = useState(null);

    async function fetchHistoryData() {
        try {
            const response = await fetch('http://192.168.4.2:1919/api/getRelay');
            if (response.ok) {
                const data = await response.json();
                setHistoryData(data.trigger);
            } else {
                throw new Error('Failed to fetch relay status');
            }
        } catch (err) {
            console.error('Error fetching relay status:', err);
            setError(err);
        }
    }

    useEffect(() => {
        fetchHistoryData();
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'timestamp',
                header: 'Date and Time',
                size: { lg: 150 },
                Cell: ({ renderedCellValue }) => {
                    return <span>{configInit.formatDates(renderedCellValue)}</span>;
                },
            },
            {
                accessorKey: 'relayname',
                header: 'Relay Name',
                size: { lg: 150 },
                Cell: ({ renderedCellValue }) => {
                    return <span>{Number(renderedCellValue) + 1}</span>;
                },
            },            
            {
                accessorKey: 'command',
                header: 'Command',
                size: { lg: 150 },
            },
            {
                accessorKey: 'triggermode',
                header: 'Trigger Mode',
                size: { lg: 150 },
                Cell: ({ cell }) => (
                    <span>{cell.getValue() === 'Instant' ? 'Instant' : 'Schedule'}</span>
                ),
            },

        ],
        [],
    );

    const historyTable = useMaterialReactTable({
        data: historyData,
        columns,
        enableTopToolbar: false,
        enableColumnActions: false,
        enableSorting: false,
    });


    return (
        <Grid container justifyContent="center" sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5',borderRadius:2 }}>
            <Grid item xs={12} md={10} lg={12} sx={{border:1,borderRadius:2}}>
                {error ? (
                    <>
                    <Alert variant='filled' severity="error"> Error fetching History: {error.message}</Alert> </>
                ) : (
                    <MaterialReactTable table={historyTable} />
                )}
            </Grid>
        </Grid>
    );
}
