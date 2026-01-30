
import * as go from "gojs";
import { GlobalDiagram } from "../GlobalDiagram.jsx";
import { avoidNodeOverlap } from "./overlap.jsx";
import { createNodePorts } from "./NodePorts.jsx";

export function createGenericNodeTemplate(
    shapeType, category, $, goInstance,
    onShapeDoubleClickCallback, onNodeMouseEnter,
    onNodeMouseLeave, initialImgSrc,
    isEditModeFromTemplate, handleToggleDevice
) {
    if (typeof shapeType !== 'string' || !shapeType) {
        console.error("createGenericNodeTemplate called with invalid shapeType:", shapeType, ". Defaulting to Rectangle.");
        shapeType = "Rectangle";
    }

    const shapeConfig = GlobalDiagram.nodeDefinitions.shapes.find(s => s.category === category);
    const minSize = new goInstance.Size(
        shapeConfig?.minWidth || 100, // Default minWidth if not found
        shapeConfig?.minHeight || 50  // Default minHeight if not found
    );
    const maxSize = new goInstance.Size(
        shapeConfig?.maxWidth || 500, // Default maxWidth
        shapeConfig?.maxHeight || 500 // Default maxHeight
    );

    const genericNodeTemplate =
        $(goInstance.Node, "Auto",
            {
                selectionAdorned: false,
                dragComputation: avoidNodeOverlap,
                doubleClick: (e, node) => {
                    if (onShapeDoubleClickCallback && node && node.data) {
                        onShapeDoubleClickCallback(node.data.key, node.data.assignedRelayNo, node.data.assignedInputRelayNo);
                    }
                },
                mouseEnter: (e, node) => { if (onNodeMouseEnter) onNodeMouseEnter(node.data, e.viewPoint); },
                mouseLeave: (e, node, next) => {
                    if (onNodeMouseLeave) {
                        const point = next?.documentPoint;
                        let isStillOverNodeOrChildren = next && next.part === node;
                        let isPointInsideNode = false;
                        if (node.diagram && point && next) {
                            try { isPointInsideNode = node.containsPoint(point); } catch (err) { /* ignore */ }
                        }
                        if (!isStillOverNodeOrChildren && !isPointInsideNode) {
                            onNodeMouseLeave();
                        }
                    }
                },
                movable: isEditModeFromTemplate,
                selectable: true,
                cursor: isEditModeFromTemplate ? "move" : "default",
                minSize: minSize,
                maxSize: maxSize,
                resizable: false,
                background: "transparent",
            },
            new goInstance.Binding("location", "loc", goInstance.Point.parse).makeTwoWay(goInstance.Point.stringify),
            new goInstance.Binding("desiredSize", "size", goInstance.Size.parse).makeTwoWay(goInstance.Size.stringify),

            $(goInstance.Shape, shapeType,
                {
                    name: "SHAPE",
                    isPanelMain: true,
                    fill: '#f2f2f2',
                    fromLinkable: false,
                    toLinkable: false,
                    cursor: isEditModeFromTemplate ? "move" : "default",
                    strokeWidth: 3,
                }
            ),

            $(goInstance.Panel, "Spot", // this is for the toggle switch 
                {
                    alignment: goInstance.Spot.Center,
                    margin: new goInstance.Margin(130, 60, 0, 0), // TOP RIGHT BOTTOM LEFT
                },
                new goInstance.Binding("visible", "assignedRelayNo", relayNo => relayNo != null && relayNo !== ''),
                $(goInstance.Shape, "Capsule",
                    {
                        width: 40,
                        height: 20,
                        fill: "lightgrey",
                        stroke: null,
                        cursor: "pointer",
                        click: (e, shape) => {
                            const node = shape.part;
                            console.log("e", e, node);

                            if (node && node.data && node.data.assignedRelayNo != null) {
                                // if (handleToggleDevice) {
                                handleToggleDevice(node.data.key, node.data.status);
                                // }
                            }
                        }
                    },
                    new goInstance.Binding("fill", "status", status => status ? "red" : "green")
                ),
                $(goInstance.Shape, "Circle",
                    {
                        width: 19,
                        height: 19,
                        fill: "white",
                        stroke: null,
                        alignment: goInstance.Spot.Left,
                        alignmentFocus: goInstance.Spot.Left,
                        margin: new goInstance.Margin(2, 0, 0, 2)
                    },
                    new goInstance.Binding("alignment", "status", status => status ? goInstance.Spot.Right : goInstance.Spot.Left),
                    new goInstance.Binding("alignmentFocus", "status", status => status ? goInstance.Spot.Right : goInstance.Spot.Left)

                )
            ),
            // ..................................................................................................................................

            $(goInstance.TextBlock,
                {
                    text: "Relay",
                    alignment: goInstance.Spot.Center,
                    margin: new goInstance.Margin(90, 60, 0, 0), // TOP RIGHT BOTTOM LEFT
                    font: "bold 10pt sans-serif",
                    stroke: "black",
                    editable: false
                },
                new goInstance.Binding("text", "assignedRelayNo", relayNo => (relayNo != null && relayNo !== '') ? "Relay: " + String(relayNo) : "Relay: N/A"),
                new goInstance.Binding("visible", "assignedRelayNo", relayNo => relayNo != null && relayNo !== '')
            ),
            $(goInstance.TextBlock,
                {
                    text: "Status",
                    alignment: goInstance.Spot.Center,
                    margin: new goInstance.Margin(90, 0, 0, 60), // TOP RIGHT BOTTOM LEFT
                    font: "bold 10pt sans-serif",
                    stroke: "black",
                    editable: false
                },
                new goInstance.Binding("visible", "assignedRelayNo", relayNo => relayNo != null && relayNo !== '')
            ),
            $(go.Shape, "Circle", {
                alignment: goInstance.Spot.Center,
                margin: new goInstance.Margin(130, 0, 0, 60), // TOP RIGHT BOTTOM LEFT
                desiredSize: new go.Size(20, 20),
                stroke: null,
                fill: "red" // default is red, only change to green when status is true
            },
                new goInstance.Binding("fill", "status", status => !status ? "green" : "red"),
                new goInstance.Binding("visible", "assignedRelayNo", relayNo => relayNo != null && relayNo !== '')
            ),

            // Content panel (Image and Main Text)
            $(goInstance.Panel, "Vertical",
                { margin: new goInstance.Margin(30, 0, 0, 0) },
                $(goInstance.Picture,
                    {
                        width: 90, height: 90,
                        margin: new goInstance.Margin(0, 0, 10, 0), // Added bottom margin to separate from text
                        source: initialImgSrc || "",
                    },
                    new goInstance.Binding("source", "img", imgPath => imgPath || ""),
                    new goInstance.Binding("visible", "img", actualImgPath => !!actualImgPath)
                ),
                $(goInstance.TextBlock,
                    {
                        font: "Bold 9pt sans-serif", stroke: "black",
                        textAlign: "center", wrap: goInstance.Wrap.Fit,
                        margin: new goInstance.Margin(0, 0, 80, 0),// TOP RIGHT BOTTOM LEFT
                        editable: isEditModeFromTemplate, // Make editable based on edit mode
                        isMultiline: true,
                        overflow: goInstance.TextBlock.OverflowEllipsis,
                        maxLines: 2,
                        // minSize: new goInstance.Size(minSize.width - 20, NaN)
                    }, new goInstance.Binding("text").makeTwoWay()
                )
            ),
            ...createNodePorts($, goInstance, isEditModeFromTemplate)
        );


    return genericNodeTemplate;
}
