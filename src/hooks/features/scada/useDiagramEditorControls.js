// hooks/useDiagramEditorControls.js
import { useCallback } from 'react';
import { toast } from 'react-toastify';

export const useDiagramEditorControls = ({
  diagramRef,
  isEditMode,
  setIsEditMode,
  isDiagramDirty,
  setIsDiagramDirty,
  setIsConfirmEditModeDialogOpen,
  handleConfirmSaveDiagram,
  handleConfirmDeleteDiagram,
  fetchInitialDiagram,

}) => {


  const toggleEditMode = useCallback(() => {
    if (!isEditMode) {
      setIsConfirmEditModeDialogOpen(true);
    } else {
      setIsEditMode(false);
      if (isDiagramDirty) {
        toast.dismiss("editModeDisable")
        toast.info("Switched to View Mode. Save your changes if needed.", { toastId: "editModeDisable" });
      }
    }
  }, [isEditMode, isDiagramDirty]);

  const handleConfirmEnterEditMode = useCallback(() => {
    setIsEditMode(true);
    setIsConfirmEditModeDialogOpen(false);
    
    // Show toast only once
    toast.dismiss("editModeEnabled");
    toast.info("Edit Mode enabled.", { toastId: "editModeEnabled" });
  }, [setIsEditMode, setIsConfirmEditModeDialogOpen]);
  
  const handleCancelEnterEditMode = useCallback(() => {
    setIsConfirmEditModeDialogOpen(false);
  }, []);

  const handleUndo = useCallback(() => {
    const diagram = diagramRef.current?.getDiagram();
    if (diagram && diagram.undoManager.canUndo()) {
      diagram.undoManager.undo();
      setIsDiagramDirty(diagram.isModified);
    }
  }, [diagramRef, setIsDiagramDirty]);

  const handleRedo = useCallback(() => {
    const diagram = diagramRef.current?.getDiagram();
    if (diagram && diagram.undoManager.canRedo()) {
      diagram.undoManager.redo();
      setIsDiagramDirty(diagram.isModified);
    }
  }, [diagramRef, setIsDiagramDirty]);

  const onConfirmSaveHandler = useCallback(async () => {
    const diagram = diagramRef.current?.getDiagram();
    if (diagram) {
      await handleConfirmSaveDiagram(diagram);
    } else {
      toast.error("Diagram instance not available for saving.");
    }
  }, [diagramRef, handleConfirmSaveDiagram]);

  const onConfirmDeleteHandler = useCallback(async () => {
    const diagram = diagramRef.current?.getDiagram();
    await handleConfirmDeleteDiagram(diagram);
    if (fetchInitialDiagram) {
      await fetchInitialDiagram();
    }
  }, [diagramRef, handleConfirmDeleteDiagram, fetchInitialDiagram]);

  return {
    toggleEditMode,
    handleConfirmEnterEditMode,
    handleCancelEnterEditMode,
    handleUndo,
    handleRedo,
    onConfirmSaveHandler,
    onConfirmDeleteHandler
  };
};
