import React from 'react';
import { Box, Typography, Stack, IconButton, Tooltip } from '@mui/material';
import model from './data/samplePlc.json';
import { evaluatePlc } from './logic/evaluate';
import PLCDiagram from './PLCDiagram';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { graphqlClient } from '../services/client';
import { INSERT_PLC_CONFIG, GET_PLC_CONFIGS, UPDATE_PLC_CONFIG_BY_ID, GET_RELAY_PLCLOGIC_LATEST, INSERT_RELAY_PLCLOGIC, UPDATE_RELAY_PLCLOGIC_BY_ID } from '../services/query';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import TuneIcon from '@mui/icons-material/Tune';
import PlcLoadingOverlay from './components/PlcLoadingOverlay';
import PlcConfigDialog from './components/PlcConfigDialog';
import TimerSettingsDialog from './components/TimerSettingsDialog';
import { toast } from 'react-toastify';

function PLCApp() {
  const TOTAL_IO = 14;
  const [inputCount, setInputCount] = React.useState(7);
  const outputCount = TOTAL_IO - inputCount;
  const [configConfirmed, setConfigConfirmed] = React.useState(false);
  const [pinModes, setPinModes] = React.useState(() => Array.from({ length: TOTAL_IO }, () => 'none'));
  const [loadingConfig, setLoadingConfig] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const pinModesBackupRef = React.useRef(null);
  const [hasExistingConfig, setHasExistingConfig] = React.useState(false);

  const [plcModel, setPlcModel] = React.useState(() => {
    const inputs = Array.from({ length: 7 }, (_, i) => ({ id: `IN${i + 1}`, name: `IN${i + 1}`, state: false }));
    const outputs = Array.from({ length: 7 }, (_, i) => ({ id: `OUT${i + 1}`, source: null }));
    return { ...model, inputs, outputs, logic: [] };
  });
  const [diagramData, setDiagramData] = React.useState(() => ({ nodeDataArray: [], linkDataArray: [] }));
  const [relayLogicId, setRelayLogicId] = React.useState(null);
  const [loadedPlcLogicFromDb, setLoadedPlcLogicFromDb] = React.useState(false);
  const [dbSnapshot, setDbSnapshot] = React.useState({ nodeDataArray: [], linkDataArray: [] });
  const [isReadOnlyDiagram, setIsReadOnlyDiagram] = React.useState(true);
  const rebuildPlcModel = React.useCallback((inCnt, outCnt) => {
    const inputs = Array.from({ length: inCnt }, (_, i) => ({ id: `IN${i + 1}`, name: `IN${i + 1}`, state: false }));
    const outputs = Array.from({ length: outCnt }, (_, i) => ({ id: `OUT${i + 1}`, source: null }));
    const links = (diagramData.linkDataArray || []);
    const mappedOutputs = outputs.map(o => {
      const link = links.find(l => l.to === o.id);
      return { ...o, source: link ? link.from : null };
    });
    setPlcModel(prev => ({ ...prev, inputs, outputs: mappedOutputs }));
  }, [diagramData.linkDataArray]);

  React.useEffect(() => {
    (async () => {
      try {
        const existing = await graphqlClient.request(GET_PLC_CONFIGS);
        const nodes = existing?.allPlcConfigs?.nodes || [];
        if (nodes.length > 0) setHasExistingConfig(true);
        if (nodes.length > 0) {
          const n = nodes[0];
          const pm = typeof n.pinModes === 'string' ? JSON.parse(n.pinModes || '[]') : (n.pinModes || []);
          if (Array.isArray(pm) && pm.length === TOTAL_IO) {
            setPinModes(pm);
            pinModesBackupRef.current = [...pm];
            const chosenInputs = pm.filter(m => m === 'input').length;
            const chosenOutputs = pm.filter(m => m === 'output').length;
            setInputCount(chosenInputs);
            rebuildPlcModel(chosenInputs, chosenOutputs);
          }
          if (n.confirmed === true) {
            setConfigConfirmed(true);
          }
        }
      } catch (_) { }
      finally {
        setLoadingConfig(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await graphqlClient.request(GET_RELAY_PLCLOGIC_LATEST);
        const nodes = res?.allRelayPlclogics?.nodes || [];
        if (nodes.length > 0) {
          const row = nodes[0];
          let nodeData = row.nodeData;
          let linkData = row.linkData;
          if (typeof nodeData === 'string') {
            try { nodeData = JSON.parse(nodeData || '[]'); } catch (_) {}
          }
          if (typeof linkData === 'string') {
            try { linkData = JSON.parse(linkData || '[]'); } catch (_) {}
          }
          const data = { nodeDataArray: Array.isArray(nodeData) ? nodeData : [], linkDataArray: Array.isArray(linkData) ? linkData : [] };
          setDiagramData(data);
          setDbSnapshot(data);
          setRelayLogicId(row.id || null);
          setLoadedPlcLogicFromDb(true);
          setIsReadOnlyDiagram(true);
        }
      } catch (e) {}
    })();
  }, []);

  const saveConfigToServer = async (cfg) => {
    try {
      console.log("Saving PLC config:", cfg);

      // Fetch existing configs
      const existing = await graphqlClient.request(GET_PLC_CONFIGS);
      const nodes = existing?.allPlcConfigs?.nodes || [];
      console.log("Existing configs:", nodes);

      // Prepare JSONB pin_modes
      const jsonPinModes = JSON.stringify(pinModes);

      // --- UPDATE PATH ---
      if (nodes.length > 0 && nodes[0]?.id) {
        const id = nodes[0].id;

        const updateInput = {
          input: {
            id,
            plcConfigPatch: {
              totalIo: cfg.total_io,
              inputCount: cfg.input_count,
              outputCount: cfg.output_count,
              confirmed: true,
              pinModes: jsonPinModes
            }
          }
        };

        console.log("Update input:", JSON.stringify(updateInput, null, 2));
        const result = await graphqlClient.request(UPDATE_PLC_CONFIG_BY_ID, updateInput);
        console.log("Update result:", result);

        return id;
      }

      // --- INSERT PATH ---
      const insertInput = {
        input: {
          plcConfig: {
            totalIo: cfg.total_io,
            inputCount: cfg.input_count,
            outputCount: cfg.output_count,
            confirmed: true,
            pinModes: jsonPinModes
          }
        }
      };

      console.log("Insert input:", JSON.stringify(insertInput, null, 2));
      const created = await graphqlClient.request(INSERT_PLC_CONFIG, insertInput);
      console.log("Insert result:", created);

      return created?.createPlcConfig?.plcConfig?.id || null;

    } catch (e) {
      console.error("GraphQL Error saving PLC config:", e);
      console.error("Response:", e.response);
      return null;
    }
  };


  const [selectedKey, setSelectedKey] = React.useState(null);
  const runtimeRef = React.useRef({ timers: {} });
  const [tick, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 200);
    return () => clearInterval(id);
  }, []);

  const states = React.useMemo(() => evaluatePlc(plcModel, runtimeRef.current), [plcModel, tick]);


  const handleEnterEditMode = () => setIsReadOnlyDiagram(false);
  const handleCancelEdit = async () => {
    setDiagramData(dbSnapshot);
    setIsReadOnlyDiagram(true);
    try {
      const res = await graphqlClient.request(GET_RELAY_PLCLOGIC_LATEST);
      const nodes = res?.allRelayPlclogics?.nodes || [];
      if (nodes.length > 0) {
        const row = nodes[0];
        let nodeData = row.nodeData;
        let linkData = row.linkData;
        if (typeof nodeData === 'string') { try { nodeData = JSON.parse(nodeData || '[]'); } catch (_) {} }
        if (typeof linkData === 'string') { try { linkData = JSON.parse(linkData || '[]'); } catch (_) {} }
        const data = { nodeDataArray: Array.isArray(nodeData) ? nodeData : [], linkDataArray: Array.isArray(linkData) ? linkData : [] };
        setDiagramData(data);
        setDbSnapshot(data);
        setRelayLogicId(row.id || null);
      }
    } catch (_) {}
  };

  const handleSavePlcLogic = React.useCallback(async () => {
    try {
      const name = 'default_plc_logic';
      const description = '';
      const nodeData = JSON.stringify(diagramData.nodeDataArray || []);
      const linkData = JSON.stringify(diagramData.linkDataArray || []);

      if (relayLogicId) {
        const input = {
          input: {
            id: relayLogicId,
            relayPlclogicPatch: {
              name,
              description,
              nodeData,
              linkData
            }
          }
        };
        const result = await graphqlClient.request(UPDATE_RELAY_PLCLOGIC_BY_ID, input);
        const id = result?.updateRelayPlclogicById?.relayPlclogic?.id || relayLogicId;
        setRelayLogicId(id);
        const data = { nodeDataArray: diagramData.nodeDataArray || [], linkDataArray: diagramData.linkDataArray || [] };
        setDbSnapshot(data);
        setIsReadOnlyDiagram(true);
        toast.success('PLC logic updated');
      } else {
        const input = {
          input: {
            relayPlclogic: {
              name,
              description,
              nodeData,
              linkData
            }
          }
        };
        const result = await graphqlClient.request(INSERT_RELAY_PLCLOGIC, input);
        const id = result?.createRelayPlclogic?.relayPlclogic?.id || null;
        if (id) setRelayLogicId(id);
        const data = { nodeDataArray: diagramData.nodeDataArray || [], linkDataArray: diagramData.linkDataArray || [] };
        setDbSnapshot(data);
        setIsReadOnlyDiagram(true);
        toast.success('PLC logic saved');
      }
    } catch (e) {
      console.error('Error saving PLC logic:', e);
      toast.error('Failed to save PLC logic');
    }
  }, [diagramData.nodeDataArray, diagramData.linkDataArray, relayLogicId]);

  const onDiagramChange = React.useCallback(({ nodeDataArray, linkDataArray, selectedKey }) => {
    // Guard: ignore if no actual structural change (ignore loc/color/keys)
    const normNodes = (arr) => (arr || [])
      .map(n => ({ key: n.key, category: n.category, gateType: n.gateType, ioType: n.ioType, name: n.name, params: n.params }))
      .sort((a, b) => String(a.key).localeCompare(String(b.key)));
    const normLinks = (arr) => (arr || [])
      .map(l => ({ from: l.from, to: l.to }))
      .sort((a, b) => (String(a.from) + "->" + String(a.to)).localeCompare(String(b.from) + "->" + String(b.to)));

    const incomingFull = { nodeDataArray: nodeDataArray || [], linkDataArray: linkDataArray || [] };
    const prevFull = { nodeDataArray: diagramData.nodeDataArray || [], linkDataArray: diagramData.linkDataArray || [] };

    const sameStructural = JSON.stringify({ n: normNodes(incomingFull.nodeDataArray), l: normLinks(incomingFull.linkDataArray) }) ===
      JSON.stringify({ n: normNodes(prevFull.nodeDataArray), l: normLinks(prevFull.linkDataArray) });
    const sameFull = JSON.stringify(incomingFull) === JSON.stringify(prevFull);

    // Always reflect positional or visual changes in diagramData so nodes don't snap back
    if (!sameFull) setDiagramData(incomingFull);
    if (selectedKey !== undefined) setSelectedKey(selectedKey);
    // Translate diagram to plc model using functional update to avoid stale closures and prevent unnecessary updates
    setPlcModel(prev => {
      const gateNodes = (nodeDataArray || []).filter(n => n.category === 'gate');
      const nextLogic = gateNodes.map(n => ({
        id: n.key,
        type: n.gateType || n.name || 'AND',
        params: n.params || {},
        inputs: (linkDataArray || [])
          .filter(l => l.to === n.key)
          .map(l => l.from)
      }));
      const nextOutputs = (prev.outputs || []).map(o => {
        const link = (linkDataArray || []).find(l => l.to === o.id);
        return { ...o, source: link ? link.from : o.source };
      });

      const logicSamePrev = JSON.stringify(nextLogic) === JSON.stringify(prev.logic || []);
      const outputsSamePrev = JSON.stringify(nextOutputs) === JSON.stringify(prev.outputs || []);
      if (logicSamePrev && outputsSamePrev) return prev;
      return { ...prev, logic: nextLogic, outputs: nextOutputs };
    });
  }, [diagramData.nodeDataArray, diagramData.linkDataArray]);

  const selectedNode = React.useMemo(() => (diagramData.nodeDataArray || []).find(n => n.key === selectedKey), [diagramData.nodeDataArray, selectedKey]);

  const handleTimerDelayChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (!selectedNode || Number.isNaN(val)) return;
    const updatedNodes = (diagramData.nodeDataArray || []).map(n => n.key === selectedNode.key ? { ...n, params: { ...(n.params || {}), delay: val } } : n);
    setDiagramData(prev => ({ ...prev, nodeDataArray: updatedNodes }));
    setPlcModel(prev => ({
      ...prev,
      logic: (prev.logic || []).map(g => g.id === selectedNode.key ? { ...g, params: { ...(g.params || {}), delay: val } } : g)
    }));
  };

  // Dialog for editing timer delay on double-click
  const [timerDialog, setTimerDialog] = React.useState({ open: false, key: null, type: null, delay: 3000, operator: '==', value: 1 });
  const handleNodeDoubleClick = React.useCallback((nodeData) => {
    if (nodeData && nodeData.category === 'gate') {
      const existing = (diagramData.nodeDataArray || []).find(n => n.key === nodeData.key) || nodeData;
      if (nodeData.gateType === 'TON' || nodeData.gateType === 'TOF') {
        const delay = existing?.params?.delay ?? 3000;
        setTimerDialog({ open: true, key: nodeData.key, type: nodeData.gateType, delay, operator: '==', value: 1 });
      } else if (nodeData.gateType === 'COMPARE') {
        const operator = existing?.params?.operator ?? '==';
        const value = existing?.params?.value ?? 1;
        setTimerDialog({ open: true, key: nodeData.key, type: nodeData.gateType, delay: 3000, operator, value });
      }
    }
  }, [diagramData.nodeDataArray]);
  const handleDialogDelayChange = (e) => {
    const v = parseInt(e.target.value, 10);
    setTimerDialog(prev => ({ ...prev, delay: Number.isNaN(v) ? 0 : v }));
  };
  const handleDialogOperatorChange = (e) => setTimerDialog(prev => ({ ...prev, operator: e.target.value }));
  const handleDialogValueChange = (e) => {
    const v = Number(e.target.value);
    setTimerDialog(prev => ({ ...prev, value: v }));
  };
  const handleDialogClose = () => setTimerDialog(prev => ({ ...prev, open: false }));
  const handleDialogSave = () => {
    const k = timerDialog.key;
    if (!k) { handleDialogClose(); return; }
    let updatedNodes = diagramData.nodeDataArray || [];
    let updatedLogicMapper = (g) => g;
    if (timerDialog.type === 'TON' || timerDialog.type === 'TOF') {
      const val = timerDialog.delay;
      if (Number.isNaN(val)) { handleDialogClose(); return; }
      updatedNodes = updatedNodes.map(n => n.key === k ? { ...n, params: { ...(n.params || {}), delay: val } } : n);
      updatedLogicMapper = (g) => g.id === k ? { ...g, params: { ...(g.params || {}), delay: val } } : g;
    } else if (timerDialog.type === 'COMPARE') {
      const operator = timerDialog.operator;
      const value = timerDialog.value;
      updatedNodes = updatedNodes.map(n => n.key === k ? { ...n, params: { ...(n.params || {}), operator, value } } : n);
      updatedLogicMapper = (g) => g.id === k ? { ...g, params: { ...(g.params || {}), operator, value } } : g;
    }
    setDiagramData(prev => ({ ...prev, nodeDataArray: updatedNodes }));
    setPlcModel(prev => ({
      ...prev,
      logic: (prev.logic || []).map(updatedLogicMapper)
    }));
    handleDialogClose();
  };

  const handleConfigConfirm = async () => {
    const chosenInputs = pinModes.filter(m => m === 'input').length;
    const chosenOutputs = pinModes.filter(m => m === 'output').length;
    const cfg = { total_io: TOTAL_IO, input_count: chosenInputs, output_count: chosenOutputs };
    await saveConfigToServer(cfg);
    setInputCount(chosenInputs);
    // outputCount is derived, but rebuild uses explicit
    rebuildPlcModel(chosenInputs, chosenOutputs);
    setConfigConfirmed(true);
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1, height: '100vh', boxSizing: 'border-box' }}>
        <PlcLoadingOverlay loading={loadingConfig} />
        <Typography variant="h5" gutterBottom>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <span>PLC Module</span>
            <Stack direction="row" alignItems="center" spacing={1}>
              {configConfirmed && (
                <Tooltip title="Edit I/O Configuration">
                  <IconButton
                    size="small"
                    onClick={() => {
                      pinModesBackupRef.current = [...pinModes];
                      setIsEditing(true);
                      setConfigConfirmed(false);
                    }}
                    aria-label="Edit I/O Configuration"
                  >
                    <TuneIcon />
                  </IconButton>
                </Tooltip>
              )}
              {isReadOnlyDiagram ? (
                <Tooltip title="Edit Diagram">
                  <IconButton size="small" onClick={handleEnterEditMode} aria-label="Edit diagram">
                    <EditIcon />
                  </IconButton>
                </Tooltip>
              ) : (
                <>
                  <Tooltip title="Cancel Diagram Edit">
                    <IconButton size="small" onClick={handleCancelEdit} aria-label="Cancel editing">
                      <CloseIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Save Diagram">
                    <IconButton size="small" onClick={() => { if (window.confirm('Are you want to save edited Diagram?')) { handleSavePlcLogic(); } }} aria-label="Save diagram">
                      <SaveIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Stack>
          </Stack>
        </Typography>
        {configConfirmed && !loadingConfig && (
          <Box sx={{ flex: 1, minWidth: 400 }}>
            <PLCDiagram
              inputs={plcModel.inputs}
              logic={plcModel.logic}
              outputs={plcModel.outputs}
              states={states}
              nodeDataArrayOverride={diagramData.nodeDataArray || []}
              linkDataArrayOverride={diagramData.linkDataArray || []}
              onModelChange={onDiagramChange}
              onNodeDoubleClick={handleNodeDoubleClick}
              inputCount={pinModes.filter(m => m === 'input').length}
              outputCount={pinModes.filter(m => m === 'output').length}
              inputPins={pinModes.map((m, idx) => (m === 'input' ? idx + 1 : null)).filter(Boolean)}
              outputPins={pinModes.map((m, idx) => (m === 'output' ? idx + 1 : null)).filter(Boolean)}
              isReadOnly={isReadOnlyDiagram}
            />
          </Box>
        )}
        {!configConfirmed && (
          <Box sx={{ flex: 1, minWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#777' }}>
            <Typography variant="body1">Please configure Inputs/Outputs to proceed.</Typography>
          </Box>
        )}
        <TimerSettingsDialog
          open={timerDialog.open}
          type={timerDialog.type}
          delay={timerDialog.delay}
          operator={timerDialog.operator}
          value={timerDialog.value}
          onClose={handleDialogClose}
          onSave={handleDialogSave}
          onChangeDelay={handleDialogDelayChange}
          onChangeOperator={handleDialogOperatorChange}
          onChangeValue={handleDialogValueChange}
        />

        <PlcConfigDialog
          open={!configConfirmed && !loadingConfig}
          totalIo={TOTAL_IO}
          pinModes={pinModes}
          setPinModes={setPinModes}
          inputCount={pinModes.filter(m => m === 'input').length}
          outputCount={pinModes.filter(m => m === 'output').length}
          isEditing={isEditing || hasExistingConfig}
          onCancel={() => {
            if (Array.isArray(pinModesBackupRef.current)) {
              const pm = pinModesBackupRef.current;
              setPinModes(pm);
              const chosenInputs = pm.filter(m => m === 'input').length;
              const chosenOutputs = pm.filter(m => m === 'output').length;
              setInputCount(chosenInputs);
              rebuildPlcModel(chosenInputs, chosenOutputs);
            }
            setConfigConfirmed(true);
            setIsEditing(false);
          }}
          onConfirm={async () => { await handleConfigConfirm(); setIsEditing(false); }}
        />
      </Box>
    </DndProvider>
  );
}

export default PLCApp;