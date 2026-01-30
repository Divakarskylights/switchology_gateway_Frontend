import * as go from "gojs";
import { avoidNodeOverlap } from "./overlap.jsx";
import { createNodePorts } from "./NodePorts.jsx";
import { GlobalDiagram } from "../GlobalDiagram";

export function createMeterNodeTemplate(
  $,
  goInstance,
  onNodeMouseEnter,
  onNodeMouseLeave,
  isEditModeFromTemplate,
) {
  const meterConfig = GlobalDiagram.nodeDefinitions.meters[0];
  const minSize = new goInstance.Size(
    meterConfig.minWidth,
    meterConfig.minHeight,
  );
  const maxSize = new goInstance.Size(
    meterConfig.maxWidth,
    meterConfig.maxHeight,
  );

  const meterNodeTemplate = $(
    goInstance.Node,
    "Auto",
    {
      movable: isEditModeFromTemplate,
      selectionAdorned: false,
      resizable: false,
      dragComputation: avoidNodeOverlap,
      selectable: true,
      cursor: isEditModeFromTemplate ? "move" : "default",
      minSize: minSize,
      maxSize: maxSize,
      doubleClick: null,
      mouseEnter: (e, node) => {
        if (onNodeMouseEnter) onNodeMouseEnter(node.data, e.viewPoint);
      },
      mouseLeave: (e, node, next) => {
        if (onNodeMouseLeave) {
          const point = next?.documentPoint;
          let isStillOverNodeOrChildren = next && next.part === node;
          let isPointInsideNode = false;
          if (node.diagram && point && next) {
            try {
              isPointInsideNode = node.containsPoint(point);
            } catch (err) {
              /* ignore */
            }
          }
          if (!isStillOverNodeOrChildren && !isPointInsideNode) {
            onNodeMouseLeave();
          }
        }
      },
      background: "transparent",
    },
    new goInstance.Binding(
      "location",
      "loc",
      goInstance.Point.parse,
    ).makeTwoWay(goInstance.Point.stringify),
    new goInstance.Binding(
      "desiredSize",
      "size",
      goInstance.Size.parse,
    ).makeTwoWay(goInstance.Size.stringify),

    $(goInstance.Shape, "RoundedRectangle", {
      name: "METER_SHAPE",
      isPanelMain: true,
      fill: "#f2f2f2",
      stroke: null,
      strokeWidth: 1,
      fromLinkable: false,
      toLinkable: false,
      cursor: isEditModeFromTemplate ? "move" : "default",
    }),
    $(goInstance.Picture, {
      source: meterConfig.img,
      stretch: goInstance.GraphObject.Fill,
    }),
    $(
      goInstance.Panel,
      "Vertical",
      {
        alignment: goInstance.Spot.Center,

        stretch: goInstance.GraphObject.Fill,
        margin: new goInstance.Margin(30, 0, 0, 0),
      }, // this panel wraps all internal text/info

      // Meter Name
      $(
        goInstance.TextBlock,
        {
          font: "bold 10pt sans-serif",
          stroke: "red",
          textAlign: "center",
          wrap: goInstance.Wrap.Fit,
          editable: false,
          maxLines: 2,
          alignment: goInstance.Spot.Center,
        },
        new goInstance.Binding("text", "text"),
      ),

      // Meter ID
      $(
        goInstance.TextBlock,
        {
          font: "9pt sans-serif",
          stroke: "red",
          textAlign: "center",
          wrap: goInstance.Wrap.Fit,
          editable: false,
          alignment: goInstance.Spot.Center,
          margin: new goInstance.Margin(2, 0, 8, 0),
        },
        new goInstance.Binding("text", "meterId", (val) => {
          return val;
        }),
      ),
     
    ),
      ...createNodePorts($, goInstance, isEditModeFromTemplate)
  );

  meterNodeTemplate.toolTip = $(
    goInstance.Adornment,
    "Auto",
    $(goInstance.Shape, "RoundedRectangle", {
      fill: "whitesmoke",
      stroke: "gray",
      strokeWidth: 0.5,
    }),
    $(
      goInstance.TextBlock,
      { margin: 5, stroke: "black", font: "9pt sans-serif", textAlign: "left" },
      new goInstance.Binding("text", "", (data) => {
        const meterLabel = data.text || "N/A";
        const meterIdVal = data.meterId || "N/A";
        return `Meter: ${meterLabel}\nID: ${meterIdVal}\n`;
      }),
    ),
  );

  return meterNodeTemplate;
}
