import React, { useEffect, useMemo, useState } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { toast } from "react-toastify";
import { TOAST_IDS } from "../../constants/toastIds";
import { graphqlClient } from "../../services/client";
import { GET_RELAY_SETUP, CREATE_RELAY_SETUP, UPDATE_RELAY_SETUP, GET_RELAY_LOGS } from "../../services/query";
import { configInit } from "../../components/layout/globalvariable";
import RelayConfiguration from "./RelayConfiguration";
import RelayInstantControl from "./RelayInstantControl";
import RelayStatusAndLogs from "./RelayStatusAndLogs";
import SetupPasswordDialog from "../../features/setup/components/SetupPasswordDialog";
import RelayConfigWarningDialog from "./RelayConfigWarningDialog";
import useAdminPasswordStore from "../../redux/store/useAdminPasswordStore";

const RELAY_COUNT = 13;
const MODES = ["NONE", "INPUT", "OUTPUT"];
const SCHEDULE_TYPES = ["NONE", "ONCE", "DAILY", "WEEKLY", "CUSTOM_DAYS"];
const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// Basic Auth credentials for /v3/ endpoints
const API_USERNAME = "admin";
const API_PASSWORD = "admin";

const getBasicAuthHeader = () => {
  const credentials = `${API_USERNAME}:${API_PASSWORD}`;
  const encoded = btoa(credentials);
  return `Basic ${encoded}`;
};

const RelaySetupPage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [relayModes, setRelayModes] = useState({}); // { 1: "INPUT", ... }
  const [relaySchedules, setRelaySchedules] = useState({}); // { 1: { enabled: true, type: "DAILY", ... }, ... }
  const [configuredRelays, setConfiguredRelays] = useState([]);
  const [relayLogs, setRelayLogs] = useState([]);
  const [relayInstantStates, setRelayInstantStates] = useState({}); // { relayNumber: true/false }
  const [setupExpanded, setSetupExpanded] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [pendingRelayToggle, setPendingRelayToggle] = useState(null); // { relayNumber, nextState }
  const [configWarningOpen, setConfigWarningOpen] = useState(false);
  const { adminPassword, fetchAdminPassword } = useAdminPasswordStore();

  const relayNumbers = useMemo(
    () => Array.from({ length: RELAY_COUNT }, (_, i) => i + 1),
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch admin password first
        await fetchAdminPassword();
        
        // Fetch existing relay setup
        const setupResponse = await graphqlClient.request(GET_RELAY_SETUP);
        const nodes = setupResponse?.allRelaysetups?.nodes || [];
        const initialModes = {};
        const configured = [];

        const initialSchedules = {};

        nodes.forEach((n) => {
          if (n.relayNumber >= 1 && n.relayNumber <= RELAY_COUNT) {
            initialModes[n.relayNumber] = n.mode || "NONE";
            initialSchedules[n.relayNumber] = {
              enabled: n.scheduleEnabled || false,
              type: n.scheduleType || "NONE",
              timeOn: n.scheduleTimeOn || "",
              timeOff: n.scheduleTimeOff || "",
              days: n.scheduleDays || "",
              date: n.scheduleDate || ""
            };
            configured.push(n);
          }
        });

        setRelayModes(initialModes);
        setRelaySchedules(initialSchedules);
        setConfiguredRelays(configured);

        // Fetch relay logs history
        try {
          const logsResponse = await graphqlClient.request(GET_RELAY_LOGS);
          const logNodes = logsResponse?.allRelayLogs?.nodes || [];

          const mappedLogs = logNodes.map((log) => ({
            id: log.id,
            createdAt: log.createdAt,
            relayId: log.relayNumber,
            status: `${log.previousState} → ${log.newState}`,
            mode: log.source,
            source: log.source,
            message: log.details,
          }));

          setRelayLogs(mappedLogs);
        } catch (logError) {
          console.error("Error loading relay logs:", logError);
        }

        // Auto-collapse setup if relays are configured, expand if none
        setSetupExpanded(configured.length === 0);
      } catch (error) {
        console.error("Error loading relay setup:", error);
        toast.error("Failed to load relay setup", { toastId: TOAST_IDS.RELAY_UPDATE });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchInstantStates = async () => {
      try {
        const states = {};
        const outputRelays = configuredRelays.filter((relay) => relay.mode === "OUTPUT");

        for (const relay of outputRelays) {
          try {
            const res = await fetch(`${configInit.appBaseUrl}/v3/relay/${relay.relayNumber}`, {
              headers: {
                'Authorization': getBasicAuthHeader(),
              },
            });
            if (!res.ok) {
              continue;
            }

            const data = await res.json();
            // Assuming API returns { state: true/false }
            states[relay.relayNumber] = !!data.state;
          } catch (e) {
            console.error(`Failed to fetch state for relay ${relay.relayNumber}:`, e);
          }
        }

        setRelayInstantStates(states);
      } catch (error) {
        console.error("Failed to load relay instant states:", error);
      }
    };

    if (configuredRelays.length > 0) {
      fetchInstantStates();
    }
  }, [configuredRelays]);


  const handleModeChange = (relayNumber, mode) => {
    setRelayModes((prev) => ({ ...prev, [relayNumber]: mode }));

    // Reset scheduling if mode is not OUTPUT
    if (mode !== "OUTPUT") {
      setRelaySchedules(prev => ({
        ...prev,
        [relayNumber]: {
          enabled: false,
          type: "NONE",
          timeOn: "",
          timeOff: "",
          days: "",
          date: ""
        }
      }));
    }
  };

  const handleScheduleChange = (relayNumber, field, value) => {
    setRelaySchedules(prev => ({
      ...prev,
      [relayNumber]: {
        ...prev[relayNumber],
        [field]: value
      }
    }));
  };

  const handleScheduleDaysChange = (relayNumber, day, checked) => {
    const currentSchedule = relaySchedules[relayNumber] || {};
    const currentDays = currentSchedule.days ? currentSchedule.days.split(',') : [];

    let newDays;
    if (checked) {
      newDays = [...currentDays, day];
    } else {
      newDays = currentDays.filter(d => d !== day);
    }

    handleScheduleChange(relayNumber, 'days', newDays.join(','));
  };

  const handleInstantToggle = (relayNumber, nextState) => {
    // Store the pending toggle and show password dialog
    setPendingRelayToggle({ relayNumber, nextState });
    setCurrentAction('toggle');
    setPasswordDialogOpen(true);
  };

  const executeInstantToggle = async (relayNumber, nextState) => {
    // Optimistic UI update
    setRelayInstantStates(prev => ({
      ...prev,
      [relayNumber]: nextState,
    }));

    try {
      const response = await fetch(`${configInit.appBaseUrl}/v3/relay/${relayNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': getBasicAuthHeader(),
        },
        body: JSON.stringify({ state: nextState }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to toggle relay instantly:', error);
      toast.error('Failed to update relay state', { toastId: TOAST_IDS.RELAY_TOGGLE });

      // Revert UI state on failure
      setRelayInstantStates(prev => ({
        ...prev,
        [relayNumber]: !nextState,
      }));
    }
  };

  const handleSave = () => {
    setCurrentAction('save');
    setPasswordDialogOpen(true);
  };

  const handleSetupExpansion = () => {
    if (!setupExpanded) {
      // Show warning before allowing expansion
      setConfigWarningOpen(true);
    } else {
      setSetupExpanded(false);
    }
  };

  const confirmConfigExpansion = () => {
    setConfigWarningOpen(false);
    setSetupExpanded(true);
  };

  const handleSetupRelay = (relayNumber) => {
    // Show warning dialog first, then expand configuration
    if (!setupExpanded) {
      setConfigWarningOpen(true);
    }
  };

  const handlePasswordConfirm = async (enteredPassword) => {
    try {
      if (enteredPassword === adminPassword) {
        if (currentAction === 'save') {
          setSaving(true);
          setPasswordDialogOpen(false);
          setCurrentAction(null);

          // Get existing relay setup to determine which ones to create vs update
          const setupResponse = await graphqlClient.request(GET_RELAY_SETUP);
          const existingRelays = setupResponse?.allRelaysetups?.nodes || [];
          const existingRelayNumbers = new Set(existingRelays.map(r => r.relayNumber));

          // Process each relay configuration
          for (const relayNumber of relayNumbers) {
            const mode = relayModes[relayNumber] || "NONE";
            const schedule = relaySchedules[relayNumber] || {};

            const scheduleData = {
              scheduleEnabled: schedule.enabled || false,
              scheduleType: schedule.type || "NONE",
              scheduleTimeOn: schedule.timeOn || null,
              scheduleTimeOff: schedule.timeOff || null,
              scheduleDays: schedule.days || null,
              scheduleDate: schedule.date || null
            };

            if (existingRelayNumbers.has(relayNumber)) {
              // Update existing relay
              const existingRelay = existingRelays.find(r => r.relayNumber === relayNumber);
              if (existingRelay) {
                const needsUpdate =
                  existingRelay.mode !== mode ||
                  existingRelay.scheduleEnabled !== scheduleData.scheduleEnabled ||
                  existingRelay.scheduleType !== scheduleData.scheduleType ||
                  existingRelay.scheduleTimeOn !== scheduleData.scheduleTimeOn ||
                  existingRelay.scheduleTimeOff !== scheduleData.scheduleTimeOff ||
                  existingRelay.scheduleDays !== scheduleData.scheduleDays ||
                  existingRelay.scheduleDate !== scheduleData.scheduleDate;

                if (needsUpdate) {
                  await graphqlClient.request(UPDATE_RELAY_SETUP, {
                    input: {
                      id: existingRelay.id,
                      relaysetupPatch: {
                        mode: mode,
                        ...scheduleData
                      }
                    }
                  });
                }
              }
            } else {
              // Create new relay - let database handle ID
              await graphqlClient.request(CREATE_RELAY_SETUP, {
                input: {
                  relaysetup: {
                    id: relayNumber,
                    relayNumber: relayNumber,
                    name: `Relay ${relayNumber}`,
                    mode: mode,
                    ...scheduleData
                  }
                }
              });
            }
          }

          toast.success("Relay setup saved successfully", { toastId: TOAST_IDS.RELAY_UPDATE });

          // Refresh data after save
          const refreshResponse = await graphqlClient.request(GET_RELAY_SETUP);
          const refreshNodes = refreshResponse?.allRelaysetups?.nodes || [];
          const configured = refreshNodes.filter(n => n.relayNumber >= 1 && n.relayNumber <= RELAY_COUNT);
          setConfiguredRelays(configured);

          // Auto-collapse setup after successful save if relays are now configured
          if (configured.length > 0) {
            setSetupExpanded(false);
          }
        } else if (currentAction === 'toggle' && pendingRelayToggle) {
          // Execute the pending relay toggle
          await executeInstantToggle(pendingRelayToggle.relayNumber, pendingRelayToggle.nextState);
          setPendingRelayToggle(null);
        }
      } else {
        toast.error('Incorrect password', { toastId: TOAST_IDS.GENERIC_ERROR });
      }
      setPasswordDialogOpen(false);
      setCurrentAction(null);
    } catch (error) {
      console.error("Error saving relay setup:", error);
      toast.error("Failed to save relay setup", { toastId: TOAST_IDS.RELAY_UPDATE });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Relays
      </Typography>

      {/* Relay Setup Accordion */}
      <RelayConfiguration
        relayNumbers={relayNumbers}
        relayModes={relayModes}
        relaySchedules={relaySchedules}
        handleModeChange={handleModeChange}
        handleScheduleChange={handleScheduleChange}
        handleScheduleDaysChange={handleScheduleDaysChange}
        handleSave={handleSave}
        saving={saving}
        setupExpanded={setupExpanded}
        setSetupExpanded={handleSetupExpansion}
        SCHEDULE_TYPES={SCHEDULE_TYPES}
        DAYS_OF_WEEK={DAYS_OF_WEEK}
      />

      {/* Relay Instant Control */}
      <RelayInstantControl
        configuredRelays={configuredRelays}
        relayInstantStates={relayInstantStates}
        handleInstantToggle={handleInstantToggle}
      />

      {/* Relay Status + Logs */}
      <RelayStatusAndLogs
        configuredRelays={configuredRelays}
        relayLogs={relayLogs}
        onSetupRelay={handleSetupRelay}
      />

      {/* Password Dialog */}
      <SetupPasswordDialog
        open={passwordDialogOpen}
        onClose={() => {
          setPasswordDialogOpen(false);
          setCurrentAction(null);
          setPendingRelayToggle(null);
        }}
        onConfirm={handlePasswordConfirm}
        dialogType={currentAction}
        actionDescription={
          currentAction === 'toggle' 
            ? `Please enter your admin password to toggle Relay ${pendingRelayToggle?.relayNumber}.`
            : 'Please enter your admin password to save the relay configuration.'
        }
      />

      {/* Configuration Warning Dialog */}
      <RelayConfigWarningDialog
        open={configWarningOpen}
        onClose={() => setConfigWarningOpen(false)}
        onConfirm={confirmConfigExpansion}
      />
    </Box>
  );
};

export default RelaySetupPage;