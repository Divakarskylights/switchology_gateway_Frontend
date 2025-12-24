import React, { useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Card, 
  CardContent, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow,
  Chip,
  Divider
} from '@mui/material';
import { 
  Timeline, 
  AccessTime, 
  TrendingUp, 
  TrendingDown,
  PowerSettingsNew,
  Input,
  Settings
} from '@mui/icons-material';

const RelayStatistics = ({ relayLogs }) => {
  const statistics = useMemo(() => {
    if (!relayLogs.length) {
      return {
        totalEvents: 0,
        onEvents: 0,
        offEvents: 0,
        averageOnTime: 0,
        averageOffTime: 0,
        peakHour: 0,
        sourceStats: {},
        relayStats: {},
        stateChanges: {},
        timeBetweenStates: []
      };
    }

    const stats = {
      totalEvents: relayLogs.length,
      onEvents: 0,
      offEvents: 0,
      peakHour: 0,
      sourceStats: {},
      relayStats: {},
      stateChanges: {},
      timeBetweenStates: []
    };

    // Calculate basic statistics
    relayLogs.forEach(log => {
      // Count ON/OFF events
      if (log.status?.includes('→ true')) {
        stats.onEvents++;
      } else if (log.status?.includes('→ false')) {
        stats.offEvents++;
      }

      // Source statistics
      const source = log.source || 'Unknown';
      if (!stats.sourceStats[source]) {
        stats.sourceStats[source] = { total: 0, on: 0, off: 0, mode: log.mode || 'NONE' };
      }
      stats.sourceStats[source].total++;
      if (log.status?.includes('→ true')) {
        stats.sourceStats[source].on++;
      } else if (log.status?.includes('→ false')) {
        stats.sourceStats[source].off++;
      }

      // Relay statistics
      const relayId = log.relayId || 0;
      if (!stats.relayStats[relayId]) {
        stats.relayStats[relayId] = { total: 0, on: 0, off: 0, mode: log.mode || 'NONE' };
      }
      stats.relayStats[relayId].total++;
      if (log.status?.includes('→ true')) {
        stats.relayStats[relayId].on++;
      } else if (log.status?.includes('→ false')) {
        stats.relayStats[relayId].off++;
      }

      // Peak hour calculation
      if (log.createdAt) {
        const hour = new Date(log.createdAt).getHours();
        stats.peakHour = Math.max(stats.peakHour, hour);
      }
    });

    // Calculate time between state changes
    const sortedLogs = [...relayLogs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const timeDifferences = [];
    
    for (let i = 1; i < sortedLogs.length; i++) {
      const prevLog = sortedLogs[i - 1];
      const currLog = sortedLogs[i];
      
      if (prevLog.relayId === currLog.relayId) {
        const timeDiff = new Date(currLog.createdAt) - new Date(prevLog.createdAt);
        timeDifferences.push({
          relayId: prevLog.relayId,
          fromState: prevLog.status,
          toState: currLog.status,
          timeDiff: timeDiff,
          timeDiffMinutes: Math.round(timeDiff / (1000 * 60))
        });
      }
    }

    stats.timeBetweenStates = timeDifferences;
    
    // Calculate average time between states
    if (timeDifferences.length > 0) {
      stats.averageTimeBetweenStates = timeDifferences.reduce((sum, diff) => sum + diff.timeDiffMinutes, 0) / timeDifferences.length;
    } else {
      stats.averageTimeBetweenStates = 0;
    }

    return stats;
  }, [relayLogs]);

  const getRelayIcon = (mode) => {
    switch (mode) {
      case 'OUTPUT': return <PowerSettingsNew />;
      case 'INPUT': return <Input />;
      default: return <Settings />;
    }
  };

  const getStatusColor = (status) => {
    if (status?.includes('→ true')) return 'success';
    if (status?.includes('→ false')) return 'error';
    return 'default';
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relay Statistics & Analysis
      </Typography>

      {/* Overview Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Timeline color="primary" />
                <Box>
                  <Typography variant="h4">{statistics.totalEvents}</Typography>
                  <Typography variant="body2" color="text.secondary">Total Events</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp color="success" />
                <Box>
                  <Typography variant="h4">{statistics.onEvents}</Typography>
                  <Typography variant="body2" color="text.secondary">ON Events</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingDown color="error" />
                <Box>
                  <Typography variant="h4">{statistics.offEvents}</Typography>
                  <Typography variant="body2" color="text.secondary">OFF Events</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime color="warning" />
                <Box>
                  <Typography variant="h4">{statistics.peakHour}:00</Typography>
                  <Typography variant="body2" color="text.secondary">Peak Hour</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Source-wise Statistics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Source-wise Statistics
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Source</TableCell>
              <TableCell align="center">Mode</TableCell>
              <TableCell align="center">Total Events</TableCell>
              <TableCell align="center">ON Events</TableCell>
              <TableCell align="center">OFF Events</TableCell>
              <TableCell align="center">ON Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.entries(statistics.sourceStats).map(([source, data]) => (
              <TableRow key={source}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getRelayIcon(data.mode)}
                    {source}
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <Chip
                    label={data.mode}
                    color={data.mode === 'OUTPUT' ? 'success' : data.mode === 'INPUT' ? 'primary' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">{data.total}</TableCell>
                <TableCell align="center">
                  <Typography color="success.main">{data.on}</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography color="error.main">{data.off}</Typography>
                </TableCell>
                <TableCell align="center">
                  {data.total > 0 ? `${((data.on / data.total) * 100).toFixed(1)}%` : '0%'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Relay-wise Statistics */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Relay-wise Statistics
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(statistics.relayStats).map(([relayId, data]) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={relayId}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    {getRelayIcon(data.mode)}
                    <Typography variant="h6">Relay {relayId}</Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Mode: <Chip label={data.mode} size="small" variant="outlined" />
                  </Typography>
                  <Typography variant="body2">
                    Total: <strong>{data.total}</strong>
                  </Typography>
                  <Typography variant="body2">
                    ON: <Typography component="span" color="success.main">{data.on}</Typography>
                  </Typography>
                  <Typography variant="body2">
                    OFF: <Typography component="span" color="error.main">{data.off}</Typography>
                  </Typography>
                  <Typography variant="body2">
                    Activity: <strong>{data.total > 0 ? ((data.on / data.total) * 100).toFixed(1) : 0}% ON</strong>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Time Between State Changes */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Time Between State Changes
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Average time between state changes: <strong>{statistics.averageTimeBetweenStates.toFixed(1)} minutes</strong>
          </Typography>
        </Box>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Relay</TableCell>
              <TableCell>From State</TableCell>
              <TableCell>To State</TableCell>
              <TableCell align="center">Time Difference</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {statistics.timeBetweenStates.slice(0, 20).map((diff, index) => (
              <TableRow key={index}>
                <TableCell>Relay {diff.relayId}</TableCell>
                <TableCell>
                  <Chip
                    label={diff.fromState}
                    color={getStatusColor(diff.fromState)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={diff.toState}
                    color={getStatusColor(diff.toState)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="center">
                  {diff.timeDiffMinutes} minutes
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        {statistics.timeBetweenStates.length > 20 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            Showing first 20 state changes. Total: {statistics.timeBetweenStates.length} changes
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RelayStatistics;
