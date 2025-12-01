import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box, Grid, Paper, Stack, Chip, RadioGroup, FormControlLabel, Radio, Button, Divider } from '@mui/material';

export default function PlcConfigDialog({
    open,
    totalIo = 14,
    pinModes,
    setPinModes,
    inputCount,
    outputCount,
    onConfirm,
    onCancel,
    isEditing,
}) {
    const handlePinModeChange = (idx, mode) => {
        setPinModes(prev => {
            const next = [...prev];
            next[idx] = mode;
            return next;
        });
    };

    return (
        <Dialog open={open} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', py: 1 }}>
                <Typography variant="h6" fontWeight={600}>PLC I/O Configuration</Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>Configure your {totalIo}-pin module</Typography>
            </DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
                <Stack spacing={1}>
                    <Stack direction="row" spacing={1} py={1} alignItems="center">
                        <Chip size="small" label={`Inputs: ${inputCount}`} color="primary" variant="outlined" />
                        <Chip size="small" label={`Outputs: ${outputCount}`} color="warning" variant="outlined" />
                        <Chip size="small" label={`None: ${totalIo - inputCount - outputCount}`} backgroundColor="#9e9e9e" variant="outlined" />
                    </Stack>
                    <Divider  />
                    <Grid container spacing={1} sx={{ overflow: 'auto', pr: 1 }}                    >
                        {Array.from({ length: totalIo }).map((_, idx) => {
                            const mode = pinModes[idx] || 'none';
                            const pinColor = mode === 'input' ? '#2196f3' : mode === 'output' ? '#ff9800' : '#9e9e9e';
                            const pinBg = mode === 'input' ? '#e3f2fd' : mode === 'output' ? '#fff3e0' : '#f5f5f5';
                            return (
                                <Grid item xs={12} sm={6} md={4} key={`pin-${idx}`}>
                                    <Paper elevation={mode !== 'none' ? 2 : 0}
                                        sx={{ p: 0.5, borderRadius: 2, bgcolor: pinBg, border: `2px solid ${pinColor}` }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                <Chip label={`Pin ${idx + 1}`} size="small" sx={{ fontWeight: 700, bgcolor: pinColor, color: 'white', fontSize: '0.75rem' }} />
                                                {mode !== 'none' && (
                                                    <Chip label={mode === 'input' ? 'IN' : 'OUT'} size="small" variant="outlined" sx={{ fontWeight: 600, borderColor: pinColor, color: pinColor, fontSize: '0.7rem' }} />
                                                )}
                                            </Stack>
                                            <RadioGroup
                                                row
                                                value={mode}
                                                onChange={(e) => handlePinModeChange(idx, e.target.value)}
                                                sx={{ justifyContent: 'space-between' }}
                                            >
                                                <FormControlLabel value="none" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#9e9e9e' } }} />} label={<Typography variant="caption" fontWeight={500}>None</Typography>} sx={{ m: 0 }} />
                                                <FormControlLabel value="input" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#2196f3' } }} />} label={<Typography variant="caption" fontWeight={500}>Input</Typography>} sx={{ m: 0 }} />
                                                <FormControlLabel value="output" control={<Radio size="small" sx={{ '&.Mui-checked': { color: '#ff9800' } }} />} label={<Typography variant="caption" fontWeight={500}>Output</Typography>} sx={{ m: 0 }} />
                                            </RadioGroup>
                                        </Stack>
                                    </Paper>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ p: 1, pr: 2, bgcolor: '#f8f9fa', borderTop: '1px solid #e0e0e0' }}>
                <Button variant="outlined" size="small" onClick={onCancel}>Cancel</Button>
                <Button
                    variant="contained"
                    onClick={onConfirm}
                    size="small"
                    sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        fontWeight: 600,
                        '&:hover': { background: 'linear-gradient(135deg, #5568d3 0%, #63408a 100%)' }
                    }}
                >
                    {isEditing ? 'Update Configuration' : 'Confirm Configuration'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
