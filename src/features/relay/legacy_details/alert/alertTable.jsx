import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { Grid, Box, Typography, Alert, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button, styled, Switch, FormControlLabel, Backdrop, CircularProgress, Tooltip } from '@mui/material';
import { configInit } from '../../../../component/global/globalvariable';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import EditIcon from '@mui/icons-material/Edit';
import IOSSwitch from '../../components/IOSSwitch';

export default function AlertTable({ params, setDialogData }) {
    const [alertData, setAlertData] = useState([]);
    const [error, setError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(null);
    const [backDrop, setBackDrop] = useState(false);
    const [switchOpen, setSwitchOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false)
    const [confirmationAction, setConfirmationAction] = useState(null);
    const [relayNo, setRelayNo] = useState(Number(params.relayNo) - 1)
    // console.log("djfkdjf",params)
   // console.log("kdjfkd", relayNo)
    async function fetchAlertData() {
        try {
            const response = await fetch('http://192.168.4.2:1919/api/getAlertData');
            if (response.ok) {
                const data = await response.json();
                const filteredData = data.alertData.filter((e) => e.triggererelay === relayNo);
                setAlertData(filteredData);
            } else {
                throw new Error('Failed to fetch relay status');
            }
        } catch (err) {
            console.error('Error fetching relay status:', err);
            setError(err);
        }
    }
    // console.log("kdjfkdjfk",selectedRowData.isEnabled)
    useEffect(() => {
        const interval = setInterval(() => {
            setBackDrop(false)
            fetchAlertData();
        }, 2000);
        return () => {
            clearInterval(interval);
        }
    }, []);

    const columns = useMemo(
        () => [
            {
                accessorKey: 'isEnabled',
                header: 'Alert Status',
                size: 100,
                Cell: ({ cell, row }) => (
                    <>
                        {/* {cell.getValue() ? 'On' : 'Off'} */}
                        <Tooltip title={row.original.isEnabled ? 'On' : 'Off'}>
                            <FormControlLabel
                                control={
                                    <IOSSwitch
                                        checked={row.original.isEnabled}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setConfirmationAction({
                                                id: row.original.id,
                                                newState: !row.original.isEnabled,
                                            });
                                            setSwitchOpen(true);
                                            //console.log('Switch toggled');
                                        }}
                                        sx={{ m: 1 }}
                                    />

                                }
                                label=""
                                sx={{ float: 'right' }}
                            />
                        </Tooltip>
                    </>
                ),
                enableSorting: false,
            },
            {
                accessorKey: 'createdat',
                header: 'Created At',
                size: 200,
                Cell: ({ renderedCellValue }) => {
                    return <span>{configInit.formatDates(renderedCellValue)}</span>;
                },
                enableSorting: false,
            },
            {
                accessorKey: 'alertname',
                header: 'Alert Name',
                size: 150,
                enableSorting: false,
            },
            {
                accessorKey: 'meterid',
                header: 'Meter ID',
                size: 100,
                enableSorting: true, // disable sorting for this column

            },
            {
                accessorKey: 'parameter',
                header: 'Parameter',
                size: 150,
                enableSorting: false,
            },
            {
                accessorKey: 'finaltriggerduration',
                header: 'Final Trigger Duration',
                size: 150,
                enableSorting: false,
            },
            {
                accessorKey: 'waitingduration',
                header: 'Waiting Duration',
                size: 150,
                enableSorting: false,
            },
            {
                accessorKey: 'trigger',
                header: 'Trigger',
                size: 100,
                enableSorting: false,
            },
            // {
            //     accessorKey: 'panelid',
            //     header: 'Panel ID',
            //     size: 100,
            // },
            {
                accessorKey: 'duration',
                header: 'Duration',
                size: 150,
                Cell: ({ cell }) => {
                    const duration = cell.getValue();
                    let displayValue = '';

                    if ('Above' in duration) {
                        displayValue = `Above: ${duration.Above}`;
                    } else if ('Below' in duration) {
                        displayValue = `Below: ${duration.Below}`;
                    } else if ('Between' in duration) {
                        displayValue = `Between: ${duration.Between}`;
                    } else if ('OutsideRange' in duration) {
                        displayValue = `OutsideRange: ${duration.OutsideRange}`;
                    }

                    return <span>{displayValue}</span>;
                },
                enableSorting: false,
            },

        ],
        [],
    );

    const handleRowClick = (row) => {
        setSelectedRowData(row.original);
        setDialogOpen(true);
    };

    const AlertTable = useMaterialReactTable({
        data: alertData,
        columns,
        enableTopToolbar: false,
        enableColumnActions: false,
        enableSorting: true,
        enableRowActions: true,
        initialState: {
            sorting: [
                { id: 'meterid', desc: false }, //sort by state in ascending order by default

            ],
        },
        renderRowActions: ({ row }) => [
            <EditIcon onClick={(e) => { e.stopPropagation(); setEditOpen(true); }} />
        ],
        enableFullScreenToggle: true,
        muiTableBodyRowProps: ({ row }) => ({
            onClick: () => {
                handleRowClick(row);
            }
        }),
    });
    async function handleConfirmationAction() {

        try {
            const response = await axios.post('http://192.168.4.2:1919/api/updateRelay', { id: confirmationAction.id, isEnabled: confirmationAction.newState });
            const { id, newState } = confirmationAction;
            //console.log("djkfjd", response.data === 1)
            if (response.data === 1) {
                setSwitchOpen(false);
                return toast.success("Alert mode on")
            } else {
                return toast.error("Alert state didn't change")
            }
            setConfirmationAction(null);
        } catch (err) {
            console.error("sdfsdfsdfsdf", err)
        }
    };

    const filteredRelay = alertData.filter((e) => e.triggererelay === relayNo);
    return (
        <Grid container justifyContent="center" sx={{ p: { xs: 2, sm: 3 }, bgcolor: '#f5f5f5', borderRadius: 2 }}>
            <Grid item xs={12} md={10} lg={12} sx={{ border: 1, borderRadius: 2 }}>
                {error ? (
                    <Alert variant="filled" severity="error">Error fetching History: {error.message}</Alert>
                ) : (
                    <MaterialReactTable table={AlertTable} />
                )}
            </Grid>
            <Grid item xs={12} md={10} lg={12} sx={{ m: 5 }}>
                {filteredRelay.map((item) => {
                    //console.log("Item:", item);
                    const { triggererelay, createdat, ...otherProps } = item;

                    if (triggererelay !== relayNo) {
                        return null;
                    }

                    return (
                             <Box  key={item.id} sx={{mt:2}}>
                            {createdat && typeof createdat === 'string' && (
                                <Typography variant="body1">
                                    <strong>createdat:</strong> {new Date(createdat).toLocaleString()}
                                </Typography>
                            )}
                            {Object.entries(otherProps).map(([key, value]) => (
                                <Typography key={key} variant="body1">
                                    <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                </Typography>
                            ))}
                            </Box>
                    );
                })}
            </Grid>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
                <DialogTitle>Panel Information</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedRowData && Object.entries(selectedRowData).map(([key, value]) => {
                            if (key === 'createdat' && typeof value === 'string') {
                                const date = new Date(value);
                                return (
                                    <Typography key={key} variant="body1">
                                        <strong>{key}:</strong> {date.toLocaleDateString()} {date.toLocaleTimeString()}
                                    </Typography>
                                );
                            } else {
                                return (
                                    <Typography key={key} variant="body1">
                                        <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                                    </Typography>
                                );
                            }
                        })}
                    </DialogContentText>
                </DialogContent>


                <DialogActions>
                    <Button onClick={() => setDialogOpen(false)}>Close</Button>
                </DialogActions>

            </Dialog>
            <Dialog open={switchOpen} onClose={() => setSwitchOpen(false)}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to {confirmationAction && confirmationAction.newState ? 'enable' : 'disable'} the alert?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleConfirmationAction()}>Yes</Button>
                    <Button onClick={() => setSwitchOpen(false)}>No</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Edit</DialogTitle>
                <DialogContent>
                    <DialogContentText>

                    </DialogContentText>
                    <DialogActions>
                        <Button onClick={() => setEditOpen(false)}>Close</Button>
                    </DialogActions>
                </DialogContent>

            </Dialog>
            <Backdrop
                sx={{ color: '#fff', bgcolor: 'rgb(0,0,0,0.1)', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={backDrop}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </Grid>

    );
}
