
import React from 'react';
import { Box, Button, Grid, Typography, Paper, Divider } from '@mui/material';
import meterOptions from '../../../meters/meters.json';
import ConfigItem from './SetUpConfigItem';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

// Default meter configuration
const defaultMeter = {
  meter_make: '',
  meter_model: '',
  meter_name: '',
  meter_type: '',
  meter_no: '',
  label: '',
  // interval removed from default, will be based on global
  con: {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'even'
  }
};

// Reusable Meter Details Component
export const MeterDetails = ({ meter = defaultMeter, onChange, jsonDialogOpen, onRequestPassword, onSave, onDelete, onClose, responseMessage, loaderPercentage, globalInterval, usedMeterNos = [] }) => {
  const mappedDevice = meterOptions.find(d => d.device_make === meter?.meter_make && d.device_model === meter?.meter_model) || {};
  const baudRates = mappedDevice.baud_rate?.map(b => ({ value: b, label: b.toString() })) || [{ value: 9600, label: '9600' }];
  const parities = mappedDevice.parity?.map(p => ({ value: p.toLowerCase(), label: p })) || [{ value: 'even', label: 'Even' }];
  // Meter no dropdown logic: id2 to id25, exclude used except current
  const allMeterNos = Array.from({ length: 24 }, (_, i) => i + 2); // [2, 3, ..., 25]
  const availableMeterNos = allMeterNos.filter(no => !usedMeterNos.includes(no) || no === meter.meter_no);
  const meterNoOptions = availableMeterNos.map(no => ({ value: no, label: `id${no}` }));

  return (
    <Paper elevation={3} sx={{ p: { xs: 1, sm: 1 }, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ textAlign: 'center', fontWeight: 'medium', color: 'primary.main' }}>
        Edit Meter: {meter?.label || `ID ${meter?.meter_no}`}
      </Typography>
      <Divider />
      <Grid container spacing={3}>
        {/* Device Information Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>Device Information</Typography>
          <ConfigItem label="Make" value={meter?.meter_make || ''} disabled />
          <ConfigItem label="Model" value={meter?.meter_model || ''} disabled />
          <ConfigItem label="Name" value={meter?.meter_name || ''} disabled />
          <ConfigItem label="Type" value={meter?.meter_type || ''} disabled />
          <ConfigItem label="Meter No."
            value={meter?.meter_no === '' || meter?.meter_no === undefined || meter?.meter_no === null ? '' : Number(meter.meter_no)}
            onChange={onChange}
            name="meter_no"
            select
            options={meterNoOptions}
            // required
            disabled
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', px: 1, }}>Current Interval (Global): {globalInterval} sec</Typography>
        </Grid>

        {/* Connection Settings Section */}
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom sx={{ color: 'text.secondary' }}>Connection Settings</Typography>
          <ConfigItem label="Label" value={meter?.label || ''} onChange={onChange} name="label" disabled />
          <ConfigItem label="BaudRate" value={meter?.con?.baudRate || 9600} onChange={onChange} name="baudRate" select options={baudRates} />
          <ConfigItem label="DataBits" value={meter?.con?.dataBits || 8} onChange={onChange} name="dataBits" select options={[{ value: 8, label: '8' }, { value: 16, label: '16' }]} />
          <ConfigItem label="StopBits" value={meter?.con?.stopBits || 1} onChange={onChange} name="stopBits" select options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
          <ConfigItem label="Parity" value={meter?.con?.parity || 'even'} onChange={onChange} name="parity" select options={parities} />
        </Grid>
      </Grid>

      {responseMessage && (
        <Box sx={{
          borderRadius: 1, backgroundColor: responseMessage === 'success' ? 'success.light' : responseMessage === 'testing' ? 'info.light' : 'error.light',
          display: 'flex', alignItems: 'center'
        }}>
          {responseMessage === 'success' ?
            <CheckCircleOutlineIcon sx={{ color: 'success.dark', mr: 1 }} /> :
            responseMessage === 'testing' ?
              <HourglassEmptyIcon sx={{ color: 'info.dark', mr: 1 }} /> :
              <ErrorOutlineIcon sx={{ color: 'error.dark', mr: 1 }} />}
          <Typography variant="body2" sx={{ color: responseMessage === 'success' ? 'success.dark' : responseMessage === 'testing' ? 'info.dark' : 'error.dark', fontWeight: 'medium' }}>
            {responseMessage === 'success' ? `Test Successful! Response time: ${loaderPercentage}` :
              responseMessage === 'testing' ? 'Testing meter connection...' :
                'Meter connection failed. Check connectivity and settings.'}
          </Typography>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: { xs: 1, sm: 1, md: 1, lg: 0 }, gap: 1.5 }}>
        <Button variant="outlined" size="small" color="secondary" onClick={onClose}>Close</Button>
        <Button variant="outlined" size="small" color="primary" onClick={() => onRequestPassword && onRequestPassword()} disabled={jsonDialogOpen} startIcon={jsonDialogOpen ? <HourglassEmptyIcon /> : <CheckCircleOutlineIcon />}>Dashboard</Button>
        <Button variant="outlined" size="small" color="error" onClick={onDelete}>Delete</Button>
        <Button variant="contained" size="small" color="success" onClick={onSave}
          disabled={responseMessage !== 'success'}
          startIcon={<CheckCircleOutlineIcon />}
        >
          Save
        </Button>
      </Box>
    </Paper>
  );
};