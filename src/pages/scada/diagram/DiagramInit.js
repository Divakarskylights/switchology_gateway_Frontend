import * as go from "gojs";
import { addNodeTemplates } from './Diagram_Components/NodeTemplate';
import { updateAnimation as importedUpdateAnimation } from './DiagramAnimations.js';

let animationEffectsDefined = false;

export const InitDiagram = (goInstance, initProps) => {
  const {
    theme,    nodeDataArray,    linkDataArray,
    modelData,    isEditMode,
    onShapeDoubleClickCallback,
    onNodeMouseEnter,    onNodeMouseLeave,
    handleToggleDevice,    setIsDiagramDirty,
    updateAnimation 
  } = initProps;

  const $ = goInstance.GraphObject.make;

  if (!animationEffectsDefined) {
    try {
      if (goInstance.AnimationManager && typeof goInstance.AnimationManager.defineAnimationEffect === 'function') {
        goInstance.AnimationManager.defineAnimationEffect('waves', (obj, startValue, endValue, easing, currentTime, duration, animation) => {
          if (obj && typeof obj.parameter1 !== 'undefined') {
            let value = easing(currentTime, startValue, endValue - startValue, duration);
            obj.parameter1 = value;
          }
        });
        goInstance.AnimationManager.defineAnimationEffect('offset', (obj, startValue, endValue, easing, currentTime, duration, animation) => {
          if (obj && typeof obj.alignment !== 'undefined') {
            let value = easing(currentTime, startValue, endValue - startValue, duration);
            obj.alignment = new goInstance.Spot(0, 0, value, 0);
          }
        });
        animationEffectsDefined = true;
      } else {
        // console.warn("[DiagramInit] goInstance.AnimationManager.defineAnimationEffect is not available.");
      }
    } catch (e) {
      console.error("[DiagramInit] Error defining custom animation effects:", e);
    }
  }

  const diagram = $(goInstance.Diagram, {
    'undoManager.isEnabled': true,
    'animationManager.initialAnimationStyle': goInstance.AnimationManager.None,
    // Properties set based on isEditMode
    isReadOnly: !isEditMode,
    allowMove: isEditMode,
    allowCopy: false, // Typically false for SCADA
    allowDelete: isEditMode,
    allowLink: isEditMode,
    allowRelink: isEditMode,
    allowReshape: isEditMode,
    allowTextEdit: isEditMode, // For editable TextBlocks in nodes
    allowSelect: true, // Selection should always be possible

      // Add validation to prevent meter-to-meter connections
      // "linkingTool.linkValidation": (fromnode, fromport, tonode, toport) => {
        // Prevent linking from meter node to meter node
        // if (fromnode && tonode && 
        //     fromnode.category === 'MeterNode' && 
        //     tonode.category === 'MeterNode') {
        //   // console.log("[DiagramInit] Prevented meter-to-meter connection");
        //   return false;
        // }
      //   return true;
      // },
      
      // Also prevent relinking to create meter-to-meter connections
      // "relinkingTool.linkValidation": (fromnode, fromport, tonode, toport) => {
        // Prevent relinking to create meter-to-meter connections
        // if (fromnode && tonode && 
        //     fromnode.category === 'MeterNode' && 
        //     tonode.category === 'MeterNode') {
          // console.log("[DiagramInit] Prevented meter-to-meter relinking");
          // return false;
        // }
        // return true;
      // }
  });

  // console.log(`[DiagramInit] Diagram properties after initial set: isReadOnly=${diagram.isReadOnly}, allowMove=${diagram.allowMove}`);

  if (diagram.grid) {
    diagram.grid.visible = isEditMode;
    // const gridStroke = theme?.palette?.divider || "lightgray";
    // diagram.grid.gridCellSize = new goInstance.Size(20, 20);
    // diagram.grid.element = $(goInstance.Panel, "Grid",
    //   $(goInstance.Shape, "LineH", { stroke: gridStroke, strokeWidth: 0.5 }),
    //   $(goInstance.Shape, "LineV", { stroke: gridStroke, strokeWidth: 0.5 })
    // );

    // Enable grid snapping for move and resize in edit mode
    if (diagram.toolManager) {
      if (diagram.toolManager.draggingTool) diagram.toolManager.draggingTool.isGridSnapEnabled = isEditMode;
      if (diagram.toolManager.resizingTool) diagram.toolManager.resizingTool.isGridSnapEnabled = isEditMode;
    }
  }
  // console.log(`[DiagramInit] Grid visibility set to: ${diagram.grid?.visible}`);

  if (diagram.toolManager) {
    if (diagram.toolManager.draggingTool) diagram.toolManager.draggingTool.isEnabled = isEditMode;
    if (diagram.toolManager.linkingTool) diagram.toolManager.linkingTool.isEnabled = isEditMode;
    if (diagram.toolManager.relinkingTool) diagram.toolManager.relinkingTool.isEnabled = isEditMode;
    if (diagram.toolManager.resizingTool) diagram.toolManager.resizingTool.isEnabled = isEditMode;
    if (diagram.toolManager.dragSelectingTool) diagram.toolManager.dragSelectingTool.isEnabled = isEditMode;
    if (diagram.toolManager.clickSelectingTool) diagram.toolManager.clickSelectingTool.isEnabled = true; // Always allow clicking to select
    // console.log(`[DiagramInit] Tool states: draggingTool.isEnabled=${diagram.toolManager.draggingTool?.isEnabled}, linkingTool.isEnabled=${diagram.toolManager.linkingTool?.isEnabled}`);
  }

  // Add node templates AFTER diagram is created and BEFORE model is set
  // Pass the current isEditMode and the correct callback
  addNodeTemplates(
    $,
    goInstance,
    diagram,
    onShapeDoubleClickCallback,
    onNodeMouseEnter,
    onNodeMouseLeave,
    isEditMode, // Pass current isEditMode here
handleToggleDevice
  );
  // console.log("[DiagramInit] Node templates added. nodeTemplateMap keys:", Array.from(diagram.nodeTemplateMap.keys()));

  diagram.addModelChangedListener((e) => {
    if (e.isTransactionFinished) {
      if (diagram.isModified) {
        console.log("Diagram modified:", e.model.nodeDataArray);
        setIsDiagramDirty(true)
        // You can trigger a state update here if using React
      }
    }
  });
  diagram.linkTemplate =
    $(goInstance.Link,
      {
        routing: goInstance.Routing.AvoidsNodes,
        curve: goInstance.Curve.JumpGap,
        corner: 10,
        reshapable: isEditMode,
        relinkableFrom: isEditMode,
        relinkableTo: isEditMode,
        toShortLength: 7,
        selectable: isEditMode,
        selectionAdorned: true
      },
      new goInstance.Binding("points").makeTwoWay(),
      // Bottom layer - black outline
      $(goInstance.Shape, {
        isPanelMain: true,
        stroke: "black",
        strokeWidth: 7
      }),
      // White stroke layer for dotted pattern
      // $(goInstance.Shape, {
      //   isPanelMain: true,
      //   stroke: "#FFFFFF",
      //   strokeWidth: 6,
      //   name: 'WHITE_STROKE'
      // }),
      // Middle layer - grey
      $(goInstance.Shape, {
        isPanelMain: true,
        stroke: theme?.palette?.grey?.[400] || "#aaa",
        strokeWidth: 7
      }),
      // Top layer - animated pipe with dashed pattern
      $(goInstance.Shape, {
        isPanelMain: true,
        stroke: theme?.palette?.primary?.main || "dodgerblue",
        strokeWidth: 5,
        name: 'PIPE', // This is crucial for animation to find it
        strokeDashArray: [10, 10],
        strokeDashOffset: 0 // Initialize the offset
      }),
      // Arrow head
      $(goInstance.Shape, { 
        toArrow: 'Triangle', 
        fill: theme?.palette?.grey?.[700] || 'black', 
        stroke: null, 
        scale: 1.5 
      }),
      // Label panel
      $(goInstance.Panel, "Auto", { visible: false },
        new goInstance.Binding("visible", "text", (value) => (value && value !== '')),
        $(goInstance.Shape, { 
          fill: "rgba(255, 255, 255, 0.9)", 
          stroke: "black", 
          strokeDashArray: [10, 10] 
        }),
        $(goInstance.TextBlock, { 
          stroke: "black", 
          margin: 3, 
          font: 'bold 9pt sans-serif' 
        },
          new goInstance.Binding("text")
        )
      )
    );

  // Add a model change listener to update link styles
  let isUpdatingStyles = false;
  diagram.addModelChangedListener((e) => {
    if (e.isTransactionFinished && !isUpdatingStyles) {
      isUpdatingStyles = true;
      try {
        // Check for and remove any meter-to-meter connections that might exist
        const linksToRemove = [];
        diagram.links.each(link => {
          const fromNode = link.fromNode;
          const toNode = link.toNode;
          
          // if (fromNode && toNode && 
          //     fromNode.category === 'MeterNode' && 
          //     toNode.category === 'MeterNode') {
          //   // console.warn("[DiagramInit] Found invalid meter-to-meter connection, marking for removal");
          //   linksToRemove.push(link);
          // }
        });
        
        // Remove invalid links
        if (linksToRemove.length > 0) {
          diagram.startTransaction("remove invalid meter-to-meter links");
          linksToRemove.forEach(link => {
            diagram.remove(link);
          });
          diagram.commitTransaction("remove invalid meter-to-meter links");
        }
        
        // Update styles for all links within a transaction
        diagram.startTransaction("update link styles");
        diagram.links.each(link => {
          const fromNode = link.fromNode;
          const toNode = link.toNode;
          if (fromNode && toNode) {
            const isMeterToGeneric = 
              (fromNode.category === 'MeterNode' && toNode.category !== 'MeterNode') ||
              (fromNode.category !== 'MeterNode' && toNode.category === 'MeterNode');

            const pipeShape = link.findObject("PIPE");
            if (pipeShape) {
              if (isMeterToGeneric) {
                // Style for Meter to Generic node connection - Black and White dotted pattern
                pipeShape.strokeDashArray = [10, 10];  // Smaller dots for better visibility
                pipeShape.strokeWidth = 6;
                pipeShape.stroke = "#000000";  // Black color
                
                // Add a white stroke underneath for the dotted effect
                const whiteStroke = link.findObject("WHITE_STROKE");
                if (whiteStroke) {
                  whiteStroke.strokeDashArray = [3, 3];
                  whiteStroke.strokeWidth = 8;  // Slightly thicker to show white between dots
                  whiteStroke.stroke = "#FFFFFF";  // White color
                }
              } else {
                // Style for Generic to Generic node connection
                pipeShape.strokeDashArray = [10, 10];  // Original dashed pattern
                pipeShape.strokeWidth = 5;
                pipeShape.stroke = theme?.palette?.primary?.main || "dodgerblue";  // Original blue color
                // Reset white stroke if it exists
                const whiteStroke = link.findObject("WHITE_STROKE");
                if (whiteStroke) {
                  whiteStroke.strokeDashArray = null;
                  whiteStroke.strokeWidth = 0;
                }
              }
            }
          }
        });
        diagram.commitTransaction("update link styles");
      } finally {
        isUpdatingStyles = false;
      }
    }
  });

  // Configure model to remember exact ports used for each link
  const graphLinksModel = new goInstance.GraphLinksModel({
    nodeDataArray: nodeDataArray || [],
    linkDataArray: linkDataArray || [],
    modelData: { // i am passing the triggerPasswordDialog to the diagram page to use it in the relay toggle switch
      ...modelData || {},
      triggerPasswordDialog: (description, onConfirmExecute, actionType = 'genericAction', payload = null) => {
        if (modelData && modelData.triggerPasswordDialog) {
          modelData.triggerPasswordDialog(description, onConfirmExecute, actionType, payload);
        }
      }
    },
    linkKeyProperty: 'key'
  });
  // Persist the specific ports chosen when creating links
  graphLinksModel.linkFromPortIdProperty = 'fromPort';
  graphLinksModel.linkToPortIdProperty = 'toPort';
  diagram.model = graphLinksModel;

  // Add listener for link creation
  diagram.addDiagramListener("LinkDrawn", (e) => {
    // Update animation when a new link is drawn
    // console.log("[DiagramInit] Link drawn, updating animation");
    setTimeout(() => {
      importedUpdateAnimation(goInstance, diagram);
    }, 100);
  });

  // Add listener for link relinking
  diagram.addDiagramListener("LinkRelinked", (e) => {
    // Update animation when a link is relinked
    // console.log("[DiagramInit] Link relinked, updating animation");
    setTimeout(() => {
      importedUpdateAnimation(goInstance, diagram);
    }, 100);
  });

  // Function to fit diagram to page
  const fitDiagramToPage = (diagram) => {
    if (!isEditMode) {  // Only auto-fit in view mode
      // Wait for the diagram to be fully initialized
      setTimeout(() => {
        if (diagram.nodes.count > 0) {
          diagram.zoomToFit();
          // Add some padding around the diagram
          const padding = 50;
          const bounds = diagram.documentBounds;
          diagram.scale = Math.min(
            (diagram.viewportBounds.width - padding * 2) / bounds.width,
            (diagram.viewportBounds.height - padding * 2) / bounds.height
          );
          // Center the diagram
          diagram.centerRect(bounds);
        }
      }, 100);
    }
  };

 // Wait for the diagram to be fully initialized before starting animations
 diagram.addDiagramListener("InitialLayoutCompleted", (e) => {
  // console.log("[DiagramInit] InitialLayoutCompleted event fired, calling updateAnimation");
  // Use a small delay to ensure everything is rendered
  setTimeout(() => {
    importedUpdateAnimation(goInstance, diagram);
    fitDiagramToPage(diagram);  // Add auto-fit after animation update
  }, 100);
});

// Also call animation update immediately in case InitialLayoutCompleted doesn't fire
// (e.g., when there are no nodes/links initially)
setTimeout(() => {
  // console.log("[DiagramInit] Calling updateAnimation with timeout fallback");
  importedUpdateAnimation(goInstance, diagram);
  fitDiagramToPage(diagram);  // Add auto-fit after animation update
}, 200);


  // Add a no-op destroy method to satisfy gojs-react if it's expecting it
  diagram.destroy = () => {
    // console.log("[DiagramInit] Custom 'destroy' method called on GoJS Diagram instance.");
  };

  // console.log(`[DiagramInit] Forcing diagram update and tool reset due to isEditMode: ${isEditMode}`);
  diagram.requestUpdate();
  if (diagram.toolManager) {
    diagram.toolManager.doMouseUp(); // This can help reset the current tool's state
  }

  // console.log("[DiagramInit] InitDiagram finished.");
  return diagram;
};