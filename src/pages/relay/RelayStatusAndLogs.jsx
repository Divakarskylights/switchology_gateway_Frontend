import React from "react";
import { Box, Paper, Typography, Grid, Chip, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import ScheduleIcon from '@mui/icons-material/Schedule';

const getRelayStatusColor = (mode) => {
  switch (mode) {
    case 'INPUT': return 'primary';
    case 'OUTPUT': return 'success';
    default: return 'default';
  }
};

const RelayStatusAndLogs = ({ configuredRelays, relayLogs }) => {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Relay Status
      </Typography>
      {configuredRelays.length === 0 ? (
        <Typography color="textSecondary">
          No relays configured. Use the configuration section above to set up relays.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {configuredRelays.map((relay) => (
            <Grid item xs={12} sm={6} md={4} key={relay.relayNumber}>
              <Box
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 2,
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Relay {relay.relayNumber}
                </Typography>
                <Chip
                  label={relay.mode}
                  color={getRelayStatusColor(relay.mode)}
                  size="small"
                  sx={{ mb: 1 }}
                />

                {relay.mode === "OUTPUT" && relay.scheduleEnabled && (
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography variant="body2" color="primary">
                        Scheduled
                      </Typography>
                    </Box>

                    <Typography variant="caption" display="block">
                      Type: {relay.scheduleType}
                    </Typography>

                    {relay.scheduleTimeOn && relay.scheduleTimeOff && (
                      <Typography variant="caption" display="block">
                        {relay.scheduleTimeOn} - {relay.scheduleTimeOff}
                      </Typography>
                    )}

                    {relay.scheduleType === "ONCE" && relay.scheduleDate && (
                      <Typography variant="caption" display="block">
                        Date: {relay.scheduleDate}
                      </Typography>
                    )}

                    {(relay.scheduleType === "WEEKLY" || relay.scheduleType === "CUSTOM_DAYS") && relay.scheduleDays && (
                      <Typography variant="caption" display="block">
                        Days: {relay.scheduleDays}
                      </Typography>
                    )}

                    {relay.scheduleType === "DAILY" && (
                      <Typography variant="caption" display="block">
                        Every day
                      </Typography>
                    )}
                  </Box>
                )}

                {relay.mode === "OUTPUT" && !relay.scheduleEnabled && (
                  <Typography variant="caption" color="textSecondary" display="block" sx={{ mt: 1 }}>
                    Manual control
                  </Typography>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Relay Logs (History) */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle1" gutterBottom>
          Relay Logs (History)
        </Typography>
        {relayLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No relay logs available.
          </Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Relay</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Message</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {relayLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.createdAt}</TableCell>
                  <TableCell>{log.relayId}</TableCell>
                  <TableCell>{log.status}</TableCell>
                  <TableCell>{log.mode}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell>{log.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Paper>
  );
};

export default RelayStatusAndLogs;
