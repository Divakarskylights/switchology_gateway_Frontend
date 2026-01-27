import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Box, Button, Chip, CircularProgress, TextField, Typography, Fade, Paper, Backdrop } from '@mui/material';
import { TOAST_IDS } from '../../constants/toastIds';
import MeterJsonEditorDialog, { insertMeterJsonData } from '../../features/setup/components/MeterJsonEditorDialog';
import { graphqlClient } from '../../services/client';
import {
  DELETE_METER_INFO, INSERT_METER_INFO, UPDATE_METER_INFO,
UPDATE_METER_INTERVAL,
} from '../../services/query';
import meterOptions from '../../config/meters.json';
import SetupPasswordDialog from '../../features/setup/components/SetupPasswordDialog';
import { MeterDetails } from '../../features/setup/components/SetupMeterDetails';
import { AddMeterDialog } from '../../features/setup/components/SetUpAddMeterDialog';
import ConfirmDeleteDialog from '../../components/common/confirmDeleteMeter';
import MeterChip from '../../features/setup/components/meterChips';
import useAdminPasswordStore from '../../redux/store/useAdminPasswordStore';
import { controlDocker } from '../../components/layout/controlDocker';
import generateJsonConfig from '../../features/setup/components/GenerateJsonConfig';
import { configInit } from '../../components/layout/globalvariable';
import { getMeterRegisters } from '../../features/communicationSetup/services/communicationApi';

const SetupPage = () => {
  // const [gatewayToken, setGatewayToken] = useState(localStorage.getItem('accessToken') || '');
  const [loading, setLoading] = useState(true);
  const [meterConfigurations, setMeterConfigurations] = useState([]);
  const [expandedMeterIndex, setExpandedMeterIndex] = useState(null);
  const [isAddDialog, setIsAddDialog] = useState(false);
  const [testResponse, setTestResponse] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [loaderPercentage, setLoaderPercentage] = useState(0);
  const [currentJsonConfig, setCurrentJsonConfig] = useState({});
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [isEditingInterval, setIsEditingInterval] = useState(false);
  const [intervalVal, setIntervalVal] = useState(10); // State for global interval
  const [dbPassword, setDbPassword] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [liveStatuses, setLiveStatuses] = useState({});
  const [saving, setSaving] = useState(false);
  const [dockerLoading, setDockerLoading] = useState(false);
  const [editorInstance, setEditorInstance] = useState(null);
  const [jsonDialogOpen, setJsonDialogOpen] = useState(false);
  const [jsonString, setJsonString] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [defaultJsonConfig, setDefaultJsonConfig] = useState(null);

  const initialMeterConfig = {
    meter_type: "",
    meter_name: "",
    meter_no: 2,
    meter_model: "",
    meter_make: "",
    label: "",
    device: configInit.gatewayName,
    con: { baudRate: 9600, dataBits: 8, stopBits: 1, parity: 'even', lock: false },
  };

  const handleSaveParameters = async (slaveId, updatedConfig, selectedMask = []) => {
    try {
      // Always fetch latest config from backend to ensure unchecked rows remain unchanged
      const latestUrl = `${configInit.appBaseUrl}/api/meter-registers?slave_id=${encodeURIComponent(slaveId)}&limit=1`;
      const latestRes = await fetch(latestUrl);
      let latestConfig = null;
      if (latestRes.ok) {
        const latestJson = await latestRes.json();
        const latestRow = Array.isArray(latestJson) ? latestJson[0] : Array.isArray(latestJson?.data) ? latestJson.data[0] : null;
        const cfg = latestRow?.config;
        try { latestConfig = cfg ? (typeof cfg === 'string' ? JSON.parse(cfg) : cfg) : null; } catch { latestConfig = null; }
      }
      const currentBase = latestConfig || (updatedConfig && typeof updatedConfig === 'object' ? { ...updatedConfig, parameters: Array.isArray(updatedConfig.parameters) ? [...updatedConfig.parameters] : [] } : { parameters: [] });

      const edited = updatedConfig?.parameters || [];
      const original = currentBase?.parameters || [];
      // Build lookup of edited rows by name along with selection state
      const editedByName = new Map();
      edited.forEach((row, i) => {
        const name = row?.name;
        if (typeof name === 'string' && name.length) {
          editedByName.set(name, { row, selected: !!selectedMask[i] });
        }
      });

      // Merge rows, setting active flag based on selection; use name-based merge when available
      const mergedParams = original.map((origRow, idx) => {
        const name = origRow?.name;
        const info = (typeof name === 'string' && name.length) ? editedByName.get(name) : undefined;
        if (info) {
          const nextRow = info.selected ? (info.row ?? origRow) : origRow;
          return { ...nextRow, active: info.selected };
        }
        const selected = !!selectedMask[idx];
        const nextRow = selected ? (edited[idx] ?? origRow) : origRow;
        return { ...nextRow, active: selected };
      });
      const finalConfig = { ...currentBase, parameters: mergedParams };

      const url = `${configInit.appBaseUrl}/api/meter-registers/by-slave/${encodeURIComponent(slaveId)}/config`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalTime: Number(intervalVal) || 10, config: finalConfig }),
      });
      if (!res.ok) {
        let text = '';
        try { text = await res.text(); } catch {}
        throw new Error(`Save failed (${res.status}) ${text}`.trim());
      }
      // Update UI state optimistically
      setMeterConfigurations(prev => Array.isArray(prev) ? prev.map(m => (
        m?.meter_no === slaveId ? { ...m, config: finalConfig } : m
      )) : prev);
      toast.success('Parameters saved');
      await fetchMeters();
    } catch (e) {
      console.error('Update meter config failed:', e);
      toast.error(e.message || 'Failed to save parameters');
      throw e;
    }
  };
  const [newMeterConfig, setNewMeterConfig] = useState(initialMeterConfig);
  const [editingMeterConfig, setEditingMeterConfig] = useState(null);
  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);


  // Handle JSON changes from Monaco Editor
  const handleEditorChange = (value) => {
    setJsonString(value || '');
    try {
      const parsedJson = JSON.parse(value || '{}');
      setCurrentJsonConfig(parsedJson);
      setUnsavedChanges(true);
      setJsonError(null);
    } catch (error) {
      setJsonError(error.message);
    }
  };



  // Keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    if (!editorInstance || !window.monaco) return;
    const disposable = editorInstance.addCommand(
      window.monaco.KeyMod.CtrlCmd | window.monaco.KeyCode.KeyS,
      () => {
        toast.success('Saved (Ctrl+S)');
      }
    );
    return () => {
      disposable && disposable.dispose && disposable.dispose();
    };
  }, [editorInstance]);

  useEffect(() => {
    setLoaded(true);
    const fetchProfile = async () => {
      try {
        // const data = await graphqlClient.request(GET_PROFILE_DATA)
        await useAdminPasswordStore.getState().fetchAdminPassword();
        const adminPassword = useAdminPasswordStore.getState().adminPassword;
        console.log(adminPassword);
        if (adminPassword) {
          setDbPassword(adminPassword || '');
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        toast.error("Failed to fetch profile data.");
      }
    };
    fetchMeters();
    fetchProfile();
    setLoading(true);
  }, []);

  const fetchMeters = async () => {
    try {
      const res = await getMeterRegisters({ limit: 500 });
      console.log("meterRegisters", res);
      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : [];

      // Group rows by meter (make, model, slave_id)
      const meterMap = new Map();
      rows.forEach((row) => {
        const make = row.meter_make || row.make || '';
        const model = row.meter_model || row.model || '';
        const slaveId = row.slave_id ?? row.slaveId ?? null;
        if (!make || !model || slaveId == null) return;
        const key = `${make}__${model}__${slaveId}`;
        if (!meterMap.has(key)) meterMap.set(key, []);
        meterMap.get(key).push(row);
      });

      const validMeters = Array.from(meterMap.values()).map((rowsForMeter) => {
        const first = rowsForMeter[0];
        const make = first.meter_make || first.make || '';
        const model = first.meter_model || first.model || '';
        const slaveId = first.slave_id ?? first.slaveId ?? null;

        const selectedModelDetails = meterOptions.find(
          (d) => d.device_make === make && d.device_model === model
        );

        const meterName = selectedModelDetails?.device_name || first.meter_name || first.meterName || '';
        const meterType = selectedModelDetails?.device_type || first.meter_type || first.meterType || '';

        // Prefer new intervalTime (seconds); fallback to legacy scan_rate_ms
        const intervalCandidates = rowsForMeter
          .map((r) => {
            const it = r.interval_time ?? r.intervalTime;
            if (typeof it === 'number') return it;
            const legacy = r.scan_rate_ms ?? r.scanRateMs;
            return typeof legacy === 'number' ? Math.round(legacy / 1000) : undefined;
          })
          .filter((v) => typeof v === 'number');
        const intervalSec = intervalCandidates.length ? intervalCandidates[0] : 10;

        const con = {
          baudRate: first.baud_rate ?? first.baudRate ?? 9600,
          dataBits: first.data_bits ?? first.dataBits ?? 8,
          stopBits: first.stop_bits ?? first.stopBits ?? 1,
          parity: first.parity || 'even',
          datatypeIfBulk: first.datatype_if_bulk ?? first.datatypeIfBulk ?? null,
          lock: false,
        };

        // Parse config JSON from table if present
        let config = null;
        try {
          if (first.config) {
            config = typeof first.config === 'string' ? JSON.parse(first.config) : first.config;
          }
        } catch (e) {
          console.warn('Failed to parse config JSON for meter', make, model, slaveId, e);
          config = null;
        }

        return {
          id: first.id,
          device: configInit.gatewayName,
          meter_no: slaveId,
          meter_name: meterName,
          meter_model: model,
          meter_make: make,
          meter_type: meterType,
          label: first.label || `${meterName || `${make} ${model}`} id${slaveId}`,
          interval: intervalSec,
          con,
          config,
        };
      });

      setMeterConfigurations(validMeters);

      if (validMeters.length > 0) {
        const allIntervals = validMeters.map((m) => m.interval);
        const uniqueIntervals = Array.from(new Set(allIntervals));
        // Only update intervalVal if not editing
        if (!isEditingInterval) {
          if (uniqueIntervals.length === 1) {
            setIntervalVal(uniqueIntervals[0]);
          } else {
            setIntervalVal(10); // or '' or 10, or show a warning
          }
        }
      } else {
        if (!isEditingInterval) setIntervalVal(null);
      }

      const existingMeterNos = new Set(validMeters.map((m) => m.meter_no));
      let nextNo = 2;
      while (existingMeterNos.has(nextNo)) {
        nextNo++;
      }
      // Prevent overwriting editingMeterConfig while editing
      setEditingMeterConfig((prev) => {
        if (!prev) return null;
        // If the meter being edited still exists, keep the local edits
        const stillExists = validMeters.some((m) => m.meter_no === prev.meter_no);
        return stillExists ? prev : null;
      });
    } catch (err) {
      console.error('Meter config fetch error (REST):', err);
    } finally {
      setLoading(false);
    }
  };


  const handleIntervalSave = async () => {
    const newInterval = Math.max(1, intervalVal);
    if (isNaN(newInterval) || newInterval <= 0) {
      toast.error("Please enter a valid positive number for the interval.");
      return;
    }

    try {
      const url = `${configInit.appBaseUrl}/api/meter-registers/interval-time`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intervalTime: Number(newInterval) }),
      });
      if (!res.ok) {
        let text = '';
        try { text = await res.text(); } catch {}
        throw new Error(`Interval update failed (${res.status}) ${text}`.trim());
      }

      setMeterConfigurations(prev =>
        prev.map(m => ({ ...m, interval: newInterval }))
      );
      setIntervalVal(newInterval);
      setIsEditingInterval(false);
      toast.success(`Global interval updated to ${newInterval} seconds for all meters.`, { toastId: TOAST_IDS.INTERVAL_UPDATE });
      setDockerLoading(true);
      try {
        await controlDocker('server_container', 'restart');
      } finally {
        setDockerLoading(false);
      }
      await fetchMeters();
    } catch (error) {
      console.error('Failed to update global interval:', error);
      toast.error('Failed to update global interval.', { toastId: TOAST_IDS.INTERVAL_UPDATE });
    }
  };


  const handleMeterChange = (fieldName, value) => {
    const targetConfig = isAddDialog ? newMeterConfig : editingMeterConfig;
    const setTargetConfig = isAddDialog ? setNewMeterConfig : setEditingMeterConfig;

    if (targetConfig) {
      if (fieldName in targetConfig.con) {
        setTargetConfig(prev => ({ ...prev, con: { ...prev.con, [fieldName]: value } }));
      } else {
        setTargetConfig(prev => ({ ...prev, [fieldName]: fieldName === 'meter_no' ? Number(value) : value }));
      }
    }
    setTestResponse(false);
    setResponseMessage('');
  };

  const checkTestMeter = async () => {
    const meterToTest = isAddDialog ? newMeterConfig : editingMeterConfig;
    if (!meterToTest || !meterToTest.label || !meterToTest.meter_make || !meterToTest.meter_model) {
      toast.error("Please fill all required fields for meter test.", { toastId: TOAST_IDS.METER_TEST });
      return;
    }
    const selectedModelDetails = meterOptions.find(d => d.device_make === meterToTest.meter_make && d.device_model === meterToTest.meter_model);
    const finalMeterToTest = {
      ...meterToTest,
      meter_name: selectedModelDetails?.device_name || meterToTest.meter_name,
      meter_type: selectedModelDetails?.device_type || meterToTest.meter_type,
      interval: Number(intervalVal), // Use global interval for test
    };

    setResponseMessage('testing');
    setLoaderPercentage(0);
    try {
      const response = await fetch(`${configInit.appBaseUrl}/v2/api/gettestmeterstatus`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(finalMeterToTest),
      });
      const result = await response.json();
      if (
        !response.ok ||
        result.result === null ||
        (Array.isArray(result.result) && result.result.length === 0) ||
        result.result === "No Meter Found. Please check settings and try again."
      ) {
        setResponseMessage('failed');
        toast.error(result.message || 'Test failed. Meter responded null or with an error.', { toastId: TOAST_IDS.METER_TEST });
      } else {
        setLoaderPercentage(result.timeTaken);
        setResponseMessage('success');
        toast.success(result.message || 'Test successful.', { toastId: TOAST_IDS.METER_TEST });
      }
      setTestResponse(true);
    } catch (error) {
      console.error('Test meter API call failed:', error);
      toast.error('Test meter API call failed.', { toastId: TOAST_IDS.METER_TEST });
      setResponseMessage('failed');
      setTestResponse(true);
    }
  };


  const handleSave = async () => {
    console.log("save");
    setSaving(true);
    const isNew = isAddDialog;
    console.log(isNew);
    const meterToSave = isNew ? newMeterConfig : editingMeterConfig;

    if (!meterToSave || !meterToSave.label || !meterToSave.meter_make || !meterToSave.meter_model) {
      toast.error("Please fill all required fields for meter.", { toastId: TOAST_IDS.METER_ADD });
      setSaving(false);
      return;
    }

    const selectedModelDetails = meterOptions.find(d => d.device_make === meterToSave.meter_make && d.device_model === meterToSave.meter_model);
    const variables = {
      con: JSON.stringify(meterToSave.con),
      device: meterToSave.device || configInit.gatewayName,
      label: meterToSave.label,
      meterNo: meterToSave.meter_no,
      meterName: selectedModelDetails?.device_name || meterToSave.meter_name,
      meterModel: meterToSave.meter_model,
      meterType: selectedModelDetails?.device_type || meterToSave.meter_type,
      meterMake: meterToSave.meter_make,
      interval: Number(intervalVal == 0 ? 10 : intervalVal) // Use global interval
    }
    console.log(variables);
    try {
      if (isNew) {
        await graphqlClient.request(INSERT_METER_INFO, {
          input: {
            meterConfigration: variables
          }
        });
      } else {
        await graphqlClient.request(UPDATE_METER_INFO, {
          input: {
            meterConfigrationPatch: variables,
            nodeId: meterToSave.meter_no
          }
        });
      }
      toast.success(`Meter ${variables?.label} (ID: ${variables?.meterNo}) ${isNew ? 'added' : 'updated'}`, { toastId: isNew ? TOAST_IDS.METER_ADD : TOAST_IDS.METER_UPDATE });
      setIsAddDialog(false);
      setEditingMeterConfig(null);
      setExpandedMeterIndex(null);
      setTestResponse(false);
      setResponseMessage('');
      setDockerLoading(true);
      try {
        await controlDocker('server_container', 'restart');
      } finally {
        setDockerLoading(false);
      }
      await fetchMeters();
    } catch (error) {
      console.error('Save meter failed:', error);
      toast.error('Save meter failed: ' + (error.response?.errors?.[0]?.message || error.message), { toastId: isNew ? TOAST_IDS.METER_ADD : TOAST_IDS.METER_UPDATE });
    } finally {
      setSaving(false);
    }
  };

  const handleOpenAddDialog = () => {
    if (!isAddDialog) {
      const existingMeterNos = new Set(meterConfigurations.map(m => m.meter_no));
      let nextNo = 2;
      while (existingMeterNos.has(nextNo)) {
        nextNo++;
      }
      setNewMeterConfig({ ...initialMeterConfig, meter_no: nextNo });
    }
    setIsAddDialog(true);
    setEditingMeterConfig(null);
    setExpandedMeterIndex(null);
    setTestResponse(false);
    setResponseMessage('');
  };

  const handleEditMeter = (meter, index) => {
    setEditingMeterConfig({ ...meter });
    setExpandedMeterIndex(index);
    setIsAddDialog(false);
    setTestResponse(false);
    setResponseMessage('');
  };

  const handleCloseDetails = () => {
    setExpandedMeterIndex(null);
    setEditingMeterConfig(null);
    setTestResponse(false);
    setResponseMessage('');
  };

  const handleEditDashboard = async () => {
    if (!currentMeterForDetails) return;
    const meterId = `${currentMeterForDetails.device}_id${currentMeterForDetails.meter_no}`;
    try {
      const url = `${configInit.appBaseUrl}/v2/api/check-json?meter_id=${encodeURIComponent(meterId)}`;
      console.log('Checking meter JSON at:', url, currentMeterForDetails);
      const res = await fetch(url);
      // console.log('Status:', res.status, 'Content-Type:', res.headers.get('content-type'));
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response from server');
      }
      const data = await res.json();
      console.log('Response data:', data);
      if (data.exists && data.json_data) {
        setCurrentJsonConfig(data.json_data);
        setJsonString(JSON.stringify(data.json_data, null, 2));
      } else {
        const defaultConfig = generateJsonConfig(currentMeterForDetails);
        setCurrentJsonConfig(defaultConfig);
        setDefaultJsonConfig(defaultConfig);
        setJsonString(JSON.stringify(defaultConfig, null, 2));
      }
      setJsonDialogOpen(true);
    } catch (error) {
      console.error('Failed to check meter JSON file:', error);
      toast.error('Failed to check meter, server error',);
    }
  }


  const handleDeleteRequest = () => {
    if (!editingMeterConfig || expandedMeterIndex === null) {
      toast.error("No meter selected for deletion.");
      return;
    }
    handleConfirmDelete();
  };


  const handleConfirmDelete = async () => {
    if (!editingMeterConfig) return;

    const meterNoToDelete = editingMeterConfig.id;
    const meterLabelToDelete = editingMeterConfig.label;
    const meterIdForRelatedData = `${configInit.gatewayName}_id${editingMeterConfig.meter_no}`;
    console.log("meterIdForRelatedData=>", meterIdForRelatedData);
    console.log("meterNoToDelete=>", typeof (meterNoToDelete), meterNoToDelete);

    try {
      const slaveId = editingMeterConfig.meter_no;
      if (slaveId === undefined || slaveId === null || slaveId === '') {
        toast.error('No Meter No. found for deletion', { toastId: TOAST_IDS.METER_DELETE });
        return;
      }

      const url = `${configInit.appBaseUrl}/api/meter-registers/by-slave/${slaveId}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        let text = '';
        try {
          text = await res.text();
        } catch {
          text = '';
        }
        toast.error(`Delete failed (${res.status}) ${text || ''}`.trim(), { toastId: TOAST_IDS.METER_DELETE });
        return;
      }

      toast.success(`Deleted meter registers for id${slaveId}`, { toastId: TOAST_IDS.METER_DELETE });
      // Optimistically update UI so the deleted meter disappears immediately
      setMeterConfigurations((prev) => (Array.isArray(prev) ? prev.filter((m) => m?.meter_no !== slaveId) : []));
      setExpandedMeterIndex(null);
      setEditingMeterConfig(null);
      setCurrentAction(null);
      await fetchMeters();
    } catch (error) {
      console.error('Delete meter failed:', error);
      toast.error('Delete meter failed: ' + (error.response?.errors?.[0]?.message || error.message), { toastId: TOAST_IDS.METER_DELETE });
    }
  };

  const handlePasswordConfirm = async (enteredPassword) => {
    try {
      if (enteredPassword === dbPassword) {
        if (currentAction === 'add') {
          setDockerLoading(true);
          try {
            await controlDocker('server_container', 'stop');
            setTimeout(() => {
              handleOpenAddDialog();
              setPasswordDialogOpen(false);
            }, 1000);
          } finally {
            setDockerLoading(false);
          }
        } else if (currentAction === 'dashboard') {
          setSaving(true);
          await handleEditDashboard();
          setPasswordDialogOpen(false);
          setSaving(false);
        }
      } else {
        toast.error('Incorrect password', { toastId: TOAST_IDS.GENERIC_ERROR });
      }
      if (currentAction !== 'dashboard') {
        setPasswordDialogOpen(false);
      }
    } catch (error) {
      setSaving(false);
      throw error;
    }
  };

  const currentMeterForDetails = editingMeterConfig || (expandedMeterIndex !== null && meterConfigurations[expandedMeterIndex] ? meterConfigurations[expandedMeterIndex] : null);


  console.log("SetupPage rendered", currentMeterForDetails);

  return (
    <Fade in={loaded} timeout={700}>
      <Box sx={{ p: { xs: 1, sm: 2 } }}>
        {/* Backdrop for saving meter */}
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 9999 }} open={saving}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {/* Backdrop for Docker control operations */}
        <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 10000 }} open={dockerLoading}>
          <CircularProgress color="inherit" />
          <Typography sx={{ ml: 2 }}>Container control in progress...</Typography>
        </Backdrop>
        {/* Main Content Start */}
        <Paper elevation={3} sx={{ p: 1, mb: 1, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0, flexWrap: 'wrap', gap: 1 }}>
            {isEditingInterval ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                <Typography variant="h6">Global Time Interval:</Typography>
                <TextField
                  type="number"
                  value={intervalVal}
                  onChange={(e) => setIntervalVal(e.target.value === '' ? '' : Number(e.target.value))}
                  size="small"
                  inputProps={{ min: 1 }}
                  sx={{ width: '100px' }}
                  error={isNaN(intervalVal) || intervalVal <= 0}
                  helperText={(isNaN(intervalVal) || intervalVal <= 0) ? "Positive number required" : ""}
                />
                <Typography variant="body1" >sec</Typography>
                <Chip label="Save" color="primary" size="medium" onClick={handleIntervalSave} disabled={isNaN(intervalVal) || intervalVal <= 0} />
                <Chip label="Cancel" color="default" size="medium" onClick={() => {
                  setIsEditingInterval(false);
                  // Optionally revert intervalVal to the original value if needed
                  if (meterConfigurations.length > 0 && meterConfigurations[0].interval != null) {
                    setIntervalVal(meterConfigurations[0].interval);
                  } else {
                    setIntervalVal(10);
                  }
                }} />
              </Box>
            ) : (
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, flexGrow: 1 }}>
                Global Time Interval: {intervalVal} sec
                <Chip label="Edit Interval" color="primary" disabled={meterConfigurations.length === 0} onClick={() => setIsEditingInterval(true)} size="medium" />
              </Typography>
            )}
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 1, borderRadius: 2, mb: 1 }}>
          <Typography variant="h6" >Configured Meters</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', border: '1px solid', borderColor: 'divider', p: 1, borderRadius: 1, minHeight: '50px' }}>
            {meterConfigurations.length > 0 ? meterConfigurations.map((meter, index) => (
              <MeterChip
                key={meter.meter_no}
                meter={meter}
                isSelected={index === expandedMeterIndex}
                isLive={liveStatuses[`${meter.device}_id${meter.meter_no}`]}
                onClick={() => handleEditMeter(meter, index)}
                index={index}
              />
            )) : <Typography sx={{ p: 1, color: 'text.secondary' }}>No meters configured yet.</Typography>}
          </Box>
        </Paper>

        <Fade in={expandedMeterIndex !== null && currentMeterForDetails !== null} timeout={300}>
          <Box>
            {expandedMeterIndex !== null && currentMeterForDetails && (
              <MeterDetails
                meter={currentMeterForDetails}
                onChange={handleMeterChange}
                onTest={checkTestMeter}
                jsonDialogOpen={jsonDialogOpen}
                onEditDashboard={handleEditDashboard}
                onRequestPassword={() => {
                  setCurrentAction('dashboard');
                  setPasswordDialogOpen(true);
                }}
                onSave={handleSave}
                onSaveParameters={handleSaveParameters}
                onDelete={() => setConfirmDeleteDialogOpen(true)}
                onClose={handleCloseDetails}
                testResponse={testResponse}
                responseMessage={responseMessage}
                loaderPercentage={loaderPercentage}
                globalInterval={intervalVal}
              />
            )}
          </Box>
        </Fade>
        <MeterJsonEditorDialog
          open={jsonDialogOpen}
          onClose={() => { setJsonDialogOpen(false); setDefaultJsonConfig(null); }}
          defaultJsonConfig={defaultJsonConfig}
          jsonError={jsonError}
          jsonString={jsonString}
          getMeterName={`${currentMeterForDetails?.device}_id${currentMeterForDetails?.meter_no}`}
          onEditorChange={handleEditorChange}
          onEditorMount={(editor, monaco) => {
            setEditorInstance(editor);
            window.monaco = monaco;
          }}
          onSave={async () => {
            try {
              const meterId = `${currentMeterForDetails.device}_id${currentMeterForDetails.meter_no}`;
              console.log("meterrerrrrrrrr", meterId)
              await insertMeterJsonData(
                defaultJsonConfig,
                currentMeterForDetails.meterNo, // Meter ID
                currentJsonConfig, // JSON configuration
                meterId // Measurement name
              );
              setUnsavedChanges(false);
              toast.success('JSON configuration saved successfully!', { toastId: TOAST_IDS.METER_UPDATE });
              setJsonDialogOpen(false);
            } catch (error) {
              console.error('Failed to save JSON configuration:', error);
              toast.error('Failed to save JSON configuration', { toastId: TOAST_IDS.GENERIC_ERROR });
            }
          }}
          saveDisabled={!!jsonError}
        />

        <AddMeterDialog
          open={isAddDialog}
          onClose={async () => {
            // Wait for the Docker restart to complete
            setDockerLoading(true);
            try {
              await controlDocker('server_container', 'restart');
            } finally {
              setDockerLoading(false);
            }
            // Then close the dialog
            setIsAddDialog(false);
          }}
          config={newMeterConfig}
          onChange={handleMeterChange}
          onTest={checkTestMeter}
          onSave={handleSave}
          testResponse={testResponse}
          responseMessage={responseMessage}
          loaderPercentage={loaderPercentage}
          usedMeterNos={meterConfigurations.map(m => m.meter_no)}
          saving={saving}
        />

        <SetupPasswordDialog
          open={passwordDialogOpen}
          onClose={() => {
            setPasswordDialogOpen(false);
            setCurrentAction(null);
          }}
          onConfirm={handlePasswordConfirm}
          dialogType={currentAction}
          actionDescription={
            currentAction === 'add' ? 'add a new meter' :
              currentAction === 'dashboard' ? 'edit meter dashboard' : 'perform this action'
          }
        />
        <ConfirmDeleteDialog
          open={confirmDeleteDialogOpen}
          onClose={() => setConfirmDeleteDialogOpen(false)}
          onConfirm={() => {
            setConfirmDeleteDialogOpen(false);
            handleConfirmDelete();
          }}
        />
      </Box>
    </Fade>

  );

};

export default SetupPage;

