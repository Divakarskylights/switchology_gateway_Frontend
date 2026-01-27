import React from 'react';
import { Box, Button, Grid, Typography } from '@mui/material';
import meterOptions from '../../meters/meters.json';
import ConfigItem from './SetUpConfigItem';

// Default meter configuration
const defaultMeter = {
  meter_make: '',
  meter_model: '',
  meter_name: '',
  meter_type: '',
  meter_no: '',
  label: '',
  con: {
    baudRate: 9600,
    dataBits: 8,
    stopBits: 1,
    parity: 'even',
    datatypeIfBulk: null
  }
};

// Reusable Meter Details Component
export const MeterDetails = ({ meter = defaultMeter, onChange, onTest, onSave, onDelete, onClose, testResponse, responseMessage, loaderPercentage }) => {
    const mappedDevice = meterOptions.find(d => d.device_make === meter?.meter_make && d.device_model === meter?.meter_model) || {};
    const baudRates = mappedDevice.baud_rate?.map(b => ({ value: b, label: b })) || [{ value: 9600, label: '9600' }];
    const parities = mappedDevice.parity?.map(p => ({ value: p.toLowerCase(), label: p })) || [{ value: 'even', label: 'Even' }];
  
    return (
      <Box sx={{ p: 2, border: '2px solid', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <ConfigItem label="Make" value={meter?.meter_make || ''} disabled />
            <ConfigItem label="Name" value={meter?.meter_name || ''} disabled />
            <ConfigItem label="Type" value={meter?.meter_type || ''} disabled />
            <ConfigItem label="Meter no" value={`id${meter?.meter_no || ''}`} disabled />
            <ConfigItem label="Model" value={meter?.meter_model || ''} disabled />
          </Grid>
          <Grid item xs={12} md={6}>
            <ConfigItem label="Label" value={meter?.label || ''} onChange={onChange} name="label" />
            <ConfigItem label="BaudRate" value={meter?.con?.baudRate || 9600} onChange={onChange} name="baudRate" select options={baudRates} />
            <ConfigItem
              label="DataBits"
              value={meter?.con?.dataBits || 8}
              onChange={onChange}
              name="dataBits"
              select
              options={[
                { value: 5, label: '5' },
                { value: 6, label: '6' },
                { value: 7, label: '7' },
                { value: 8, label: '8' },
              ]}
            />
            <ConfigItem label="StopBits" value={meter?.con?.stopBits || 1} onChange={onChange} name="stopBits" select options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
            <ConfigItem label="Parity" value={meter?.con?.parity || 'even'} onChange={onChange} name="parity" select options={parities} />
            <ConfigItem
              label="Datatype (bulk)"
              value={meter?.con?.datatypeIfBulk || 'n/a'}
              name="datatypeIfBulk"
              disabled
            />
          </Grid>
        </Grid>
        {responseMessage && (
          <Typography variant="caption">
            {responseMessage === 'success' ? `Meter response time: ${loaderPercentage}` : 'Meter connection failed. Check connectivity and settings.'}
          </Typography>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'end', mt: 2 }}>
          <Button variant="contained" size="small" onClick={onClose}>Close</Button>
          <Button variant="contained" size="small" color="error" onClick={onDelete} sx={{ ml: 1 }}>Delete</Button>
          <Button variant="contained" size="small" color="success" onClick={onTest} sx={{ ml: 1 }} disabled={!meter?.label}>Test</Button>
          <Button variant="contained" size="small" color="success" onClick={onSave} sx={{ ml: 1 }} disabled={responseMessage !== 'success'}>Save</Button>
        </Box>
      </Box>
    );
  };
  