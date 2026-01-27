import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Box, Typography, Paper, Button, Grow, Fade, useTheme, Divider, CircularProgress, Select, MenuItem, FormControl, InputLabel, Grid, TextField, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import { useReactToPrint } from 'react-to-print';
import { FileText, Power, Settings2, Zap, CalendarClock, Edit3, Trash2, ListPlus, AlertTriangle, Thermometer, Eye, Wind, Filter, CalendarRange } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { graphqlClient } from '../../../client/client';
import { GET_ACTIVITY_LOG, GET_PROFILE_DATA } from '../../../client/query';
import { toast } from 'react-toastify';
import useActivityLogStore from '../../../store/zustand/useActivityLogStore'; // This store is now only for adding logs, not reading.
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import {
  startOfDay, endOfDay, subWeeks, startOfWeek, endOfWeek,
  subMonths, startOfMonth, endOfMonth, subYears, startOfYear, endOfYear, isValid,
  format as formatDateFns
} from 'date-fns';


const ActivityLogTab = ({ devicesFromParent = [], schedules = [] }) => {
  const theme = useTheme();
  const [allLogs, setAllLogs] = useState([]); // Stores all logs fetched from subscription
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [componentLoaded, setComponentLoaded] = useState(false);
  const componentRef = useRef(null);

  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Date filter state
  const [dateFilter, setDateFilter] = useState('today');
  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [filteredLogs, setFilteredLogs] = useState([]);

  // Device filter state
  const [selectedDeviceFilters, setSelectedDeviceFilters] = useState([]);

  useEffect(() => {
    setComponentLoaded(true);

    const fetchData = async () => {
      setLoadingLogs(true);
      setLoadingProfile(true);
      try {
        const logPromise = graphqlClient.request(GET_ACTIVITY_LOG);
        const profilePromise = graphqlClient.request(GET_PROFILE_DATA);

        const [logData, profileData] = await Promise.all([logPromise, profilePromise]);

        setAllLogs(logData?.activity_log || []);
        setUserProfile(profileData?.profiles?.[0] || null);

      } catch (err) {
        console.error('Failed to fetch initial data:', err);
        toast.error('Failed to load initial data for activity log.');
      } finally {
        setLoadingLogs(false);
        setLoadingProfile(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const now = new Date();
    let startDate = startOfDay(now);
    let endDate = endOfDay(now);

    switch (dateFilter) {
      case 'today':
        break;
      case 'lastWeek':
        startDate = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        endDate = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
        break;
      case 'lastMonth':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        break;
      case 'lastYear':
        startDate = startOfYear(subYears(now, 1));
        endDate = endOfYear(subYears(now, 1));
        break;
      case 'custom':
        if (isValid(customStartDate) && isValid(customEndDate)) {
          startDate = startOfDay(customStartDate);
          endDate = endOfDay(customEndDate);
        } else {
          // If custom dates are not valid, apply no date filtering for now, but keep device filter
          const deviceFiltered = selectedDeviceFilters.length > 0
            ? allLogs.filter(log => log.itemType === 'Device' && selectedDeviceFilters.includes(String(log.itemId)))
            : allLogs;
          setFilteredLogs(deviceFiltered.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
          return;
        }
        break;
      default: // allTime
        const deviceFilteredAllTime = selectedDeviceFilters.length > 0
            ? allLogs.filter(log => log.itemType === 'Device' && selectedDeviceFilters.includes(String(log.itemId)))
            : allLogs;
        setFilteredLogs(deviceFilteredAllTime.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
        return;
    }

    let logsToFilter = allLogs;
    
    // Apply date filter
    const dateFilteredLogs = logsToFilter.filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });

    // Apply device filter
    const finalFilteredLogs = selectedDeviceFilters.length > 0
      ? dateFilteredLogs.filter(log => {
          // Only apply device filter if the log itemType is 'Device' and its itemId matches.
          // Logs from other sources (Rules, Schedules) might not have a device itemId, so they won't be filtered out by the device filter unless we specifically want that.
          if (log.itemType === 'Device') {
            return selectedDeviceFilters.includes(String(log.itemId));
          }
          // For non-device logs, or if you want them to appear regardless of device filter:
          return true; // Or implement more specific logic if other log types should also be device-filterable
        })
      : dateFilteredLogs;

    setFilteredLogs(finalFilteredLogs.slice().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));

  }, [allLogs, dateFilter, customStartDate, customEndDate, selectedDeviceFilters]);


  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Switchology-Activity-Report-' + formatDateFns(new Date(), 'yyyy-MM-dd'),
    pageStyle: `
      @media print { 
        body { margin: 20px; font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
        .report-container { width: 100%; }
        .report-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
        .report-header .logo { font-size: 1.5em; font-weight: bold; color: ${theme.palette.primary.main}; }
        .report-header .hub-title { font-size: 1.8em; font-weight: bold; text-align: center; flex-grow: 1; }
        .report-header .contact-info { font-size: 0.8em; text-align: right; }
        .report-main-title { font-size: 1.5em; font-weight: bold; text-align: center; margin-bottom: 15px; }
        .section-title { font-size: 1.2em; font-weight: bold; margin-top: 15px; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 1px solid #ddd; }
        .user-profile-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 5px 15px; margin-bottom: 15px; font-size: 9pt; }
        .user-profile-grid div span:first-child { font-weight: bold; min-width: 100px; display: inline-block; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
        th, td { border: 1px solid #ccc; padding: 5px 7px; text-align: left; font-size: 9pt; word-break: break-word; }
        th { font-weight: bold; color: white; }
        .device-status-header th { background-color: #2E7D32 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .automation-rules-header th { background-color: #EF6C00 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .schedules-header th { background-color: #0277BD !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        .activity-log-header th { background-color: #512DA8 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }`
  });

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateForGrouping = (dateString) => {
    if (!dateString) return 'Unknown Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format for reliable sorting
  };

  const getIconForLog = (log) => {
    const commonProps = { size: 20, style: { marginRight: theme.spacing(1.5) } };
    switch (log.source?.toLowerCase()) {
      case 'manual control':
        return <Power {...commonProps} color={log.action?.toLowerCase().includes('on') ? theme.palette.success.main : theme.palette.error.main} />;
      case 'device management':
        if (log.action?.toLowerCase().includes('delete')) return <Trash2 {...commonProps} color={theme.palette.error.main} />;
        if (log.action?.toLowerCase().includes('update')) return <Edit3 {...commonProps} color={theme.palette.info.main} />;
        if (log.action?.toLowerCase().includes('add')) return <ListPlus {...commonProps} color={theme.palette.success.main} />;
        return <Settings2 {...commonProps} color={theme.palette.text.secondary} />;
      case 'automation rules':
        return <Zap {...commonProps} color={theme.palette.primary.main} />;
      case 'schedules':
        return <CalendarClock {...commonProps} color={theme.palette.secondary.main} />;
      default:
        return <AlertTriangle {...commonProps} color={theme.palette.text.secondary} />;
    }
  };

  const getGroupHeader = (dateStr) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const logDate = new Date(dateStr);
    if (logDate.toDateString() === today.toDateString()) return "Today";
    if (logDate.toDateString() === yesterday.toDateString()) return "Yesterday";
    return formatDateFns(logDate, 'PPP'); // e.g., "Jan 1, 2023"
  };

  const groupedLogs = useMemo(() => {
    return filteredLogs.reduce((acc, log) => {
      const dateKey = formatDateForGrouping(log.timestamp);
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      acc[dateKey].push(log);
      return acc;
    }, {});
  }, [filteredLogs]);

  const dateFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'lastWeek', label: 'Last Week' },
    { value: 'lastMonth', label: 'Last Month' },
    { value: 'lastYear', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' },
    { value: 'allTime', label: 'All Time' },
  ];

  const handleDeviceFilterChange = (event) => {
    const {
      target: { value },
    } = event;
    setSelectedDeviceFilters(
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
  };


  return (
    <Fade in={componentLoaded} timeout={500}>
      <Paper elevation={0} sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 2, backgroundColor: 'transparent' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5, flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Activity Log</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileText size={18} />}
            onClick={handlePrint}
            disabled={loadingLogs || loadingProfile }
            size="small"
          >
            Generate Report
          </Button>
        </Box>

        <Paper elevation={2} sx={{ p: 2, mb: 2.5, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Date Range</InputLabel>
                <Select
                  value={dateFilter}
                  label="Date Range"
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    if (e.target.value !== 'custom') {
                      setCustomStartDate(null);
                      setCustomEndDate(null);
                    }
                  }}
                >
                  {dateFilterOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {dateFilter === 'custom' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="Start Date"
                      value={customStartDate}
                      onChange={(newValue) => setCustomStartDate(newValue)}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    <DatePicker
                      label="End Date"
                      value={customEndDate}
                      onChange={(newValue) => setCustomEndDate(newValue)}
                      minDate={customStartDate}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}
            <Grid item xs={12} sm={6} md={dateFilter === 'custom' ? 3 : 6}>
              <FormControl fullWidth size="small" disabled={devicesFromParent.length === 0}>
                <InputLabel>Filter by Device</InputLabel>
                <Select
                  multiple
                  value={selectedDeviceFilters}
                  onChange={handleDeviceFilterChange}
                  input={<OutlinedInput label="Filter by Device" />}
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>All Devices</em>;
                    }
                    const selectedNames = devicesFromParent
                      .filter(device => selected.includes(String(device.id)))
                      .map(device => device.name);
                    return selectedNames.join(', ');
                  }}
                  MenuProps={MenuProps}
                >
                  {devicesFromParent.map((device) => (
                    <MenuItem key={device.id} value={String(device.id)}>
                      <Checkbox checked={selectedDeviceFilters.indexOf(String(device.id)) > -1} size="small" />
                      <ListItemText primary={device.name} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {(loadingLogs || loadingProfile) && !filteredLogs.length && !allLogs.length ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading activity...</Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 'calc(100vh - 420px)', overflowY: 'auto', pr: 1 }}>
            {Object.keys(groupedLogs).length > 0 ? (
              Object.entries(groupedLogs).map(([dateKey, logsInGroup], groupIndex) => (
                <Grow in={componentLoaded} key={dateKey} timeout={300 * (groupIndex + 1)}>
                  <Box mb={3}>
                    <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 1.5, color: theme.palette.text.secondary, position: 'sticky', top: 0, bgcolor: theme.palette.background.paper, zIndex: 1, py: 1 }}>
                      {getGroupHeader(dateKey)}
                    </Typography>
                    {logsInGroup.map((log, logIndex) => (
                      <Grow in={componentLoaded} key={log.id || uuidv4()} timeout={100 * (logIndex + 1) + 300 * (groupIndex + 1)}>
                        <Paper
                          elevation={1}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            p: 1.5,
                            mb: 1.5,
                            borderRadius: '8px',
                            backgroundColor: theme.palette.background.default,
                            borderLeft: '4px solid ' + (getIconForLog(log).props.color || theme.palette.divider),
                            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: theme.shadows[4]
                            }
                          }}
                        >
                          <Box sx={{ mr: 1.5, mt: 0.5 }}>{getIconForLog(log)}</Box>
                          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="body1" component="div" sx={{ fontWeight: 'medium', color: theme.palette.text.primary }}>
                              {log.itemName ? `"${log.itemName}" ` : ''}{log.action}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.secondary, mt: 0.25 }}>
                              {log.details}
                            </Typography>
                            <Typography variant="caption" sx={{ color: theme.palette.text.disabled, mt: 0.5 }}>
                              Source: {log.source} {log.itemType && (' (' + log.itemType + (log.itemId ? ' ID: ' + log.itemId : '') + ')')}
                            </Typography>
                          </Box>
                          <Typography variant="caption" sx={{ color: theme.palette.text.disabled, whiteSpace: 'nowrap', ml: 2, mt: 0.5 }}>
                            {formatDateForDisplay(log.timestamp)}
                          </Typography>
                        </Paper>
                      </Grow>
                    ))}
                  </Box>
                </Grow>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Filter size={48} color={theme.palette.text.disabled} />
                <Typography color="text.secondary" sx={{ mt: 1 }}>No activity logs found for the selected period.</Typography>
              </Box>
            )}
          </Box>
        )}

        <div style={{ display: 'none' }}>
          <div ref={componentRef} className="report-container">
            <div className="report-header">
              <div className="logo">SWITCHOLOGY</div>
              <div className="hub-title">Switchology Activity Report</div>
              <div className="contact-info">
                {userProfile?.orgname || 'N/A'}<br />
                {userProfile?.buildingName || 'N/A'}<br />
                {userProfile?.address || 'N/A'}
              </div>
            </div>

            <div className="section-title">User Profile</div>
            {userProfile ? (
              <div className="user-profile-grid">
                <div><span>Username:</span> <span>{userProfile.name || 'N/A'}</span></div>
                <div><span>Email:</span> <span>{userProfile.email || 'N/A'}</span></div>
                <div><span>Gateway Name:</span> <span>{userProfile.gatewayName || 'N/A'}</span></div>
                <div><span>Organization:</span> <span>{userProfile.orgname || 'N/A'}</span></div>
                <div><span>Building:</span> <span>{userProfile.buildingName || 'N/A'}</span></div>
                <div><span>Address:</span> <span>{userProfile.address || 'N/A'}</span></div>
              </div>
            ) : (
              <p>User profile data not available.</p>
            )}

            <div className="section-title">Device Status</div>
            <table className="device-status-table">
              <thead className="device-status-header">
                <tr><th>ID</th><th>Name</th><th>Type</th><th>Relay No.</th><th>Status</th></tr>
              </thead>
              <tbody>
                {Array.isArray(devicesFromParent) && devicesFromParent.length > 0 ? devicesFromParent.map((device) => (
                  <tr key={'pdf-device-' + device.id}>
                    <td>{device.id}</td>
                    <td>{device.name || 'N/A'}</td>
                    <td>{device.type || 'N/A'}</td>
                    <td>{device.relay ?? 'N/A'}</td>
                    <td>{typeof device.status === 'boolean' ? (device.status ? 'ON' : 'OFF') : 'N/A'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No device data available.</td></tr>
                )}
              </tbody>
            </table>
            
            <div className="section-title">Automation Rules Status</div>
            <table className="automation-rules-table">
              <thead className="automation-rules-header">
                <tr><th>ID</th><th>Name</th><th>Trigger</th><th>Condition</th><th>Action</th><th>Status</th></tr>
              </thead>
              <tbody>
                {Array.isArray(automationRules) && automationRules.length > 0 ? automationRules.map((rule) => (
                  <tr key={`pdf-rule-${rule.id}`}>
                    <td>{rule.id}</td>
                    <td>{rule.name || 'N/A'}</td>
                    <td>{(rule.triggerType || 'N/A') + ' on ' + (rule.triggerDeviceLabel || rule.triggerDeviceId || 'N/A')}</td>
                    <td>{`${rule.conditionOperator || ''} ${rule.conditionValue ?? ''} ${rule.conditionUnit || ''}`}</td>
                    <td>{`${rule.actionType || 'N/A'} on ${rule.actionDeviceLabel || rule.actionDeviceId || 'N/A'}`}</td>
                    <td>{rule.isEnabled ? 'Enabled' : 'Disabled'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No automation rules data available.</td></tr>
                )}
              </tbody>
            </table>

            <div className="section-title">Schedules Status</div>
            <table className="schedules-table">
              <thead className="schedules-header">
                <tr><th>ID</th><th>Device</th><th>Action</th><th>Time</th><th>Frequency</th><th>Custom Days</th><th>Status</th></tr>
              </thead>
              <tbody>
                {Array.isArray(schedules) && schedules.length > 0 ? schedules.map((schedule) => (
                  <tr key={`pdf-schedule-${schedule.id}`}>
                    <td>{schedule.id}</td>
                    <td>{schedule.deviceNameLabel || schedule.deviceId || 'N/A'}</td>
                    <td>{schedule.action || 'N/A'}</td>
                    <td>{schedule.time || 'N/A'}</td>
                    <td>{schedule.frequency || 'N/A'}</td>
                    <td>{Array.isArray(schedule.customDays) && schedule.customDays.length > 0 ? schedule.customDays.join(', ') : (schedule.frequency === 'Custom Days' ? 'None' : 'N/A')}</td>
                    <td>{schedule.isEnabled ? 'Enabled' : 'Disabled'}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No schedules data available.</td></tr>
                )}
              </tbody>
            </table>

            <div className="section-title">Activity Log (Filtered)</div>
            <table className="activity-log-table">
              <thead className="activity-log-header">
                <tr><th>Timestamp</th><th>Source</th><th>Item</th><th>Action</th><th>Details</th></tr>
              </thead>
              <tbody>
                {filteredLogs && filteredLogs.length > 0 ? filteredLogs.map((log) => (
                  <tr key={`pdf-log-${log.id || uuidv4()}`}>
                    <td>{new Date(log.timestamp).toLocaleString('en-IN')}</td>
                    <td>{log.source}</td>
                    <td>{log.itemName} {log.itemType && `(${log.itemType}${log.itemId ? ` ID: ${log.itemId}` : ''})`}</td>
                    <td>{log.action}</td>
                    <td>{log.details}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ textAlign: 'center' }}>No activity logs for selected period.</td></tr>
                )}
              </tbody>
            </table>
          </div >
        </div >
      </Paper >
    </Fade >
  );
};

export default ActivityLogTab;

    