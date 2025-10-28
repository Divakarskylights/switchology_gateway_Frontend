import React, { useState } from 'react';
import { Paper, Grid, Typography, TextField, MenuItem, Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { IntervalInput, MeterSelect, ParameterSelect } from './ReportPageComponents'; 
import DateRange from '../../../component/common/DateRange'; // Updated path

export const MeterReportForm = ({
    meterName, setMeterName, meterData, parameters, setParameters,
    interval, setInterval, aggregator, setAggregator, onGenerateClick,
}) => {
    const [viewDialogOpen, setViewDialogOpen] = useState(false);

    return (
        <Paper sx={{ p: 2 }} >
            <Grid container spacing={2} >
                {/* Row 1 */}
                <Grid item xs={12} sm={6}>
                    <MeterSelect
                        value={meterName}
                        options={meterData?.measurements}
                        onChange={(e) => setMeterName(e.target.value)}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <ParameterSelect
                        value={parameters}
                        options={meterData?.fields?.[meterName]}
                        onChange={(e) => setParameters(e.target.value)}
                        disabled={!meterName}
                        onView={() => setViewDialogOpen(true)}
                    />
                </Grid>

                {/* Row 2 */}
                <Grid item xs={12} sm={6}>
                    <IntervalInput
                        duration={interval.duration}
                        type={interval.type}
                        onChange={(key, val) => setInterval({ ...interval, [key]: val })}
                    />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{ minWidth: 100 }}>Aggregator:</Typography>
                        <TextField
                            select
                            size="small"
                            value={aggregator}
                            onChange={(e) => setAggregator(e.target.value)}
                            sx={{ width: 120 }}
                        >
                            {['mean', 'max', 'min', 'sum'].map((opt) => (
                                <MenuItem key={opt} value={opt}>{opt}</MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </Grid>

                {/* Row 3 */}
                <Grid item xs={12} sm={6}>
                    <Box>
                        <Typography sx={{ minWidth: 100 }}>Date Range:</Typography>
                        <DateRange />
                    </Box>
                </Grid>

            </Grid>
            <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    size='small'
                    disabled={!meterName || !parameters.length}
                    onClick={onGenerateClick}
                    sx={{ mt: 2 }}
                >
                    Generate
                </Button>
            </Grid>

            <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)}>
                <DialogTitle>Selected Parameters</DialogTitle>
                <DialogContent>
                    {Array.isArray(parameters) && parameters.length > 0 ? (
                        <ul>
                            {parameters.map((param, idx) => (
                                <li key={idx}>{param}</li>
                            ))}
                        </ul>
                    ) : (
                        <Typography>No parameters selected.</Typography>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button variant='contained' size='small' color='error' onClick={() => setViewDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>

        </Paper>
    );
};
