import React from 'react';
import { Box, Typography, Grid, Chip, Paper, Avatar, Divider, LinearProgress } from '@mui/material';
import { 
  PowerSettingsNew, 
  Input, 
  Schedule, 
  Settings, 
  AddCircleOutline,
  CheckCircle,
  RadioButtonUnchecked
} from '@mui/icons-material';

const RelayStatusDisplay = ({ configuredRelays, onSetupRelay }) => {
  const allRelayNumbers = Array.from({ length: 13 }, (_, i) => i + 1);
  
  // Only count relays that are actually configured (INPUT or OUTPUT mode, not NONE)
  const actuallyConfiguredRelays = configuredRelays.filter(relay => 
    relay.mode && relay.mode !== 'NONE'
  );
  const configuredRelayNumbers = actuallyConfiguredRelays.map(r => r.relayNumber);
  const unconfiguredRelays = allRelayNumbers.filter(num => !configuredRelayNumbers.includes(num));

  const getRelayIcon = (mode) => {
    switch (mode) {
      case 'OUTPUT': return <PowerSettingsNew />;
      case 'INPUT': return <Input />;
      default: return <Settings />;
    }
  };

  const getRelayColor = (mode) => {
    switch (mode) {
      case 'OUTPUT': return 'success';
      case 'INPUT': return 'primary';
      default: return 'default';
    }
  };

  const getProgressValue = () => {
    return (actuallyConfiguredRelays.length / 13) * 100;
  };

  return (
    <Box>
      {/* Progress Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Configuration Progress
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {actuallyConfiguredRelays.length} of 13 relays configured
          </Typography>
        </Box>
        <LinearProgress 
          variant="determinate" 
          value={getProgressValue()} 
          sx={{ 
            height: 8, 
            borderRadius: 4,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              borderRadius: 4,
              bgcolor: 'primary.main'
            }
          }}
        />
      </Box>

      {/* Configured Relays */}
      {actuallyConfiguredRelays.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle color="success" fontSize="small" />
            Active Relays
          </Typography>
          
          <Grid container spacing={2}>
            {actuallyConfiguredRelays.map((relay) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={relay.relayNumber}>
                <Paper
                  sx={{
                    p: 2,
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: getRelayColor(relay.mode) === 'default' ? 'grey.500' : `${getRelayColor(relay.mode)}.main`
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: getRelayColor(relay.mode) === 'default' ? 'grey.500' : `${getRelayColor(relay.mode)}.main`,
                        width: 40,
                        height: 40,
                        mr: 2
                      }}
                    >
                      {getRelayIcon(relay.mode)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                        Relay {relay.relayNumber}
                      </Typography>
                      <Chip
                        label={relay.mode}
                        color={getRelayColor(relay.mode)}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  </Box>

                  {relay.mode === "OUTPUT" && relay.scheduleEnabled && (
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Schedule fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          Scheduled
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Type: <strong>{relay.scheduleType}</strong>
                      </Typography>
                      {relay.scheduleTimeOn && relay.scheduleTimeOff && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          {relay.scheduleTimeOn} → {relay.scheduleTimeOff}
                        </Typography>
                      )}
                    </Box>
                  )}

                  {relay.mode === "OUTPUT" && !relay.scheduleEnabled && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Manual control
                    </Typography>
                  )}

                  {relay.mode === "INPUT" && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                      Input monitoring active
                    </Typography>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Unconfigured Relays */}
      {unconfiguredRelays.length > 0 && (
        <Box>
          <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AddCircleOutline color="action" fontSize="small" />
            Available for Setup ({unconfiguredRelays.length} remaining)
          </Typography>
          
          <Paper sx={{ p: 3, bgcolor: 'grey.50', border: '1px dashed', borderColor: 'grey.300' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              These relays are ready to be configured:
            </Typography>
            
            <Grid container spacing={1}>
              {unconfiguredRelays.map((relayNum) => (
                <Grid item key={relayNum}>
                  <Paper
                    onClick={() => onSetupRelay && onSetupRelay(relayNum)}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      border: '1px solid',
                      borderColor: 'grey.200',
                      bgcolor: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: 'primary.main',
                        transform: 'scale(1.05)',
                        boxShadow: 1
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RadioButtonUnchecked fontSize="small" color="action" />
                      <Typography variant="body2" fontWeight="medium">
                        Relay {relayNum}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary" align="center" sx={{ display: 'block' }}>
              Configure these relays using the configuration panel above
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Empty State */}
      {configuredRelays.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
          <Avatar sx={{ bgcolor: 'grey.300', mx: 'auto', mb: 2, width: 60, height: 60 }}>
            <Settings sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Relays Configured
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Start by configuring your first relay using the configuration panel above
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={0} 
            sx={{ 
              height: 6, 
              borderRadius: 3,
              bgcolor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3
              }
            }}
          />
        </Paper>
      )}
    </Box>
  );
};

export default RelayStatusDisplay;
