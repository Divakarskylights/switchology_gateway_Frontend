
import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, Typography, Grow, RadioGroup, Radio, FormControlLabel, FormLabel, Box
} from '@mui/material';
import { Lightbulb, Thermometer, Move, Zap, ChevronDown } from 'lucide-react';
import IOSSwitch from '../components/IOSSwitch';
import { toast } from 'react-toastify';

const knownTriggerTypesWithUnits = [
  { value: 'lightLevel', label: 'Light Level', icon: <Lightbulb size={18} />, unit: 'lux' },
  { value: 'temperature', label: 'Temperature', icon: <Thermometer size={18} />, unit: '°C' },
  { value: 'motion', label: 'Motion Detected', icon: <Move size={18} />, unit: '' },
  { value: 'powerUsage', label: 'Power Usage', icon: <Zap size={18} />, unit: 'W' },
];

const conditionOperators = [
  { value: '==', label: 'Equals To (==)' },
  { value: '!=', label: 'Not Equals To (!=)' },
  { value: '>', label: 'Greater Than (>)' },
  { value: '<', label: 'Less Than (<)' },
  { value: '>=', label: 'Greater Than or Equals To (>=)' },
  { value: '<=', label: 'Less Than or Equals To (<=)' },
];

const actionTypes = [
  { value: 'turnOn', label: 'Turn ON' },
  { value: 'turnOff', label: 'Turn OFF' },
  { value: 'toggle', label: 'Toggle' },
];


const AutomationRuleDialog = ({
  open,
  onClose,
  onSave,
  initialData,
  availableDevices = [],
  configuredMeters = [],
}) => {
  const [ruleName, setRuleName] = useState('');
  const [triggerType, setTriggerType] = useState('');
  const [triggerDeviceId, setTriggerDeviceId] = useState('');
  const [conditionOperator, setConditionOperator] = useState('>');
  const [conditionValue, setConditionValue] = useState('');
  const [actionType, setActionType] = useState('turnOn');
  const [actionDeviceId, setActionDeviceId] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);

  const allTriggerSources = useMemo(() => {
    return (configuredMeters || []).map(meter => ({
      id: meter.id, 
      name: meter.name || `Meter ID: ${meter.id}`, // Fallback if name is still problematic
      source: 'meter'
    }));
  }, [configuredMeters]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setRuleName(initialData.name || '');
        setTriggerType(initialData.trigger_type || '');
        setTriggerDeviceId(initialData.trigger_device_id ? String(initialData.trigger_device_id) : '');
        setConditionOperator(initialData.condition_operator || '>');
        setConditionValue(initialData.condition_value?.toString() || '');
        setActionType(initialData.action_type || 'turnOn');
        setActionDeviceId(initialData.action_device_id ? String(initialData.action_device_id) : '');
        setIsEnabled(initialData.is_enabled !== undefined ? initialData.is_enabled : true);
      } else {
        setRuleName('');
        setTriggerType('');
        setTriggerDeviceId('');
        setConditionOperator('>');
        setConditionValue('');
        setActionType('turnOn');
        setActionDeviceId('');
        setIsEnabled(true);
      }
    }
  }, [initialData, open]);

  const handleSubmit = () => {
    if (!ruleName || !triggerType || !triggerDeviceId || !conditionOperator || conditionValue === '' || !actionType || !actionDeviceId) {
      toast.error('Please fill in all required fields.');
      return;
    }

    const selectedTriggerConfig = knownTriggerTypesWithUnits.find(t => t.value.toLowerCase() === triggerType.toLowerCase());
    const selectedTriggerSource = allTriggerSources.find(s => s.id === triggerDeviceId);
    const selectedActionDevice = availableDevices.find(d => String(d.id) === actionDeviceId);

    onSave({
      // id: initialData?.id, // ID is handled by parent
      name: ruleName,
      trigger: {
        type: triggerType,
        deviceId: triggerDeviceId,
        label: selectedTriggerSource ? selectedTriggerSource.name : triggerDeviceId,
        unit: selectedTriggerConfig?.unit || null,
      },
      conditionOperator,
      conditionValue: parseFloat(conditionValue),
      action: {
        type: actionType,
        deviceId: actionDeviceId,
        label: selectedActionDevice ? selectedActionDevice.name : actionDeviceId,
      },
      enabled: isEnabled,
    });
    // onClose(); // Parent handles closing after successful save if needed
  };

  const getUnitForTrigger = (type) => {
    if (!type) return '';
    const knownType = knownTriggerTypesWithUnits.find(t => t.value.toLowerCase() === type.toLowerCase());
    return knownType?.unit || '';
  };

  const actionableDevices = availableDevices;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Grow}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: 5,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium', pb: 1 }}>
        {initialData ? 'Edit Automation Rule' : 'Add New Automation Rule'}
      </DialogTitle>
      <DialogContent sx={{ pt: '10px !important' }}>
        <Grid container spacing={2.5} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              label="Rule Name"
              fullWidth
              value={ruleName}
              onChange={(e) => setRuleName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Trigger Type"
              fullWidth
              value={triggerType}
              onChange={(e) => setTriggerType(e.target.value)}
              variant="outlined"
              size="small"
              placeholder="e.g., temperature, lightLevel"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={allTriggerSources.length === 0}>
              <InputLabel>Trigger Meter</InputLabel>
              <Select
                value={triggerDeviceId}
                label="Trigger Meter"
                onChange={(e) => setTriggerDeviceId(e.target.value)}
                IconComponent={ChevronDown}
                renderValue={(selected) => {
                  const source = allTriggerSources.find(s => s.id === selected);
                  return source ? (source.name || `ID: ${source.id}`) : '';
                }}
              >
                {allTriggerSources.map((source) => (
                  <MenuItem key={source.id} value={source.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2">{source.name || `ID: ${source.id}`}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Condition Operator</InputLabel>
              <Select
                value={conditionOperator}
                label="Condition Operator"
                onChange={(e) => setConditionOperator(e.target.value)}
                IconComponent={ChevronDown}
              >
                {conditionOperators.map((op) => (
                  <MenuItem key={op.value} value={op.value}>
                    {op.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>


          <Grid item xs={12} sm={6}>
            <TextField
              label={`Condition Value ${getUnitForTrigger(triggerType)}`}
              fullWidth
              type="number"
              value={conditionValue}
              onChange={(e) => setConditionValue(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl component="fieldset" fullWidth>
              <FormLabel component="legend" sx={{ fontSize: '0.9rem', mb: 0.5, fontWeight: 'medium' }}>Action Type</FormLabel>
              <RadioGroup
                row
                aria-label="action-type"
                name="actionType"
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                sx={{ justifyContent: 'space-around', flexWrap: 'wrap' }}
              >
                {actionTypes.map((type) => (
                  <FormControlLabel
                    key={type.value}
                    value={type.value}
                    control={<Radio size="small" />}
                    label={<Typography variant="body2">{type.label}</Typography>}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Grid>


          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={actionableDevices.length === 0}>
              <InputLabel>Action Device</InputLabel>
              <Select
                value={actionDeviceId}
                label="Action Device"
                onChange={(e) => setActionDeviceId(e.target.value)}
                IconComponent={ChevronDown}
              >
                {actionableDevices.map((device) => (
                  <MenuItem key={device.id} value={String(device.id)}>{device.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sx={{ mt: 1 }}>
            <FormControlLabel
              control={<IOSSwitch checked={isEnabled} onChange={(e) => setIsEnabled(e.target.checked)} />}
              label="Enable Rule"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', justifyContent: 'flex-end', gap: 1.5 }}>
        <Button variant="outlined" color="secondary" onClick={onClose} size="medium">Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" size="medium">
          Save Rule
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AutomationRuleDialog;
