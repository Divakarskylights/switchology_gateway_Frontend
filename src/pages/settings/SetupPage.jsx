import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Box, Button, Chip, CircularProgress, TextField, Typography, Fade, Paper, Backdrop } from '@mui/material';
import MeterJsonEditorDialog, { insertMeterJsonData } from '../../features/setup/components/MeterJsonEditorDialog';
import { graphqlClient } from '../../services/client';
import {
  DELETE_METER_INFO, GET_METER_INFO, INSERT_METER_INFO, UPDATE_METER_INFO,
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
  const [deletePasswordDialogOpen, setDeletePasswordDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState(null);
  const [isEditingInterval, setIsEditingInterval] = useState(false);
  const [intervalVal, setIntervalVal] = useState(10); // State for global interval
  const [dbPassword, setDbPassword] = useState('');
  const [loaded, setLoaded] = useState(false);
  const [liveStatuses, setLiveStatuses] = useState({});
  const [saving, setSaving] = useState(false);
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
      const data = await graphqlClient.request(GET_METER_INFO);
      const meters = data?.allMeterConfigrations?.nodes || [];
      console.log("meters=>", meters, meterOptions);
      const validMeters = meters.filter(m =>
        m.con &&
        meterOptions.some(opt =>
          opt.device_make === m.meterMake &&
          opt.device_model === m.meterModel &&
          Array.isArray(opt.baud_rate)
          && opt.baud_rate.map(Number).includes(Number(JSON.parse(m.con).baudRate))
        )
      ).map(m => ({
        ...m,
        meter_no: m.meterNo,
        meter_name: m.meterName,
        meter_model: m.meterModel,
        meter_make: m.meterMake,
        meter_type: m.meterType,
        con: typeof m.con === 'string' ? JSON.parse(m.con) : m.con
      }));
      console.log("validMeters=>", validMeters);

      setMeterConfigurations(validMeters);
      if (validMeters.length > 0) {
        const allIntervals = validMeters.map(m => m.interval);
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

      const existingMeterNos = new Set(validMeters.map(m => m.meter_no));
      let nextNo = 2;
      while (existingMeterNos.has(nextNo)) {
        nextNo++;
      }
      // Prevent overwriting editingMeterConfig while editing
      setEditingMeterConfig(prev => {
        if (!prev) return null;
        // If the meter being edited still exists, keep the local edits
        const stillExists = validMeters.some(m => m.meter_no === prev.meter_no);
        return stillExists ? prev : null;
      });
    } catch (err) {
      console.error("Meter config fetch error:", err);
      // toast.error("Failed to load meter configurations.");
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
      await Promise.all(
        meterConfigurations.map(async (meter) => {
          try {
            if (!meter.id) {
              console.error(`❌ Missing ID for meter`, meter);
              return;
            }

            await graphqlClient.request(UPDATE_METER_INTERVAL, {
              input: {
                id: meter.id, // ✅ MUST be the `id` field, not meter_no
                meterConfigrationPatch: { interval: newInterval }
              }
            });
          } catch (err) {
            console.error(`Failed to update meter ${meter.meter_no}`, err);
          }
        })
      );

      setMeterConfigurations(prev =>
        prev.map(m => ({ ...m, interval: newInterval }))
      );
      setIntervalVal(newInterval);
      setIsEditingInterval(false);
      toast.success(`Global interval updated to ${newInterval} seconds for all meters.`);
      await controlDocker('server_container', 'restart');
      await fetchMeters();
    } catch (error) {
      console.error('Failed to update global interval:', error);
      toast.error('Failed to update global interval.');
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
      toast.error("Please fill all required fields for the meter.");
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
        toast.error(result.message || 'Test failed. Meter responded null or with an error.');
      } else {
        setLoaderPercentage(result.timeTaken);
        setResponseMessage('success');
        toast.success(result.message || 'Test successful.');
      }
      setTestResponse(true);
    } catch (error) {
      console.error('Test meter API call failed:', error);
      toast.error('Test meter API call failed.');
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
      toast.error("Please fill all required fields for the meter.");
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
      setTimeout(async () => await controlDocker('server_container', 'restart'), 900);
      toast.success(`Meter ${variables?.label} (ID: ${variables?.meterNo}) ${isNew ? 'added' : 'updated'}`);
      setIsAddDialog(false);
      setEditingMeterConfig(null);
      setExpandedMeterIndex(null);
      setTestResponse(false);
      setResponseMessage('');
      await fetchMeters();
    } catch (error) {
      console.error('Save meter failed:', error);
      toast.error('Save meter failed: ' + (error.response?.errors?.[0]?.message || error.message));
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
    if (editingMeterConfig && expandedMeterIndex !== null) {

      setCurrentAction('delete');
      setDeletePasswordDialogOpen(true);
    } else {
      toast.error("No meter selected for deletion.");
    }
  };


  const handleConfirmDelete = async () => {
    if (!editingMeterConfig) return;

    const meterNoToDelete = editingMeterConfig.id;
    const meterLabelToDelete = editingMeterConfig.label;
    const meterIdForRelatedData = `${configInit.gatewayName}_id${editingMeterConfig.meter_no}`;
    console.log("meterIdForRelatedData=>", meterIdForRelatedData);
    console.log("meterNoToDelete=>", typeof (meterNoToDelete));

    try {
      const data = await graphqlClient.request(DELETE_METER_INFO, {
        input: {
          id: meterNoToDelete
        }
      });
      console.log("data", data.deleteMeterConfigrationById);
      if (data.deleteMeterConfigrationById.meterConfigration) {
        await fetch(`${configInit.appBaseUrl}/v2/api/db/measurements/${meterIdForRelatedData}`, {
          method: 'DELETE', headers: { 'Content-Type': 'application/json' },
        });
        toast.success(`Meter ${meterLabelToDelete} (ID: ${meterNoToDelete}) deleted`);
        setLoading(true);
        setTimeout(async () => await controlDocker('server_container', 'restart'), 900);
        setLoading(false);
      } else {
        toast.error("Meter deletion failed!");
      }
      setExpandedMeterIndex(null);
      setEditingMeterConfig(null);
      setDeletePasswordDialogOpen(false);
      setCurrentAction(null);
      await fetchMeters();
    } catch (error) {
      console.error('Delete meter failed:', error);
      toast.error('Delete meter failed: ' + (error.response?.errors?.[0]?.message || error.message));
    }
  };

  const handlePasswordConfirm = async (enteredPassword) => {
    try {
      if (enteredPassword === dbPassword) {
        if (currentAction === 'add') {
          setSaving(true);
          await controlDocker('server_container', 'stop');
          setTimeout(() => {
            handleOpenAddDialog();
            setPasswordDialogOpen(false);
            setSaving(false);
          }, 1000);
        } else if (currentAction === 'delete') {
          setSaving(true);
          await handleConfirmDelete();
          setSaving(false);
        } else if (currentAction === 'dashboard') {
          setSaving(true);
          await handleEditDashboard();
          setPasswordDialogOpen(false);
          setSaving(false);
        }
      } else {
        toast.error('Incorrect password');
      }
      if (currentAction !== 'delete' && currentAction !== 'dashboard') {
        setPasswordDialogOpen(false);
        setDeletePasswordDialogOpen(false);
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
            <Button variant="contained" size="small" onClick={() => { setCurrentAction('add'); setPasswordDialogOpen(true); }}>Add New Device</Button>
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
              toast.success('JSON configuration saved successfully!');
              setJsonDialogOpen(false);
            } catch (error) {
              console.error('Failed to save JSON configuration:', error);
              toast.error('Failed to save JSON configuration');
            }
          }}
          saveDisabled={!!jsonError}
        />

        <AddMeterDialog
          open={isAddDialog}
          onClose={async () => {
            // Wait for the Docker restart to complete
            await controlDocker('server_container', 'restart');
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
          open={passwordDialogOpen || deletePasswordDialogOpen}
          onClose={() => {
            passwordDialogOpen ? setPasswordDialogOpen(false) : setDeletePasswordDialogOpen(false);
            setCurrentAction(null);
          }}
          onConfirm={handlePasswordConfirm}
          dialogType={currentAction}
          actionDescription={
            currentAction === 'add' ? 'add a new meter' :
              currentAction === 'delete' && editingMeterConfig ? `delete meter "${editingMeterConfig.label}" (ID: ${editingMeterConfig.meter_no})` : 'perform this action'
          }
        />
        <ConfirmDeleteDialog
          open={confirmDeleteDialogOpen}
          onClose={() => setConfirmDeleteDialogOpen(false)}
          onConfirm={() => {
            setConfirmDeleteDialogOpen(false);
            handleDeleteRequest();
          }}
        />
      </Box>
    </Fade>

  );

};

export default SetupPage;

