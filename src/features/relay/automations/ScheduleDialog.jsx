
import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, FormControlLabel, Checkbox, FormGroup, FormLabel, Box, Typography, Grow, RadioGroup, Radio
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import IOSSwitch from '../components/IOSSwitch';
import { toast } from 'react-toastify';


const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const frequencyOptions = [
  { value: 'Once', label: 'Once' },
  { value: 'Daily', label: 'Daily' },
  { value: 'Weekdays', label: 'Weekdays (Mon-Fri)' },
  { value: 'Weekends', label: 'Weekends (Sat-Sun)' },
  { value: 'Custom Days', label: 'Custom Days' },
];

const ScheduleDialog = ({ open, onClose, onSave, initialData, availableDevices = [] }) => {
  const [deviceId, setDeviceId] = useState('');
  const [action, setAction] = useState('Turn ON');
  const [time, setTime] = useState(dayjs());
  const [frequency, setFrequency] = useState('Daily');
  const [customDays, setCustomDays] = useState(
    daysOfWeek.reduce((acc, day) => {
      acc[day] = false;
      return acc;
    }, {})
  );
  const [isEnabled, setIsEnabled] = useState(true);

  useEffect(() => {
    if (open) { 
      if (initialData) {
        setDeviceId(initialData.device_id || '');
        setAction(initialData.action || 'Turn ON');
        setTime(initialData.time ? dayjs(initialData.time, 'HH:mm') : dayjs());
        setFrequency(initialData.frequency || 'Daily');
        
        const initialCustomDays = daysOfWeek.reduce((acc, day) => {
          acc[day] = (Array.isArray(initialData.custom_days) && initialData.custom_days.includes(day)) || false;
          return acc;
        }, {});
        setCustomDays(initialCustomDays);
        setIsEnabled(initialData.is_enabled !== undefined ? initialData.is_enabled : true);
      } else {
        setDeviceId('');
        setAction('Turn ON');
        setTime(dayjs());
        setFrequency('Daily');
        setCustomDays(daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: false }), {}));
        setIsEnabled(true);
      }
    }
  }, [initialData, open]);

  const handleCustomDayChange = (event) => {
    setCustomDays({ ...customDays, [event.target.name]: event.target.checked });
  };

  const handleFrequencyChange = (event) => {
    setFrequency(event.target.value);
  };

  const handleSubmit = () => {
    if (!deviceId || !action || !time || !frequency) {
      toast.error('Please fill in all required fields.');
      return;
    }

    let scheduleDetails = {
      // id: initialData?.id, // ID is handled by parent
      deviceId,
      action,
      time: time.format('HH:mm'), 
      frequency,
      enabled: isEnabled,
    };

    if (frequency === 'Custom Days') {
      scheduleDetails.customDays = Object.entries(customDays)
        .filter(([, checked]) => checked)
        .map(([day]) => day);
      if (scheduleDetails.customDays.length === 0) {
        toast.error('Please select at least one day for custom frequency.');
        return;
      }
    } else {
      scheduleDetails.customDays = []; 
    }

    onSave(scheduleDetails);
    onClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Dialog
        open={open}
        onClose={onClose}
        TransitionComponent={Grow}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 5,
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium', pb: 1 }}>
          {initialData ? 'Edit Schedule' : 'Add New Schedule'}
        </DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth size="small" disabled={availableDevices.length === 0}>
                <InputLabel>Device Name</InputLabel>
                <Select
                  value={deviceId}
                  label="Device Name"
                  onChange={(e) => setDeviceId(e.target.value)}
                >
                  {availableDevices.map((device) => (
                    <MenuItem key={device.id} value={String(device.id)}>{device.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Action</InputLabel>
                <Select
                  value={action}
                  label="Action"
                  onChange={(e) => setAction(e.target.value)}
                >
                  <MenuItem value="Turn ON">Turn ON</MenuItem>
                  <MenuItem value="Turn OFF">Turn OFF</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TimePicker
                label="Time"
                value={time}
                onChange={(newTime) => setTime(newTime)}
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl component="fieldset" fullWidth>
                <FormLabel component="legend" sx={{ fontSize: '0.9rem', mb: 0.5, fontWeight: 'medium' }}>Frequency</FormLabel>
                <RadioGroup
                  aria-label="frequency"
                  name="frequency"
                  value={frequency}
                  onChange={handleFrequencyChange}
                  row
                  sx={{ justifyContent: 'space-between', flexWrap: 'wrap' }} 
                >
                  {frequencyOptions.map((option) => (
                    <FormControlLabel 
                      key={option.value} 
                      value={option.value} 
                      control={<Radio size="small"/>} 
                      label={<Typography variant="body2">{option.label}</Typography>}
                    />
                  ))}
                </RadioGroup>
              </FormControl>
            </Grid>

            {frequency === 'Custom Days' && (
              <Grid item xs={12}>
                <FormControl component="fieldset" fullWidth variant="outlined" sx={{ p:1, borderRadius: 1, border: '1px solid', borderColor: 'divider'}}>
                  <FormLabel component="legend" sx={{fontSize: '0.8rem', mb:1, fontWeight:'medium'}}>Select Custom Days</FormLabel>
                  <FormGroup row sx={{justifyContent: 'space-around'}}>
                    {daysOfWeek.map((day) => (
                      <FormControlLabel
                        key={day}
                        control={
                          <Checkbox
                            checked={customDays[day]}
                            onChange={handleCustomDayChange}
                            name={day}
                            size="small"
                          />
                        }
                        label={<Typography variant="body2">{day}</Typography>}
                      />
                    ))}
                  </FormGroup>
                </FormControl>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: 1 }}>
              <FormControlLabel
                control={<IOSSwitch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />}
                label="Enable Schedule"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button variant="outlined" color="secondary" onClick={onClose} size="medium">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary" size="medium">
            Save Schedule
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default ScheduleDialog;
