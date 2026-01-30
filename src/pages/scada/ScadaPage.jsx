import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  Box, CircularProgress, Typography,
  useTheme, Grow, Paper, Fade,
} from '@mui/material';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'react-toastify';
import axios from 'axios';
import SaveDiagramDialog from './components/SaveDiagramDialog';
import ConfirmEditModeDialog from './components/ConfirmEditModeDialog';
import ClearDiagramDialog from './components/ClearDiagramDialog';
import SetupPasswordDialog from '../../features/setup/components/SetupPasswordDialog';
import useActivityLogStore from '../../redux/store/useActivityLogStore';
import useAdminPasswordStore from '../../redux/store/useAdminPasswordStore';
import { configInit } from '../../components/layout/globalvariable';
import { useScadaDataFetching } from './hooks/useScadaDataFetching';
import { useScadaDiagramInteractions } from './hooks/useScadaDiagramInteractions';
import { useDiagramEditorControls } from './hooks/useDiagramEditorControls';
import { DiagramWithDnD } from './diagram/DiagramWithDnD';
import NodePalette from './components/MainPalette';
import useRole from '../../redux/store/useRole';

export function ScadaDiagram() {
  const theme = useTheme();
  const [loaded, setLoaded] = useState(false);
  const diagramRef = useRef(null);
  const { addLogEntry } = useActivityLogStore();
  const { adminPassword, fetchAdminPassword } = useAdminPasswordStore();
  const { role } = useRole();
  const {
    configuredMeters,
    loadingMeters,
    initialNodeDataArray,
    initialLinkDataArray,
    initialModelData,
    loadingInitialDiagram,
    fetchInitialDiagram,
  } = useScadaDataFetching();

  const [localNodeDataArrayState, setLocalNodeDataArrayState] = useState([]);
  const [isConfirmEditModeDialogOpen, setIsConfirmEditModeDialogOpen] = useState(false);
  const [isPasswordConfirmOpen, setIsPasswordConfirmOpen] = useState(false);
  const [pendingActionContext, setPendingActionContext] = useState({
    actionType: null,
    description: '',
    onConfirmExecute: null,
    payload: null,
  });
  const {
    nodeDataArray, linkDataArray,
    modelData, isDiagramDirty, setIsDiagramDirty,
    isEditMode, setIsEditMode,
    isSaveDiagramDialogOpen, setIsSaveDiagramDialogOpen,
    diagramNameInput, setDiagramNameInput,
    diagramDescriptionInput, setDiagramDescriptionInput,
    isDeleteConfirmOpen, setIsDeleteConfirmOpen,
    handleModelChange, handleNodeDropped,
    handleNodesDeleted, handleOpenSaveDialog,
    handleConfirmSaveDiagram, handleDeleteDiagramRequest,
    handleConfirmDeleteDiagram,
  } = useScadaDiagramInteractions(
    initialNodeDataArray, initialLinkDataArray,
    initialModelData, fetchInitialDiagram, diagramRef, // Pass the ref here
  );

  const {
    toggleEditMode, handleConfirmEnterEditMode, handleCancelEnterEditMode,
    memoizedOnShapeDoubleClickCallback, handleUndo, handleRedo, onConfirmSaveHandler,
    onConfirmDeleteHandler
  } = useDiagramEditorControls({
    diagramRef, isEditMode, setIsEditMode, isDiagramDirty,
    setIsDiagramDirty, setIsConfirmEditModeDialogOpen,
    handleConfirmSaveDiagram, handleConfirmDeleteDiagram, fetchInitialDiagram
  });

  useEffect(() => {
    setLocalNodeDataArrayState(nodeDataArray);
  }, [nodeDataArray]);


  useEffect(() => {
    setLoaded(true);
    fetchAdminPassword();
  }, [fetchAdminPassword]);


  const triggerPasswordConfirmation = useCallback((description, onConfirmExecute, actionType = 'genericAction', payload = null) => {
    if (!adminPassword) {
      fetchAdminPassword().then(() => {
        if (useAdminPasswordStore.getState().adminPassword) {
          setPendingActionContext({ description, onConfirmExecute, payload, actionType });
          setIsPasswordConfirmOpen(true);
        } else {
          toast.error("Admin password not loaded. Cannot confirm action.");
        }
      });
      return;
    }
    setPendingActionContext({ description, onConfirmExecute, payload, actionType });
    setIsPasswordConfirmOpen(true);
  }, [adminPassword, fetchAdminPassword]);

  const executeToggleDevice = async (actionPayload) => {
    const { deviceKey, newStatus } = actionPayload;
    const diagram = diagramRef.current?.getDiagram();
    if (!diagram) {
      toast.error("Diagram not ready.");
      return;
    }
    const node = diagram.findNodeForKey(deviceKey);
    if (!node || !node.data) {
      toast.error("Device node not found in diagram.");
      return;
    }
    const deviceData = node.data;
    const relayNumber = deviceData.assignedRelayNo;

    if (relayNumber == null) {
      toast.error(`Device "${deviceData.text || 'Unnamed Shape'}" does not have an output relay assigned.`);
      return;
    }

    try {
      await axios.post(`${configInit.appBaseUrl}/v1/api/control-relay`, {
        relayNumber,
        action: newStatus ? 'on' : 'off',
      });
      addLogEntry({ source: 'Manual Control', item_type: 'SCADA Shape', item_id: String(deviceKey), item_name: deviceData.text || 'Unnamed Shape', action: `Output ${newStatus ? 'ON' : 'OFF'} command sent`, details: `Relay ${relayNumber} instructed.` });

      diagram.model.commit(m => {
        m.set(node.data, "status", newStatus);
      }, "toggle SCADA device status");

      toast.success(`Device "${deviceData.text || 'Unnamed Shape'}" toggle command sent.`);
    } catch (error) {
      console.error('Error toggling SCADA device:', error);
      toast.error('Failed to toggle SCADA device.');
    }
  };

  const handleToggleDevice = (nodeKey, currentStatus) => {
    const diagram = diagramRef.current?.getDiagram();
    const node = diagram?.findNodeForKey(nodeKey);
    const nodeName = node?.data?.text || 'Unnamed Shape';
    const newStatus = !currentStatus;

    triggerPasswordConfirmation(
      `toggle SCADA shape "${nodeName}" output ${newStatus ? 'ON' : 'OFF'}`,
      () => executeToggleDevice({ deviceKey: nodeKey, newStatus }),
      'toggleScadaDevice',
      { deviceKey: nodeKey, newStatus }
    );
  };

  const handlePasswordConfirmation = async (enteredPassword) => {
    setIsPasswordConfirmOpen(false);
    const currentAdminPassword = useAdminPasswordStore.getState().adminPassword;
    if (enteredPassword === currentAdminPassword) {
      if (pendingActionContext && typeof pendingActionContext.onConfirmExecute === 'function') {
        try {
          await pendingActionContext.onConfirmExecute(pendingActionContext.payload);
        } catch (error) {
          console.error(`Error executing ${pendingActionContext.actionType}:`, error);
          toast.error(`Failed to execute action: ${error.message || 'Unknown error'}`);
        }
      }
    } else {
      toast.error("Incorrect password.");
    }
    setPendingActionContext({ actionType: null, description: '', onConfirmExecute: null, payload: null });
  };

  const isPageLoading = loadingMeters || loadingInitialDiagram;

  return (
    console.log("configuredMeters", configuredMeters),
    <Fade in={loaded} timeout={500}>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px - 16px)', p: { xs: 0.5, sm: 1 }, boxSizing: 'border-box' }}>
        {isPageLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, height: '100%' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading SCADA Data...</Typography>
          </Box>
        ) : (
          <DndProvider backend={HTML5Backend}>
            <Grow in={!isPageLoading} timeout={500} style={{ height: '100%' }}>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 1.5 },
                  width: '100%',
                  height: '100%',
                  flexGrow: 1,
                  boxSizing: 'border-box',
                }}
              >
                {isEditMode && (
                  <Paper
                    elevation={2}
                    sx={{
                      width: '220px',
                      flexShrink: 0,
                      height: '100%',
                      overflowY: 'auto',
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.grey[50],
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {loadingMeters ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                        <CircularProgress size={24} />
                        <Typography variant="caption" sx={{ ml: 1 }}>Loading Meters...</Typography>
                      </Box>
                    ) : (
                      <NodePalette meters={configuredMeters} />
                    )}
                  </Paper>
                )}
                <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', position: 'relative', backgroundColor: "#EFE2DD" }}>
                  <DiagramWithDnD
                    ref={diagramRef}
                    nodeDataArray={nodeDataArray}
                    linkDataArray={linkDataArray}
                    modelData={{ ...modelData }}
                    onModelChange={handleModelChange}
                    onNodeDropped={handleNodeDropped}
                    onNodesDeleted={handleNodesDeleted}
                    isEditMode={isEditMode}
                    onToggleEditMode={toggleEditMode}
                    onSaveDiagram={handleOpenSaveDialog}
                    onDeleteDiagram={handleDeleteDiagramRequest}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    isDiagramDirty={isDiagramDirty}
                    setIsDiagramDirty={setIsDiagramDirty}
                    theme={theme}
                    onShapeDoubleClickCallback={memoizedOnShapeDoubleClickCallback}
                    handleToggleDevice={handleToggleDevice}
                    role={role}
                  />
                </Box>
              </Box>
            </Grow>
          </DndProvider>
        )}

        <SaveDiagramDialog
          isOpen={isSaveDiagramDialogOpen}
          setIsSaveDiagramDialogOpen={setIsSaveDiagramDialogOpen}
          onConfirm={() => onConfirmSaveHandler(diagramRef.current?.getDiagram())}
          diagramNameInput={diagramNameInput}
          setDiagramNameInput={setDiagramNameInput}
          diagramDescriptionInput={diagramDescriptionInput}
          setDiagramDescriptionInput={setDiagramDescriptionInput}
        />

        <ClearDiagramDialog
          isOpen={isDeleteConfirmOpen}
          setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
          onConfirm={() => onConfirmDeleteHandler(diagramRef.current?.getDiagram())}
          hasModelId={!!modelData.id}
        />

        <ConfirmEditModeDialog
          isOpen={isConfirmEditModeDialogOpen}
          onClose={handleCancelEnterEditMode}
          onConfirm={handleConfirmEnterEditMode}
        />
        <SetupPasswordDialog
          open={isPasswordConfirmOpen}
          onClose={() => {
            setIsPasswordConfirmOpen(false);
            setPendingActionContext({ actionType: null, description: '', onConfirmExecute: null, payload: null });
          }}
          onConfirm={handlePasswordConfirmation}
          dialogType={pendingActionContext.actionType}
          actionDescription={pendingActionContext.description}
        />
      </Box>
    </Fade>
  );
}