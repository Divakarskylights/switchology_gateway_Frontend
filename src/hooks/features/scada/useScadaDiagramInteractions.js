import { useState, useCallback, useEffect } from "react";
import {
  GET_SINGLE_SCADA_DIAGRAM_MODEL,
  INSERT_SINGLE_SCADA_DIAGRAM,
  UPDATE_SINGLE_SCADA_DIAGRAM,
  DELETE_SINGLE_SCADA_DIAGRAM,
  DELETE_SCADA_DIAGRAM_BY_ID,
} from "../../../services/query";
import { toast } from "react-toastify";
import useActivityLogStore from "../../../redux/store/useActivityLogStore";
import { SINGLE_SCADA_DIAGRAM_NAME } from "../../../services/query"; // Ensure this is correctly imported
import { graphqlClient } from "../../../services/client";
import { configInit } from "../../../components/layout/globalvariable";

export const useScadaDiagramInteractions = (
  initialNodeDataArrayProp,
  initialLinkDataArrayProp,
  initialModelDataProp,
  fetchInitialDiagramDataCallback, // Callback to refetch diagram model - MOVED UP
  diagramRef, // The ref to the ReactDiagram component - MOVED UP
) => {
  const [nodeDataArray, setNodeDataArray] = useState(
    initialNodeDataArrayProp || [],
  );
  const [linkDataArray, setLinkDataArray] = useState(
    initialLinkDataArrayProp || [],
  );
  const [modelData, setModelData] = useState(
    initialModelDataProp || { id: null, name: "", description: "" },
  );

  const [isDiagramDirty, setIsDiagramDirty] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isSaveDiagramDialogOpen, setIsSaveDiagramDialogOpen] = useState(false);
  const [diagramNameInput, setDiagramNameInput] = useState(
    initialModelDataProp?.name,
  );
  const [diagramDescriptionInput, setDiagramDescriptionInput] = useState(
    initialModelDataProp?.description || "",
  );
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { addLogEntry } = useActivityLogStore();

  // Effect to update local state when initial props change
  useEffect(() => {
    setNodeDataArray(initialNodeDataArrayProp || []);
    setLinkDataArray(initialLinkDataArrayProp || []);
    setModelData(initialModelDataProp || {});
    setDiagramNameInput(initialModelDataProp?.name);
    setDiagramDescriptionInput(initialModelDataProp?.description || "");
    setIsDiagramDirty(false);
  }, [
    initialNodeDataArrayProp,
    initialLinkDataArrayProp,
    initialModelDataProp,
  ]);

  const handleModelChange = useCallback(
    (event) => {
      const diagram = event.diagram;
      if (
        diagram &&
        diagram.model &&
        event.isTransactionFinished &&
        isEditMode
      ) {
        const currentNodes = diagram.model.nodeDataArray.slice();
        const currentLinks = diagram.model.linkDataArray.slice();

        // Always update React state with the current diagram state to keep them in sync
        setNodeDataArray(currentNodes);
        setLinkDataArray(currentLinks);

        if (
          diagram.model.modelData &&
          diagram.model.modelData.description !== modelData.description
        ) {
          setModelData((prev) => ({
            ...prev,
            description: diagram.model.modelData.description,
          }));
        }
        setIsDiagramDirty(true);
      }
    },
    [isEditMode, modelData.description],
  ); // Removed nodeDataArray and linkDataArray from dependencies

  const handleNodeDropped = useCallback(
    (newNodeData) => {
      // Don't update React state directly - let the model change handler do it
      // This prevents conflicts between React state and GoJS model state
      if (isEditMode) setIsDiagramDirty(true);
    },
    [isEditMode],
  );

  const handleNodesDeleted = useCallback(
    (deletedNodeKeys) => {
      if (deletedNodeKeys && deletedNodeKeys.length > 0) {
        setNodeDataArray((prevNodes) =>
          prevNodes.filter((node) => !deletedNodeKeys.includes(node.key)),
        );
        setLinkDataArray((prevLinks) =>
          prevLinks.filter(
            (link) =>
              !deletedNodeKeys.includes(link.from) &&
              !deletedNodeKeys.includes(link.to),
          ),
        );
        if (isEditMode) setIsDiagramDirty(true);
      }
    },
    [isEditMode],
  );

  const handleOpenSaveDialog = useCallback(() => {
    if (!isEditMode) {
      toast.info("Switch to Edit Mode to save the diagram.");
      return;
    }
    if (!isDiagramDirty) {
      toast.info("No changes to save.");
      return;
    }
    // console.log("modelData", modelData);
    setDiagramNameInput(modelData.name);
    setDiagramDescriptionInput(modelData.description || "");
    setIsSaveDiagramDialogOpen(true);
  }, [isEditMode, isDiagramDirty, modelData.description, modelData.name]);

  const handleConfirmSaveDiagram = useCallback(
    async (diagramInstanceFromCaller, currentAutomationRules) => {
      // Use diagramInstanceFromCaller which is passed from ScadaPage
      if (!diagramInstanceFromCaller || !diagramInstanceFromCaller.model) {
        toast.error("Diagram model not available for saving.");
        setIsSaveDiagramDialogOpen(false);
        return;
      }

      try {
        const modelJsonStr = diagramInstanceFromCaller.model.toJson();
        const parsedScadaModel = JSON.parse(modelJsonStr);
        console.log("Original model JSON:", modelJsonStr);
        console.log("Parsed SCADA model:", parsedScadaModel);

        let result;
        const updatedModelDataForSave = {
          id: modelData.id,
          name: diagramNameInput,
          description: diagramDescriptionInput,
          automationRules: currentAutomationRules || [], // Ensure automationRules is always an array
        };
        parsedScadaModel.modelData = updatedModelDataForSave;
        parsedScadaModel.linkKeyProperty = "key"; // Ensure this is set if your links have keys

        // const allDiagramData = await graphqlClient.request(
        //   GET_SINGLE_SCADA_DIAGRAM_MODEL,
        // );
        const allDiagramData = await fetch(
          `${configInit.appBaseUrl}/api/scada-diagrams`,
        ).then((r) => r.json());
        console.log("All diagram data:", allDiagramData);
        const existingDiagram = allDiagramData[0] || {};
        console.log("Existing diagram:", existingDiagram);
        // const existingDiagram = allDiagrams.find(
        //   (diag) => diag.name === diagramNameInput,
        // );

        if (existingDiagram.name === diagramNameInput) {
          console.log("Updating existing diagram");
          try {
            console.log(
              "Updating existing diagram with nodeId:",
              existingDiagram.nodeId || existingDiagram.id,
            );

            // Try using nodeId first, then fallback to id if nodeId doesn't exist
            const nodeIdToUse = existingDiagram.nodeId || existingDiagram.id;

            result = await fetch(
              `${configInit.appBaseUrl}/api/scada-diagrams/update/${nodeIdToUse}`,
              {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: diagramNameInput,
                  description: diagramDescriptionInput,
                  diagram_model_json: parsedScadaModel,
                }),
              },
            ).then((r) => r.json());

            console.log("Update operation result:", result);

            if (!result || !result.diagram_model_json) {
              console.error("Update operation returned null or empty result");
              console.error("This might indicate:");
              console.error(
                "1. Wrong nodeId format - expected Global ID, got:",
                nodeIdToUse,
              );
              console.error("2. Record doesn't exist with this nodeId");
              console.error("3. Permission issues");
              console.error("4. Required fields missing");

              // Try to get the correct nodeId format
              console.log("Existing diagram object:", existingDiagram);

              toast.error(
                "Update operation failed - check console for details",
              );
              setIsSaveDiagramDialogOpen(false);
              return;
            }
          } catch (error) {
            console.error("Update operation failed:", error);
            console.error("Error details:", error.response?.errors || error);
            console.error("Full error object:", JSON.stringify(error, null, 2));

            // If update fails, try to create a new one with a different name
            if (
              error.message.includes("duplicate") ||
              error.message.includes("unique")
            ) {
              toast.error(
                "A diagram with this name already exists. Please use a different name.",
              );
            } else {
              toast.error(
                "Failed to update SCADA diagram: " +
                  (error.response?.errors?.[0]?.message || error.message),
              );
            }
            setIsSaveDiagramDialogOpen(false);
            return;
          }
        } else {
          console.log("Creating new diagram");
          try {
            result = await fetch(
              `${configInit.appBaseUrl}/api/scada-diagrams/create`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  name: diagramNameInput,
                  description: diagramDescriptionInput,
                  diagram_model_json: parsedScadaModel, // object or JSON string
                }),
              },
            ).then((r) => r.json());

  
            console.log("Insert operation result:", result);
          } catch (error) {
            console.error("Insert operation failed:", error);
            toast.error(
              "Failed to create SCADA diagram: " +
                (error.response?.errors?.[0]?.message || error.message),
            );
            setIsSaveDiagramDialogOpen(false);
            return;
          }
        }

        console.log(
          "result",
          result,
          existingDiagram,
          "nodeDataArray:",
          diagramInstanceFromCaller.model.nodeDataArray,
          "linkDataArray:",
          diagramInstanceFromCaller.model.linkDataArray,
        );
        console.log("parsedScadaModel being saved:", parsedScadaModel);
        console.log(
          "diagramModelJson being saved:",
          JSON.stringify(parsedScadaModel),
        );

        if (!result?.id) {
          toast.error("Failed to save SCADA diagram model.");
          return;
        }

        setModelData((prev) => ({
          ...prev,
          id: result?.id,
          name: diagramNameInput,
          description: diagramDescriptionInput,
        }));
        setIsDiagramDirty(false);
        setIsSaveDiagramDialogOpen(false);
        setIsEditMode(false);

        toast.success(
          `SCADA diagram ${existingDiagram ? "updated" : "created"} successfully!`,
        );

        // Optionally refetch data to ensure UI is in sync
        if (fetchInitialDiagramDataCallback) {
          try {
            console.log("Refetching diagram data after successful save...");
            await fetchInitialDiagramDataCallback();
            console.log("Diagram data refetched successfully");

            // Force diagram to refresh and center the view
            if (diagramInstanceFromCaller) {
              diagramInstanceFromCaller.isModified = false;

              // Center and fit the diagram after successful save
              setTimeout(() => {
                try {
                  diagramInstanceFromCaller.zoomToFit();
                  console.log("Diagram centered with zoomToFit");
                } catch (zoomError) {
                  console.error("Error centering diagram:", zoomError);
                }
              }, 100); // Small delay to ensure the refetch has updated the visual elements
            }
          } catch (refetchError) {
            console.error("Error refetching diagram data:", refetchError);
            toast.warning(
              "Diagram saved but failed to refresh display. Please reload the page.",
            );
          }
        } else {
          console.warn(
            "fetchInitialDiagramDataCallback not available for refetch",
          );

          // Fallback: manually update the diagram if we have the instance
          if (diagramInstanceFromCaller) {
            diagramInstanceFromCaller.isModified = false;
            // Center the diagram even without refetch
            setTimeout(() => {
              try {
                diagramInstanceFromCaller.zoomToFit();
                console.log("Diagram centered with zoomToFit (fallback)");
              } catch (zoomError) {
                console.error("Error centering diagram:", zoomError);
              }
            }, 100);
          }
        }
      } catch (error) {
        console.error("SCADA save/sync error:", error);
        toast.error(
          "Failed to save diagram or sync devices. " +
            (error.response?.errors?.[0]?.message || error.message),
        );
      }
    },
    [
      modelData.id,
      diagramNameInput,
      diagramDescriptionInput,
      addLogEntry,
      setIsDiagramDirty,
      setModelData,
      setIsSaveDiagramDialogOpen,
      diagramRef,
      setNodeDataArray,
      fetchInitialDiagramDataCallback,
    ],
  );

  const handleDeleteDiagramRequest = useCallback(() => {
    if (!isEditMode) {
      toast.info("Switch to Edit Mode to clear the diagram.");
      return;
    }
    if (
      !modelData.id &&
      nodeDataArray.length === 0 &&
      linkDataArray.length === 0 &&
      !isDiagramDirty
    ) {
      toast.info("Diagram is already empty.");
      return;
    }
    setIsDeleteConfirmOpen(true);
  }, [
    isEditMode,
    modelData.id,
    nodeDataArray.length,
    linkDataArray.length,
    isDiagramDirty,
  ]);

  const handleConfirmDeleteDiagram = useCallback(
    async (diagramInstanceFromCaller, currentAutomationRules) => {
      try {
        // if (modelData.id) {
        //   await graphqlClient.request(DELETE_SCADA_DIAGRAM_BY_ID, {
        //     input: {
        //       id: modelData.id,
        //     },
        //   });
        //   toast.success("SCADA diagram deleted from database.");
        // }

        if (modelData.id) {
          await fetch(
            `${configInit.appBaseUrl}/api/scada-diagrams/delete/${modelData.id}`,
            {
              method: "DELETE",
            },
          ).then((r) => r.json());

          toast.success("SCADA diagram deleted from database.");
        }

        setNodeDataArray([]);
        setLinkDataArray([]);
        setModelData({
          id: null,
          name: configInit.single_scada_diagram_name,
          description: "",
        });
        setDiagramDescriptionInput("");
        if (diagramInstanceFromCaller)
          diagramInstanceFromCaller.isModified = false;
        setIsDiagramDirty(false);

        if (fetchInitialDiagramDataCallback) {
          await fetchInitialDiagramDataCallback();
        }
        toast.success("Local diagram canvas cleared.");
      } catch (error) {
        console.error(
          "Scada: Error deleting diagram or unassigning relays:",
          error,
        );
        toast.error(
          "Failed to clear diagram. " +
            (error.response?.errors?.[0]?.message || error.message),
        );
      } finally {
        setIsDeleteConfirmOpen(false);
      }
    },
    [
      modelData.id,
      addLogEntry,
      fetchInitialDiagramDataCallback,
      setIsDiagramDirty,
      setNodeDataArray,
      setLinkDataArray,
      setModelData,
      setDiagramNameInput,
      setDiagramDescriptionInput,
      setIsDeleteConfirmOpen,
    ],
  );

  return {
    nodeDataArray,
    setNodeDataArray,
    linkDataArray,
    setLinkDataArray,
    modelData,
    setModelData,
    isDiagramDirty,
    setIsDiagramDirty,
    isEditMode,
    setIsEditMode,
    isSaveDiagramDialogOpen,
    setIsSaveDiagramDialogOpen,
    diagramNameInput,
    setDiagramNameInput,
    diagramDescriptionInput,
    setDiagramDescriptionInput,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    handleModelChange,
    handleNodeDropped,
    handleNodesDeleted,
    handleOpenSaveDialog,
    handleConfirmSaveDiagram,
    handleDeleteDiagramRequest,
    handleConfirmDeleteDiagram,
  };
};
