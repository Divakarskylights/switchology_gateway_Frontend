import React, {
  useEffect,
  useRef,
  useCallback,
  useImperativeHandle,
  useState,
  memo,
  forwardRef,
} from "react";
import { ReactDiagram, ReactOverview } from "gojs-react"; // Added ReactOverview
import * as go from "gojs";
import { toast } from "react-toastify";
import { useDrop } from "react-dnd";
import { Box, CircularProgress, IconButton, alpha } from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import { FitScreen } from "@mui/icons-material";
import { InitDiagram } from "./DiagramInit.js";
import { updateAnimation as importedUpdateAnimation } from "./DiagramAnimations.js"; // Renamed to avoid conflict
import ToolbarComponent from "./ToolbarComponent.jsx"; // Assuming ToolbarComponent is correctly implemented

const DiagramWithDnDInner = forwardRef((props, ref) => {
  const {
    nodeDataArray,
    linkDataArray,
    modelData,
    automationRules,
    onModelChange,
    onNodeDropped,
    onNodesDeleted,
    isEditMode,
    onToggleEditMode,
    onSaveDiagram,
    onDeleteDiagram,
    onUndo,
    onRedo,
    isDiagramDirty,
    setIsDiagramDirty,
    onShapeDoubleClickCallback,
    theme,
    handleToggleDevice,
    role,
  } = props;

  const diagramRefInternal = useRef(null);
  const diagramContainerRef = useRef(null);
  const [paletteNodeCounter, setPaletteNodeCounter] = useState(0);
  const [isDiagramInitialized, setIsDiagramInitialized] = useState(false);
  const [mainDiagramInstance, setMainDiagramInstance] = useState(null); // State for main diagram instance

  const memoizedUpdateAnimation = useCallback((currentDiagram) => {
    if (currentDiagram) {
      importedUpdateAnimation(go, currentDiagram); // Pass the global go object
    }
  }, []);

  const initDiagramCallback = useCallback(() => {
    const diagram = InitDiagram(go, {
      theme,
      nodeDataArray,
      linkDataArray,
      modelData,
      automationRules,
      isEditMode,
      onShapeDoubleClickCallback,
      setIsDiagramDirty,
      handleToggleDevice,
      updateAnimation: memoizedUpdateAnimation,
    });
    setMainDiagramInstance(diagram); // Set the main diagram instance for the Overview
    return diagram;
  }, [
    theme,
    nodeDataArray,
    linkDataArray,
    modelData,
    isEditMode,
    onShapeDoubleClickCallback,
    handleToggleDevice,
    memoizedUpdateAnimation,
  ]);

  const initOverviewCallback = useCallback(() => {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview, {
      observed: mainDiagramInstance,
      scale: 0.5,
      drawsGrid: false,
    });

    if (overview.box && overview.box.selectionObject) {
      overview.box.selectionObject.stroke = "#BF2018"; // Dark red stroke
      overview.box.selectionObject.strokeWidth = 0.2;
    }
    return overview;
  }, []);

  useImperativeHandle(
    ref,
    () => ({
      getDiagram: () => diagramRefInternal.current?.getDiagram(),
      getDiv: () => diagramContainerRef.current,
    }),
    [],
  );

  useEffect(() => {
    const diagram = diagramRefInternal.current?.getDiagram();
    if (diagram) {
      setIsDiagramInitialized(true);
      const modelChangedListener = (e) => {
        if (onModelChange) onModelChange(e);
        if (e.isTransactionFinished) {
          memoizedUpdateAnimation(e.diagram);
        }
      };
      diagram.addModelChangedListener(modelChangedListener);

      const selectionDeletedListener = (e) => {
        const deletedNodeKeys = [];
        e.subject.each((part) => {
          if (part instanceof go.Node && part.data && part.data.key) {
            deletedNodeKeys.push(part.data.key);
          }
        });
        if (deletedNodeKeys.length > 0 && onNodesDeleted) {
          onNodesDeleted(deletedNodeKeys);
        }
      };
      diagram.addDiagramListener("SelectionDeleted", selectionDeletedListener);

      return () => {
        if (diagram?.removeModelChangedListener) {
          diagram.removeModelChangedListener(modelChangedListener);
        }
        if (diagram?.removeDiagramListener) {
          diagram.removeDiagramListener(
            "SelectionDeleted",
            selectionDeletedListener,
          );
        }
      };
    }
  }, [
    diagramRefInternal.current,
    onModelChange,
    onNodesDeleted,
    memoizedUpdateAnimation,
  ]);

  useEffect(() => {
    const diagram = diagramRefInternal.current?.getDiagram();
    if (!diagram || !diagram.model || automationRules === undefined) return;

    const currentModelData = diagram.model.modelData || {};
    const currentModelRules = currentModelData.automationRules || [];

    let needsUpdate = true;
    if (go.Utils && typeof go.Utils.deepCompare === "function") {
      needsUpdate = !go.Utils.deepCompare(
        currentModelRules,
        automationRules || [],
      );
    } else {
      // console.warn("DiagramWithDnD: go.Utils.deepCompare is not available. Comparing automationRules by stringify.");
      needsUpdate =
        JSON.stringify(currentModelRules) !==
        JSON.stringify(automationRules || []);
    }

    if (needsUpdate) {
      // console.log("DiagramWithDnD: automationRules prop changed. Updating GoJS modelData.");
      diagram.model.commit((m) => {
        if (!m.modelData) m.modelData = {};
        m.modelData.automationRules = automationRules || [];
      }, "updateAutomationRulesInModelData");
    }
  }, [automationRules, diagramRefInternal.current]);

  const [, drop] = useDrop({
    accept: "node",
    drop: (newNodeFromPalette, monitor) => {
      if (!newNodeFromPalette) {
        toast.error("Dropped item is undefined.");
        console.error(
          "DiagramWithDnD: Dropped item (newNodeFromPalette) is undefined.",
        );
        return;
      }
      if (!newNodeFromPalette.category) {
        toast.error("Dropped item is missing a category.");
        console.error(
          "DiagramWithDnD: Dropped item is missing a category. Item:",
          newNodeFromPalette,
        );
        return;
      }

      const diagram = diagramRefInternal.current?.getDiagram();
      const diagramDiv = diagram?.div;
      if (!diagram || !diagramDiv) {
        toast.error("Diagram not available for drop operation.");
        return;
      }

      const offset = monitor.getClientOffset();
      if (!offset) {
        toast.error("Could not determine drop location.");
        return;
      }

      const rect = diagramDiv.getBoundingClientRect();
      const docPoint = diagram.transformViewToDoc(
        new go.Point(offset.x - rect.left, offset.y - rect.top),
      );

      const gridSize = diagram.grid?.gridCellSize.width || 20;
      const nodeMinWidth = parseFloat(newNodeFromPalette.minWidth) || 100;
      const nodeMinHeight = parseFloat(newNodeFromPalette.minHeight) || 50;

      const finalX =
        Math.round((docPoint.x - nodeMinWidth / 2) / gridSize) * gridSize;
      const finalY =
        Math.round((docPoint.y - nodeMinHeight / 2) / gridSize) * gridSize;

      const counter = paletteNodeCounter;
      setPaletteNodeCounter((c) => c + 1);
      const newGeneratedKey = `${newNodeFromPalette.category}_${Date.now().toString(36)}_${counter}`;
      console.log("newNodeFromPalette:", newNodeFromPalette);

      const newNodeData = {
        key: newGeneratedKey,
        text: newNodeFromPalette.text || "New Node",
        size: `${nodeMinWidth} ${nodeMinHeight}`,
        loc: `${finalX} ${finalY}`,
        category: newNodeFromPalette.category,
        img: newNodeFromPalette.img || null,
        assignedRelayNo: null,
        ...(newNodeFromPalette.category === "MeterNode" && {
          meterId: newNodeFromPalette.meterDetails.slave_id,
          meterDetails: newNodeFromPalette.meterDetails || {},
        }),
      };

      // Add the node directly to the GoJS model
      diagram.model.commit((m) => {
        m.addNodeData(newNodeData);
      }, "add node from palette");

      // Notify parent component about the drop
      if (onNodeDropped) {
        console.log(
          "DiagramWithDnD: Calling onNodeDropped with newNodeData:",
          newNodeData,
          newNodeFromPalette,
        );
        onNodeDropped(newNodeData);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drop(node);
        diagramContainerRef.current = node;
      }}
      style={{
        flexGrow: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
        overflow: "hidden",
      }}
    >
      {/* {role === 'ADMIN' */}
      {true && (
        <ToolbarComponent
          isEditMode={isEditMode}
          onToggleEditMode={onToggleEditMode} // Ensure this prop name matches what ToolbarComponent expects
          isDiagramDirty={isDiagramDirty}
          onUndo={onUndo}
          onRedo={onRedo}
          onSaveDiagram={onSaveDiagram}
          onDeleteDiagram={onDeleteDiagram}
          theme={theme}
        />
      )}

      <Box
        sx={{
          flexGrow: 1,
          height: "calc(100% - 48px)", // Assuming dense toolbar height of 48px
          position: "relative", // For positioning the Overview
        }}
      >
        {!isDiagramInitialized && diagramContainerRef.current && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {diagramContainerRef.current && (
          <ReactDiagram
            key={isEditMode ? "edit-diagram-instance" : "view-diagram-instance"}
            ref={diagramRefInternal}
            initDiagram={initDiagramCallback}
            nodeDataArray={nodeDataArray}
            linkDataArray={linkDataArray}
            modelData={modelData}
            onModelChange={onModelChange}
            skipsDiagramUpdate={true} // Set to true to prevent React props from overriding GoJS model changes
            divClassName="diagram-component" // This is important for gojs-react
            style={{
              width: "100%",
              height: "100%",
              backgroundColor: "#EFE2DD",
              display: isDiagramInitialized ? "block" : "none",
            }}
          />
        )}
        {mainDiagramInstance && (
          <ReactOverview
            initOverview={initOverviewCallback}
            divClassName="overview-component"
            observedDiagram={mainDiagramInstance}
            style={{
              position: "absolute",
              top: "6px", // Position below toolbar, adjust as needed based on your ToolbarComponent height
              left: "7px",
              width: "175px", // Adjust size as needed
              height: "90px", // Adjust size as needed
              backgroundColor: alpha(theme.palette.background.paper, 1),
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: theme.shape.borderRadius,
              boxShadow: theme.shadows[3],
              zIndex: 10, // Ensure it's above the main diagram
            }}
          />
        )}
        <Box
          sx={{
            position: "absolute",
            top: 96,
            left: 52,
            zIndex: 100, // High value to ensure it's above other elements
            pointerEvents: "auto", // Ensure the Box receives pointer events
          }}
        >
          <IconButton
            onClick={() => {
              const diagram = diagramRefInternal.current?.getDiagram(); // Ensure diagram exists
              if (diagram) {
                diagram.commandHandler.increaseZoom();
              } else {
                console.error("Diagram is not initialized yet.");
              }
            }}
            size="small"
            aria-label="Zoom In"
            title="Zoom In"
            sx={{ paddingY: 0 }}
          >
            <ZoomInIcon sx={{ fontSize: 16, color: "#BF2018" }} />
          </IconButton>

          <IconButton
            onClick={() => {
              const diagram = diagramRefInternal.current?.getDiagram(); // Ensure diagram exists
              if (diagram) {
                diagram.commandHandler.decreaseZoom();
              } else {
                console.error("Diagram is not initialized yet.");
              }
            }}
            size="small"
            aria-label="Zoom Out"
            title="Zoom Out"
            sx={{ paddingY: 0 }}
          >
            <ZoomOutIcon sx={{ fontSize: 16, color: "#BF2018" }} />
          </IconButton>

          <IconButton
            onClick={() => {
              const diagram = diagramRefInternal.current?.getDiagram();
              if (diagram) {
                diagram.zoomToFit();
                diagram.centerRect(diagram.documentBounds);
                const currentScale = diagram.scale;
                const newScale = currentScale * 0.96; // Adjust the multiplier as needed.
                diagram.scale = newScale;
              } else {
                console.error("Diagram is not initialized yet.");
              }
            }}
            size="small"
            aria-label="Zoom Reset"
            title="Zoom Reset"
            sx={{ paddingY: 0 }}
          >
            <FitScreen sx={{ fontSize: 16, color: "#BF2018" }} />
          </IconButton>
        </Box>
      </Box>
    </div>
  );
});

export const DiagramWithDnD = memo(DiagramWithDnDInner);
