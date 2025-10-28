
import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Typography, Grow, Box, CircularProgress } from '@mui/material';
import meterOptions from '../../../meters/meters.json';
import ConfigItem from './SetUpConfigItem';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';


// Reusable Add Meter Dialog
export const AddMeterDialog = ({ open, onClose, config, onChange, onTest, onSave, testResponse, responseMessage, loaderPercentage, usedMeterNos = [], saving = false }) => {
    const mappedDeviceMake = [...new Set(meterOptions.map(d => d.device_make))].map(m => ({ value: m, label: m }));
    const filteredModels = meterOptions.filter(d => d.device_make === config.meter_make).map(d => ({ value: d.device_model, label: d.device_model }));
    const selectedModel = meterOptions.find(d => d.device_make === config.meter_make && d.device_model === config.meter_model) || {};
    const baudRates = selectedModel.baud_rate?.map(b => ({ value: b, label: b.toString() })) || [{ value: 9600, label: '9600' }];
    const parities = selectedModel.parity?.map(p => ({ value: p.toLowerCase(), label: p })) || [{ value: 'even', label: 'Even' }];

    // Meter no dropdown logic: id2 to id25, exclude used except current
    const allMeterNos = Array.from({ length: 24 }, (_, i) => i + 2); // [2, 3, ..., 25]
    const availableMeterNos = allMeterNos.filter(no => !usedMeterNos.includes(no) || no === config.meter_no);
    const meterNoOptions = availableMeterNos.map(no => ({ value: no, label: `id${no}` }));

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        TransitionComponent={Grow}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium', pb: 1 }}>
          Add New Meter Configuration
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Grid container spacing={2} sx={{mt: 0.5}}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Device Information</Typography>
              <ConfigItem label="Make" value={config.meter_make} onChange={onChange} name="meter_make" select options={mappedDeviceMake} required />
              <ConfigItem label="Model" value={config.meter_model} onChange={onChange} name="meter_model" select options={filteredModels} disabled={!config.meter_make} required />
              <ConfigItem label="Name" value={selectedModel.device_name || ''} disabled />
              <ConfigItem label="Device type" value={selectedModel.device_type || ''} disabled />
              <ConfigItem label="Meter no"
                value={config.meter_no === '' || config.meter_no === undefined || config.meter_no === null ? '' : Number(config.meter_no)}
                onChange={onChange}
                name="meter_no"
                select
                options={meterNoOptions}
                required
              />
              <ConfigItem label="Label" value={config.label} onChange={onChange} name="label" disabled={!config.meter_model} required />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium', color: 'text.secondary' }}>Connection Settings</Typography>
              <ConfigItem label="BaudRate" value={config.con.baudRate} onChange={onChange} name="baudRate" select options={baudRates} />
              <ConfigItem label="DataBits" value={config.con.dataBits} onChange={onChange} name="dataBits" select options={[{ value: 8, label: '8' }, { value: 16, label: '16' }]} />
              <ConfigItem label="StopBits" value={config.con.stopBits} onChange={onChange} name="stopBits" select options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
              <ConfigItem label="Parity" value={config.con.parity} onChange={onChange} name="parity" select options={parities} />
            </Grid>
          </Grid>

          {responseMessage && (
            <Box sx={{ mt: 2, p: 1.5, borderRadius: 1,
                       backgroundColor: responseMessage === 'success' ? 'success.light' : responseMessage === 'testing' ? 'info.light' : 'error.light',
                       display: 'flex', alignItems: 'center'
            }}>
              {responseMessage === 'success' ?
                <CheckCircleOutlineIcon sx={{ color: 'success.dark', mr: 1 }} /> :
                responseMessage === 'testing' ?
                <HourglassEmptyIcon sx={{color: 'info.dark', mr: 1}} /> :
                <ErrorOutlineIcon sx={{ color: 'error.dark', mr: 1 }} />}
              <Typography variant="body2" sx={{ color: responseMessage === 'success' ? 'success.dark' : responseMessage === 'testing' ? 'info.dark' : 'error.dark', fontWeight: 'medium' }}>
                {responseMessage === 'success' ? `Test Successful! Response time: ${loaderPercentage}` :
                 responseMessage === 'testing' ? 'Testing meter connection...' :
                 'Meter connection failed. Check connectivity and settings.'}
              </Typography>
            </Box>
          )}

        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" color="secondary" onClick={onClose} size="small">Close</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onTest}
            disabled={!config.label || !config.meter_model || !config.meter_make }
            size="small"
            startIcon={<HourglassEmptyIcon />}
          >
            Test
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={onSave}
            disabled={responseMessage !== 'success' || saving}
            size="small"
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <CheckCircleOutlineIcon />}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

    