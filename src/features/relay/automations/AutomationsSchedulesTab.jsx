
import React, { useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Button, Grid, Switch, IconButton, Divider, useTheme, Grow, Tooltip, CircularProgress } from '@mui/material';
import { Zap, Sun, Thermometer, Power, Edit, Trash2, ListPlus, AlertTriangle, CalendarClock, Clock, Repeat, Move, CalendarPlus, Filter } from 'lucide-react';
import IOSSwitch from '../components/IOSSwitch';
import useActivityLogStore from '../../../store/zustand/useActivityLogStore';
import { graphqlClient } from '../../../client/client';
import {
  INSERT_AUTOMATION_RULE_MUTATION,
  UPDATE_AUTOMATION_RULE_MUTATION,
  DELETE_AUTOMATION_RULE_MUTATION,
  INSERT_SCHEDULE_MUTATION,
  UPDATE_SCHEDULE_MUTATION,
  DELETE_SCHEDULE_MUTATION,
} from '../../../client/query';
import { toast } from 'react-toastify';
import AutomationRuleDialog from './AutomationRuleDialog';
import ScheduleDialog from './ScheduleDialog';


const AutomationRuleCard = ({ rule, onToggleStatus, onEdit, onDelete, index }) => {
  const theme = useTheme();
  let triggerIcon;
  switch (rule.trigger_type?.toLowerCase()) {
    case 'lightlevel':
    case 'light level':
      triggerIcon = <Sun size={14} color={theme.palette.text.secondary} />;
      break;
    case 'temperature':
      triggerIcon = <Thermometer size={14} color={theme.palette.text.secondary} />;
      break;
    case 'motion':
    case 'motion detected':
      triggerIcon = <Move size={14} color={theme.palette.text.secondary} />
      break;
    case 'powerusage':
    case 'power usage':
      triggerIcon = <Zap size={14} color={theme.palette.text.secondary} />
      break;
    default:
      triggerIcon = <AlertTriangle size={14} color={theme.palette.warning.main} />;
  }

  const iconButtonBaseSx = {
    padding: '4px',
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  };

  const conditionDisplay = `${rule.condition_operator || ''} ${rule.condition_value ?? ''}${rule.condition_unit || ''}`;
  const actionDisplay = `${rule.action_type || ''} ${rule.action_device_label || rule.action_device_id || ''}`;


  return (
    <Grow in={true} timeout={300 * (index + 1)}>
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          borderRadius: '10px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: theme.shadows[5],
          },
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{
            mr: 1,
            color: theme.palette.primary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.7,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderRadius: '50%',
            width: 30,
            height: 30,
          }}>
            <Zap size={16} />
          </Box>
          <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500, fontSize: '0.9rem' }}>
            {rule.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Rule">
              <IconButton
                size="small"
                onClick={() => onEdit(rule)}
                aria-label="edit rule"
                sx={{
                  ...iconButtonBaseSx,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <Edit size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Rule">
              <IconButton
                size="small"
                onClick={() => onDelete(rule.id)}
                aria-label="delete rule"
                sx={{
                  ...iconButtonBaseSx,
                  '&:hover': {
                    color: theme.palette.error.main,
                  }
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ mb: 1, borderColor: theme.palette.divider }} />

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            {triggerIcon}
            <Typography variant="body2" sx={{fontSize: '0.8rem'}}><strong>Trigger:</strong> {rule.trigger_device_label || rule.trigger_device_id || 'N/A'}</Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 0.25, pl: '24px', color: 'text.secondary', fontSize: '0.8rem' }}>
            <strong>Condition:</strong> {conditionDisplay}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Power size={14} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{fontSize: '0.8rem'}}><strong>Action:</strong> {actionDisplay}</Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium', mr: 0.5, fontSize: '0.75rem' }}>
              Status:
            </Typography>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: rule.is_enabled ? theme.palette.success.main : theme.palette.error.main,
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: rule.is_enabled ? theme.palette.success.dark : theme.palette.error.dark, fontWeight: 'medium', fontSize: '0.75rem' }}
            >
              {rule.is_enabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
          <Switch checked={rule.is_enabled} onChange={() => onToggleStatus({ ruleId: rule.id, newStatus: !rule.is_enabled, ruleName: rule.name })} />
        </Box>
      </Paper>
    </Grow>
  );
};

const ScheduleCard = ({ schedule, onEdit, onDelete, onToggleStatus, index }) => {
  const theme = useTheme();
  const iconButtonBaseSx = {
    padding: '4px',
    borderRadius: '50%',
    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.03)',
    transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    }
  };

  return (
    <Grow in={true} timeout={300 * (index + 1)}>
      <Paper
        elevation={2}
        sx={{
          p: 1.5,
          borderRadius: '10px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: theme.shadows[5],
          },
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{
            mr: 1,
            color: theme.palette.secondary.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0.7,
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            borderRadius: '50%',
            width: 30,
            height: 30,
          }}>
            <CalendarClock size={16} />
          </Box>
          <Typography variant="body1" sx={{ flexGrow: 1, fontWeight: 500, fontSize: '0.9rem' }}>
            {schedule.device_name_label || schedule.device_id}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="Edit Schedule">
              <IconButton
                size="small"
                onClick={() => onEdit(schedule)}
                aria-label="edit schedule"
                sx={{
                  ...iconButtonBaseSx,
                  '&:hover': {
                    color: theme.palette.primary.main,
                  }
                }}
              >
                <Edit size={14} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Schedule">
              <IconButton
                size="small"
                onClick={() => onDelete(schedule.id)}
                aria-label="delete schedule"
                sx={{
                  ...iconButtonBaseSx,
                  '&:hover': {
                    color: theme.palette.error.main,
                  }
                }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Divider sx={{ mb: 1, borderColor: theme.palette.divider }} />

        <Box sx={{ flexGrow: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            <Power size={14} color={schedule.action?.toLowerCase().includes('on') ? theme.palette.success.main : theme.palette.error.main} />
            <Typography variant="body2" sx={{fontSize: '0.8rem'}}>{schedule.action}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
            <Clock size={14} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{fontSize: '0.8rem'}}>at {schedule.time}</Typography>
          </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
            <Repeat size={14} color={theme.palette.text.secondary} />
            <Typography variant="body2" sx={{fontSize: '0.8rem'}}>
              {schedule.frequency === 'Custom Days' && Array.isArray(schedule.custom_days) && schedule.custom_days.length > 0
                ? schedule.custom_days.join(', ')
                : schedule.frequency}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto', pt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 'medium', mr: 0.5, fontSize: '0.75rem' }}>
              Status:
            </Typography>
            <Box
              component="span"
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: schedule.is_enabled ? theme.palette.success.main : theme.palette.error.main,
                mr: 0.5,
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: schedule.is_enabled ? theme.palette.success.dark : theme.palette.error.dark, fontWeight: 'medium', fontSize: '0.75rem' }}
            >
              {schedule.is_enabled ? 'Enabled' : 'Disabled'}
            </Typography>
          </Box>
          <IOSSwitch checked={schedule.is_enabled} onChange={() => onToggleStatus({scheduleId: schedule.id, newStatus: !schedule.is_enabled, deviceName: schedule.device_name_label || schedule.device_id})} />
        </Box>
      </Paper>
    </Grow>
  );
};

const AutomationsSchedulesTab = ({
    availableDevices = [],
    configuredMeters = [],

    rawSchedulesFromProps = [],
    loadingSchedules: loadingSchedulesFromProps,

    // Functions to trigger password confirmation in parent
    onPromptAndSaveRule,
    onPromptAndEditRule,
    onPromptAndDeleteRule,
    onPromptAndToggleRuleStatus,

    onPromptAndSaveSchedule,
    onPromptAndEditSchedule,
    onPromptAndDeleteSchedule,
    onPromptAndToggleScheduleStatus,

    // Dialog states and handlers from parent
    isRuleDialogOpen,
    currentRuleData,
    onCloseRuleDialog,
    onOpenRuleDialog, // This will trigger password prompt
    
    isScheduleDialogOpen,
    currentScheduleData,
    onCloseScheduleDialog,
    onOpenScheduleDialog, // This will trigger password prompt
}) => {
  const theme = useTheme();
  const addLogEntry = useActivityLogStore((state) => state.addLogEntry);

  const [automationRules, setAutomationRules] = useState([]);
  const [schedules, setSchedules] = useState([]);

  // Format Automation Rules
  useEffect(() => {
    //console.log("AutomationsSchedulesTab received rawAutomationRulesFromProps:", rawAutomationRulesFromProps);
    //console.log("AutomationsSchedulesTab received availableDevices for rule formatting:", availableDevices);
    //console.log("AutomationsSchedulesTab received configuredMeters for rule formatting:", configuredMeters);

    if (Array.isArray(rawAutomationRulesFromProps)) {
        const formattedRules = rawAutomationRulesFromProps.map(rule => {
          let triggerDeviceDisplay = rule.trigger_device_label || rule.trigger_device_id;
          const actionDeviceDisplay = rule.action_device_label || rule.action_device_id;

          // Attempt to find a more descriptive name for the trigger device
          const triggerDevice = availableDevices.find(d => String(d.id) === String(rule.trigger_device_id)) ||
                                configuredMeters.find(m => String(m.id) === String(rule.trigger_device_id));
          if (triggerDevice && triggerDevice.name) {
            triggerDeviceDisplay = triggerDevice.name;
          }
    
          return {
            ...rule,
            trigger_device_label: triggerDeviceDisplay, // Use resolved name or fallback
            action_device_label: actionDeviceDisplay, // Keep as is or resolve similarly if needed
          };
        });
        //console.log("Formatted automation rules in AutomationsSchedulesTab:", formattedRules);
        setAutomationRules(formattedRules);
    } else {
        setAutomationRules([]);
    }
  }, [rawAutomationRulesFromProps, availableDevices, configuredMeters]);

  // Format Schedules
  useEffect(() => {
    //console.log("AutomationsSchedulesTab received rawSchedulesFromProps:", rawSchedulesFromProps);
    //console.log("AutomationsSchedulesTab received availableDevices for schedule formatting:", availableDevices);
    if (Array.isArray(rawSchedulesFromProps)) {
        const formattedScheds = rawSchedulesFromProps.map(schedule => {
          const device = availableDevices.find(d => String(d.id) === String(schedule.device_id));
          return {
            ...schedule,
            device_name_label: device ? device.name : (schedule.device_name_label || schedule.device_id),
          };
        });
        //console.log("Formatted schedules in AutomationsSchedulesTab:", formattedScheds);
        setSchedules(formattedScheds);
    } else {
        setSchedules([]);
    }
  }, [rawSchedulesFromProps, availableDevices]);


  const isLoading = loadingRulesFromProps || loadingSchedulesFromProps;

  // Edit handlers now call props to initiate password flow
  const handleEditAutomation = (rule) => {
    onPromptAndEditRule(rule); // This prop is passed from RelayPage and includes password prompt
  };

  const handleEditSchedule = (schedule) => {
    onPromptAndEditSchedule(schedule); // This prop is passed from RelayPage
  };

  // Save handlers are now also passed via props to RelayPage
  const handleSaveRule = (ruleData) => {
    const isEditing = currentRuleData && currentRuleData.id;
    onPromptAndSaveRule({ ruleData, isEditing });
  };

  const handleSaveSchedule = (scheduleData) => {
    const isEditing = currentScheduleData && currentScheduleData.id;
    onPromptAndSaveSchedule({ scheduleData, isEditing });
  };


  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading data...</Typography>
        </Box>
      )}
      {!isLoading && (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Automate Your Home</Typography>
              <Button
                variant="contained"
                startIcon={<ListPlus size={18} />}
                onClick={onOpenRuleDialog} // Directly call prop from RelayPage
                size="small"
              >
                Add Rule
              </Button>
            </Box>
            <Grid container spacing={2.5}>

            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Configured Schedules</Typography>
              <Button
                variant="contained"
                startIcon={<CalendarPlus size={18} />}
                onClick={onOpenScheduleDialog} // Directly call prop from RelayPage
                size="small"
              >
                Add Schedule
              </Button>
            </Box>
            <Grid container spacing={2.5}>
              {schedules.length > 0 ? schedules.map((schedule, index) => (
                <Grid item xs={12} sm={12} md={6} lg={4} xl={3} key={schedule.id} sx={{ mb: 3 }}>
                  <ScheduleCard
                    schedule={schedule}
                    onEdit={handleEditSchedule} // Uses internal handler that calls prop
                    onDelete={onPromptAndDeleteSchedule} // Prop from RelayPage
                    onToggleStatus={onPromptAndToggleScheduleStatus} // Prop from RelayPage
                    index={index}
                  />
                </Grid>
              )) : (
                <Grid item xs={12}>
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 3 }}>No schedules configured yet.</Typography>
                </Grid>
              )}
            </Grid>
          </Box>
        </>
      )}
      
      {isRuleDialogOpen && (
        <AutomationRuleDialog
          open={isRuleDialogOpen}
          onClose={onCloseRuleDialog}
          onSave={handleSaveRule} // Uses internal handler that calls prop
          initialData={currentRuleData}
          availableDevices={availableDevices} // General devices for action target
          configuredMeters={configuredMeters} // Meters for trigger source
        />
      )}

      {isScheduleDialogOpen && (
        <ScheduleDialog
          open={isScheduleDialogOpen}
          onClose={onCloseScheduleDialog}
          onSave={handleSaveSchedule} // Uses internal handler that calls prop
          initialData={currentScheduleData}
          availableDevices={availableDevices}
        />
      )}
    </Box>
  );
};

export default AutomationsSchedulesTab;

    
