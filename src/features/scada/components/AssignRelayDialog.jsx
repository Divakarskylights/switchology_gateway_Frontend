
import React, { useState, useEffect, Fragment, useMemo } from 'react';
import {
  Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Typography, Grow, Box, useTheme, Tabs, Tab, List, ListItem,
  ListItemIcon, ListItemText, Divider, Chip, Grid, TextField // Added TextField
} from '@mui/material';
import { Zap, History as HistoryIcon, Settings2, AlertTriangle, Power, GitBranchPlus, CornerDownLeft, XCircle, Edit2 } from 'lucide-react'; // Added Edit2

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dialog-tabpanel-${index}`}
      aria-labelledby={`dialog-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 2, minHeight: 200, maxHeight: 350, overflowY: 'auto' }}> {/* Increased maxHeight slightly */}
          {children}
        </Box>
      )}
    </div>
  );
};

const AssignRelayDialog = ({
  open,
  onClose,
  onAssign,
  availableRelays = [],
  currentOutputRelayNo,
  currentInputRelayNo,
  currentShapeName, // New prop for current shape name

  allActivityLogs = [],
}) => {
  const [selectedOutputRelay, setSelectedOutputRelay] = useState('');
  const [selectedInputRelay, setSelectedInputRelay] = useState('');
  const [editableShapeName, setEditableShapeName] = useState(''); // New state for shape name
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    if (open) {
      setSelectedOutputRelay(currentOutputRelayNo !== null && currentOutputRelayNo !== undefined ? String(currentOutputRelayNo) : '');
      setSelectedInputRelay(currentInputRelayNo !== null && currentInputRelayNo !== undefined ? String(currentInputRelayNo) : '');
      setEditableShapeName(currentShapeName || ''); // Initialize with current shape name
      setActiveTab(0);
    }
  }, [open, currentOutputRelayNo, currentInputRelayNo, currentShapeName]);

  const handleOutputRelayChipClick = (relayValue) => {
    setSelectedOutputRelay(relayValue);
  };

  const handleInputRelayChipClick = (relayValue) => {
    setSelectedInputRelay(relayValue);
  };

  const handleAssign = () => {
    onAssign(selectedOutputRelay, selectedInputRelay, editableShapeName); // Pass editableShapeName
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getIconForLogSource = (source) => {
    switch (source?.toLowerCase()) {
      case 'manual control':
        return <Power size={18} color={theme.palette.info.main} />;
      case 'automation rules':
        return <Zap size={18} color={theme.palette.primary.main} />;
      case 'schedules':
        return <HistoryIcon size={18} color={theme.palette.secondary.main} />;
      case 'device management':
        return <Settings2 size={18} color={theme.palette.warning.main} />;
      default:
        return <AlertTriangle size={18} color={theme.palette.text.secondary} />;
    }
  };

  const relayNumbers = useMemo(() => ['', ...Array.from({ length: 8 }, (_, i) => String(i + 1))], []);



  const relevantActivityLogs = useMemo(() => {
    const relayNoForLog = currentOutputRelayNo ?? currentInputRelayNo;
    if (relayNoForLog === null || relayNoForLog === undefined) return [];
    return allActivityLogs
      .filter(
        (log) =>
          (log.item_type === 'Device' && String(log.item_id) === String(relayNoForLog)) ||
          (log.item_type === 'SCADA Shape' && (String(log.item_id).includes(`R${relayNoForLog}`) || (log.details && log.details.toLowerCase().includes(`relay ${relayNoForLog}`)))) ||
          (log.details && log.details.toLowerCase().includes(`relay ${relayNoForLog}`))
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 20);
  }, [allActivityLogs, currentOutputRelayNo, currentInputRelayNo]);

  const renderRelayChips = (text, selectedValue, handleClick) => (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, p: 1, maxHeight: '180px', overflowY: 'auto', border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
      {relayNumbers.map((relay) => (
        <Chip
          key={relay || 'none'}
          label={relay === '' ? 'None' : `${text} ${relay}`}
          clickable
          onClick={() => handleClick(relay)}
          color={selectedValue === relay ? 'primary' : 'default'}
          variant={selectedValue === relay ? 'filled' : 'outlined'}
          size="small"
          deleteIcon={selectedValue === relay ? <XCircle size={16} /> : undefined}
          onDelete={selectedValue === relay ? () => handleClick('') : undefined}
          sx={{
            '&:hover': {
              backgroundColor: selectedValue === relay ? theme.palette.primary.dark : theme.palette.action.hover,
            },
            transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
          }}
        />
      ))}
    </Box>
  );

  return (
    <Dialog
      open={open}
      TransitionComponent={Grow}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          boxShadow: theme.shadows[5],
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', fontWeight: 'medium', pb: 0 }}>
        Shape Details & Relay Assignment
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 1 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="relay dialog tabs" variant="fullWidth">
            <Tab label="Assign Relays & Name" />
            <Tab label="Automations" />
            <Tab label="History" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={2}> {/* Changed spacing to 2 */}
            <Grid item xs={12}>
               <Typography variant="subtitle1" sx={{ mb: 0.5, fontWeight: 'medium', color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                <Edit2 size={18} style={{ marginRight: theme.spacing(1) }} />
                Shape Name
              </Typography>
              <TextField
                fullWidth
                label="Shape Name"
                size="small"
                value={editableShapeName}
                onChange={(e) => setEditableShapeName(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                <GitBranchPlus size={18} style={{ marginRight: theme.spacing(1) }} />
                Output Control Relay (1-8)
              </Typography>
              {renderRelayChips('Relay', selectedOutputRelay, handleOutputRelayChipClick)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium', color: 'text.primary', display: 'flex', alignItems: 'center' }}>
                <CornerDownLeft size={18} style={{ marginRight: theme.spacing(1) }} />
                Feedback Signal Source (1-8)
              </Typography>
              {renderRelayChips('Feedback',selectedInputRelay, handleInputRelayChipClick)}
            </Grid>
          </Grid>
        </TabPanel>


        <TabPanel value={activeTab} index={2}>
          {(currentOutputRelayNo === null || currentOutputRelayNo === undefined) && (currentInputRelayNo === null || currentInputRelayNo === undefined) ? (
            <Typography color="textSecondary" align="center">Assign an Output or Input Relay to view its history.</Typography>
          ) : relevantActivityLogs.length === 0 ? (
            <Typography color="textSecondary" align="center">No activity logs found for the assigned relays.</Typography>
          ) : (
            <List dense>
              {relevantActivityLogs.map((log) => (
                <Fragment key={log.id || `log-${log.timestamp}` /* Fallback key */}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: '36px', mt: 0.5 }}>
                      {getIconForLogSource(log.source)}
                    </ListItemIcon>
                    <ListItemText
                      primary={log.action || 'N/A'}
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color="text.primary">
                            {log.item_name || log.details || 'No details'}
                          </Typography>
                          <Typography component="span" variant="caption" display="block" color="text.secondary">
                            {new Date(log.timestamp).toLocaleString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" variant="inset" />
                </Fragment>
              ))}
            </List>
          )}
        </TabPanel>
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleCancel} variant="outlined" color="secondary" size="small">
          Cancel
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          color="primary"
          // disabled={activeTab !== 0} // Enable button always if name can be edited irrespective of relay assignment
          size="small"
        >
          Apply Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AssignRelayDialog;
