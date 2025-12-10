import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";
import IOSSwitch from "./RelayIOSSwitch";

const RelayInstantControl = ({ configuredRelays, relayInstantStates, handleInstantToggle }) => {
  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        Relay Instant Control
      </Typography>
      {configuredRelays.length === 0 ? (
        <Typography color="textSecondary">
          No relays configured. Use the configuration section above to set up relays.
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {configuredRelays
            .filter((relay) => relay.mode === "OUTPUT")
            .map((relay) => {
              const isOn = !!relayInstantStates[relay.relayNumber];

              return (
                <Grid item xs={12} sm={6} md={4} key={relay.relayNumber}>
                  <Box
                    sx={{
                      border: 1,
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 2,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2">
                        Relay {relay.relayNumber}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Instant ON / OFF
                      </Typography>
                    </Box>
                    <IOSSwitch
                      checked={isOn}
                      onChange={(e) => handleInstantToggle(relay.relayNumber, e.target.checked)}
                    />
                  </Box>
                </Grid>
              );
            })}
        </Grid>
      )}
    </Paper>
  );
};

export default RelayInstantControl;
