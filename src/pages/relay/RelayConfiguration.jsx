import React from "react";
import {
  Box,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  TextField,
} from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SettingsIcon from '@mui/icons-material/Settings';
import IOSSwitch from "./RelayIOSSwitch";

const RelayConfiguration = ({
  relayNumbers,
  relayModes,
  relaySchedules,
  handleModeChange,
  handleScheduleChange,
  handleScheduleDaysChange,
  handleSave,
  saving,
  setupExpanded,
  setSetupExpanded,
  SCHEDULE_TYPES,
  DAYS_OF_WEEK,
}) => {
  return (
    <Accordion
      expanded={setupExpanded}
      onChange={() => setSetupExpanded(!setupExpanded)}
      sx={{ mb: 2 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon />
          <Typography variant="h6">Relay Configuration</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Paper
          sx={{
            p: 2,
            bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.paper' : '#fafafa',
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                Relay Configuration
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure mode and scheduling for each relay. OUTPUT relays can be scheduled.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Configuration"}
            </Button>
          </Box>

          <Grid container spacing={1}>
            {relayNumbers.map((num) => {
              const mode = relayModes[num] || "NONE";
              const schedule = relaySchedules[num] || {};
              const isOutput = mode === "OUTPUT";

              return (
                <Grid item xs={12} sm={6} md={4} key={num}>
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: 1,
                      borderColor: 'divider',
                      p: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                      height: '100%',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Relay {num}
                      </Typography>
                      <Chip
                        label={mode}
                        size="small"
                        color={mode === 'OUTPUT' ? 'success' : mode === 'INPUT' ? 'primary' : 'default'}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Mode
                        </Typography>
                        <Select
                          fullWidth
                          size="small"
                          value={mode}
                          onChange={(e) => handleModeChange(num, e.target.value)}
                          sx={{ mt: 0.5 }}
                        >
                          {['NONE', 'INPUT', 'OUTPUT'].map((m) => (
                            <MenuItem key={m} value={m}>
                              {m}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Scheduling {schedule.enabled && isOutput ? 'Enabled' : 'Disabled'}
                        </Typography>
                        <FormControlLabel
                          sx={{ m: 0 }}
                          control={
                            <IOSSwitch
                              checked={schedule.enabled || false}
                              disabled={!isOutput}
                              onChange={(e) => handleScheduleChange(num, 'enabled', e.target.checked)}
                            />
                          }
                        />
                      </Box>

                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Schedule Type
                        </Typography>
                        <Select
                          fullWidth
                          size="small"
                          value={schedule.type || "NONE"}
                          disabled={!isOutput || !schedule.enabled}
                          onChange={(e) => handleScheduleChange(num, 'type', e.target.value)}
                          sx={{ mt: 0.5 }}
                        >
                          {SCHEDULE_TYPES.map((type) => (
                            <MenuItem key={type} value={type}>
                              {type}
                            </MenuItem>
                          ))}
                        </Select>
                      </Box>

                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1,
                          borderRadius: 2,
                          bgcolor: 'action.hover',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                        }}
                      >
                        {/* ON / OFF Time */}
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 1,
                            flexDirection: 'column',
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              ON Time
                            </Typography>
                            <TextField
                              type="time"
                              size="small"
                              value={schedule.timeOn || ""}
                              disabled={!isOutput || !schedule.enabled || schedule.type === "NONE"}
                              onChange={(e) => handleScheduleChange(num, 'timeOn', e.target.value)}
                              fullWidth
                              sx={{ mt: 0.5 }}
                              InputProps={{
                                endAdornment: schedule.timeOn && (
                                  <Box
                                    component="button"
                                    onClick={() => handleScheduleChange(num, 'timeOn', '')}
                                    sx={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      p: 0.5,
                                      '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                  >
                                    ×
                                  </Box>
                                )
                              }}
                            />
                          </Box>

                          <Box sx={{ flex: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              OFF Time
                            </Typography>
                            <TextField
                              type="time"
                              size="small"
                              value={schedule.timeOff || ""}
                              disabled={!isOutput || !schedule.enabled || schedule.type === "NONE"}
                              onChange={(e) => handleScheduleChange(num, 'timeOff', e.target.value)}
                              fullWidth
                              sx={{ mt: 0.5 }}
                              InputProps={{
                                endAdornment: schedule.timeOff && (
                                  <Box
                                    component="button"
                                    onClick={() => handleScheduleChange(num, 'timeOff', '')}
                                    sx={{
                                      background: 'none',
                                      border: 'none',
                                      cursor: 'pointer',
                                      p: 0.5,
                                      '&:hover': { backgroundColor: 'action.hover' }
                                    }}
                                  >
                                    ×
                                  </Box>
                                )
                              }}
                            />
                          </Box>
                        </Box>

                        <Box>
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            Days / Date
                          </Typography>

                          {isOutput && schedule.enabled && schedule.type === "ONCE" && (
                            <TextField
                              type="date"
                              size="small"
                              value={schedule.date || ""}
                              onChange={(e) => handleScheduleChange(num, 'date', e.target.value)}
                              fullWidth
                            />
                          )}

                          {isOutput && schedule.enabled && (schedule.type === "WEEKLY" || schedule.type === "CUSTOM_DAYS") && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                              {DAYS_OF_WEEK.map((day) => {
                                const currentDays = schedule.days ? schedule.days.split(',') : [];
                                return (
                                  <Chip
                                    key={day}
                                    label={day}
                                    size="small"
                                    clickable
                                    color={currentDays.includes(day) ? "primary" : "default"}
                                    onClick={() => handleScheduleDaysChange(num, day, !currentDays.includes(day))}
                                  />
                                );
                              })}
                            </Box>
                          )}

                          {isOutput && schedule.enabled && schedule.type === "DAILY" && (
                            <Typography variant="body2" color="text.secondary">
                              Every day
                            </Typography>
                          )}

                          {(!isOutput || !schedule.enabled || schedule.type === "NONE") && (
                            <Typography variant="caption" color="text.disabled">
                              No schedule configured
                            </Typography>
                          )}
                        </Box>
                      </Box>

                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      </AccordionDetails>
    </Accordion>
  );
};

export default RelayConfiguration;
