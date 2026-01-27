import React from 'react';
import {  Button, Dialog, DialogActions, DialogContent, Grid, Typography } from '@mui/material';
import meterOptions from '../../meters/meters.json';
import ConfigItem from './SetUpConfigItem';


// Reusable Add Meter Dialog
export const AddMeterDialog = ({ open, onClose, config, onChange, onTest, onSave, testResponse, responseMessage, loaderPercentage }) => {
    const mappedDeviceMake = [...new Set(meterOptions.map(d => d.device_make))].map(m => ({ value: m, label: m }));
    const filteredModels = meterOptions.filter(d => d.device_make === config.meter_make).map(d => ({ value: d.device_model, label: d.device_model }));
    const selectedModel = meterOptions.find(d => d.device_make === config.meter_make && d.device_model === config.meter_model) || {};
    const baudRates = selectedModel.baud_rate?.map(b => ({ value: b, label: b })) || [{ value: 9600, label: '9600' }];
    const parities = selectedModel.parity?.map(p => ({ value: p.toLowerCase(), label: p })) || [{ value: 'even', label: 'Even' }];
  
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <ConfigItem label="Make" value={config.meter_make} onChange={onChange} name="meter_make" select options={mappedDeviceMake} />
              <ConfigItem label="Model" value={config.meter_model} onChange={onChange} name="meter_model" select options={filteredModels} disabled={!config.meter_make} />
              <ConfigItem label="Name" value={selectedModel.device_name || ''} disabled />
              <ConfigItem label="Device type" value={selectedModel.device_type || ''} disabled />
              <ConfigItem label="Meter no" value={`id${config.meter_no}`} disabled />
              <ConfigItem label="Label" value={config.label} onChange={onChange} name="label" disabled={!config.meter_model} />
            </Grid>
            <Grid item xs={12} md={6}>
              <ConfigItem label="BaudRate" value={config.con.baudRate} onChange={onChange} name="baudRate" select options={baudRates} />
              <ConfigItem
                label="DataBits"
                value={config.con.dataBits}
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
              <ConfigItem label="StopBits" value={config.con.stopBits} onChange={onChange} name="stopBits" select options={[{ value: 1, label: '1' }, { value: 2, label: '2' }]} />
              <ConfigItem label="Parity" value={config.con.parity} onChange={onChange} name="parity" select options={parities} />
            </Grid>
          </Grid>
          {responseMessage && (
            <Typography variant="caption">
              {responseMessage === 'success' ? `Meter response time: ${loaderPercentage}` : 'Meter connection failed. Check connectivity and settings.'}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="contained" size="small" onClick={onClose}>Close</Button>
          <Button variant="contained" size="small" color="success" onClick={onTest} disabled={!config.label || !config.meter_model || !config.meter_make}>Test</Button>
          <Button variant="contained" size="small" color="success" onClick={onSave} disabled={responseMessage !== 'success'}>Save</Button>
        </DialogActions>
      </Dialog>
    );
  };

