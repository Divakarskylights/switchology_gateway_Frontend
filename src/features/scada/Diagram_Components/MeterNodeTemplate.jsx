import * as go from "gojs";
import { avoidNodeOverlap } from "./overlap.jsx";
import { createNodePorts } from "./NodePorts.jsx";
import { GlobalDiagram } from "../GlobalDiagram";

export function createMeterNodeTemplate($, goInstance, onNodeMouseEnter, onNodeMouseLeave, isEditModeFromTemplate) {
    const meterConfig = GlobalDiagram.nodeDefinitions.meters[0];
    const minSize = new goInstance.Size(meterConfig.minWidth, meterConfig.minHeight);
    const maxSize = new goInstance.Size(meterConfig.maxWidth, meterConfig.maxHeight);

    const meterNodeTemplate =
        $(goInstance.Node, "Auto",
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
                background: "transparent",
            },
            new goInstance.Binding("location", "loc", goInstance.Point.parse).makeTwoWay(goInstance.Point.stringify),
            new goInstance.Binding("desiredSize", "size", goInstance.Size.parse).makeTwoWay(goInstance.Size.stringify),

            $(goInstance.Shape, "RoundedRectangle",
                {
                    name: "METER_SHAPE",
                    isPanelMain: true,
                    fill: "#f2f2f2",
                    stroke: null,
                    strokeWidth: 1,
                    fromLinkable: false,
                    toLinkable: false,
                    cursor: isEditModeFromTemplate ? "move" : "default",
                }
            ),
            $(goInstance.Picture,
                {
                    source: meterConfig.img,
                    stretch: goInstance.GraphObject.Fill
                }
            ),
            $(goInstance.Panel, "Vertical",
                {
                    alignment: goInstance.Spot.Center,

                    stretch: goInstance.GraphObject.Fill,
                    margin: new goInstance.Margin(30, 0, 0, 0)
                },  // this panel wraps all internal text/info

                // Meter Name
                $(goInstance.TextBlock,
                    {
                        font: "bold 10pt sans-serif", stroke: "red",
                        textAlign: "center", wrap: goInstance.Wrap.Fit,
                        editable: false,
                        maxLines: 2,
                        alignment: goInstance.Spot.Center
                    },
                    new goInstance.Binding("text", "text")
                ),

                // Meter ID
                $(goInstance.TextBlock,
                    {
                        font: "9pt sans-serif", stroke: "red",
                        textAlign: "center", wrap: goInstance.Wrap.Fit,
                        editable: false,
                        alignment: goInstance.Spot.Center,
                        margin: new goInstance.Margin(2, 0, 8, 0)
                    },
                    new goInstance.Binding("text", "meterId", val => {
                        if (val && typeof val === 'string') {
                            const parts = val.split('_');
                            return `MeterID : ${parts.length > 1 ? parts[parts.length - 1].toUpperCase() : val}`;
                        }
                        return "";
                    })
                ),

                // Data table (KWh, V, A)
                $(goInstance.Panel, "Vertical",
                    {
                        alignment: goInstance.Spot.Center,
                        defaultAlignment: goInstance.Spot.Center,
                        defaultStretch: goInstance.GraphObject.Horizontal,
                    },

                    // KWh
                    $(goInstance.Panel, "Horizontal",
                        {
                            alignment: goInstance.Spot.Center,
                            defaultAlignment: goInstance.Spot.Center,
                            margin: new goInstance.Margin(2, 0, 2, 0)       
                        },
                        $(goInstance.TextBlock,
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, width: 80, textAlign: "right"
                            },
                            new goInstance.Binding("text", "Wh_Recvd", val => val == null  ? "0.00" : parseFloat(val).toFixed(2))
                        ),
                        $(goInstance.TextBlock,
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, text: "_KWh", textAlign: "left"
                            }
                        )
                    ),

                    // Voltage
                    $(goInstance.Panel, "Horizontal",
                        {
                            alignment: goInstance.Spot.Center,
                            defaultAlignment: goInstance.Spot.Center,
                            margin: new goInstance.Margin(2, 0, 2, 0)
                        },
                        $(goInstance.TextBlock,
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, width: 80, textAlign: "right"
                            },
                            new goInstance.Binding("text", "VLL_average", val => val == null ? "0.0" : parseFloat(val).toFixed(1))
                        ),
                        $(goInstance.TextBlock,
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, width: 30, text: "_V", textAlign: "left"
                            }
                        )
                    ),

                    // Current
                    $(goInstance.Panel, "Horizontal",
                        {
                            alignment: goInstance.Spot.Center,
                            defaultAlignment: goInstance.Spot.Center,
                            margin: new goInstance.Margin(2, 0, 2, 0)
                        },
                        $(goInstance.TextBlock, 
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, width: 80, textAlign: "right"
                            },
                            new goInstance.Binding("text", "Avg_Current", val => val == null ? "0.0" : parseFloat(val).toFixed(1))
                        ),
                        $(goInstance.TextBlock,
                            {
                                font: "bold 9pt sans-serif", stroke: "red",
                                editable: false, width: 30, text: "_A", textAlign: "left"
                            }
                        )
                    )
                ),

                // Timestamp
                $(goInstance.TextBlock,
                    {
                        font: "5pt sans-serif", stroke: "red",
                        editable: false,
                        alignment: goInstance.Spot.Center,
                        textAlign: "center",
                    },
                    new goInstance.Binding("text", "time", val => {
                        const date = new Date(val);
                        return date.toLocaleString();
                    })
                )
            ),
            $(goInstance.Panel, "Spot",
                {
                    alignment: goInstance.Spot.BottomCenter,
                    stretch: goInstance.GraphObject.Horizontal,
                    // height: 15,
                    margin: new goInstance.Margin(0, 5, 2, 5) // TOP RIGHT BOTTOM LEFT
                },
                $(goInstance.Shape, "RoundedRectangle",
                    {
                        name: "HEAT_BG",
                        stretch: goInstance.GraphObject.Fill,
                        height: 20,
                        fill: "whitesmoke",
                        stroke: "lightgray",
                        strokeWidth: 0.5
                    }
                ),
                $(goInstance.Shape, "RoundedRectangle",
                    {
                        name: "HEAT_BAR",
                        height: 20,
                        fill: "#f54e4e",
                        stroke: null,
                        alignment: goInstance.Spot.Left,
                        alignmentFocus: goInstance.Spot.Left,
                    },
                    // new goInstance.Binding("width", "heat", (heat, shape) => {
                    //     const bg = shape.part.findObject("HEAT_BG");
                    //     if (!bg) return 0;
                    //     const fullWidth = bg.actualBounds.width;
                    //     const percentage = Math.min(Math.max(heat || 0, 0), 100);
                    //     return (percentage / 100) * fullWidth;
                    // }),
                    new goInstance.Binding("width", "currentPercentage", (percentage, shape) => {
                        const bg = shape.part.findObject("HEAT_BG");
                        if (!bg) return 0;
                        const fullWidth = bg.actualBounds.width;
                        const normalizedPercentage = Math.min(Math.max(percentage || 0, 0), 100);
                        return (normalizedPercentage / 100) * fullWidth;
                    })
                ),

                // Add percentage text, right-aligned

            ),
            $(goInstance.TextBlock,// this shows the percentage in text inside the heat bar
                {
                    alignment: goInstance.Spot.Right,
                    // alignmentFocus: goInstance.Spot.Right,
                    margin: new goInstance.Margin(220, 0, 0, 0), // TOP RIGHT BOTTOM LEFT
                    font: "bold 10pt sans-serif",
                    editable: false,
                    width: 40,
                    // textAlign: "right"
                },
                new goInstance.Binding("text", "currentPercentage", val => `${Math.round(Math.max(0, Math.min(100, val || 0)))}%`)
            ),
            ...createNodePorts($, goInstance, isEditModeFromTemplate)
        );

    meterNodeTemplate.toolTip =
        $(goInstance.Adornment, "Auto",
            $(goInstance.Shape, "RoundedRectangle", { fill: "whitesmoke", stroke: "gray", strokeWidth: 0.5 }),
            $(goInstance.TextBlock,
                { margin: 5, stroke: "black", font: "9pt sans-serif", textAlign: "left" },
                new goInstance.Binding("text", "", data => {
                    const meterLabel = data.text || "N/A";
                    const meterIdVal = data.meterId || "N/A";
                    const kwh = data.Wh_Recvd !== undefined && data.Wh_Recvd !== null ? parseFloat(data.Wh_Recvd).toFixed(2) : "N/A";
                    const voltage = data.VLL_average !== undefined && data.VLL_average !== null ? parseFloat(data.VLL_average).toFixed(2) + " V" : "N/A";
                    const current = data.Avg_Current !== undefined && data.Avg_Current !== null ? parseFloat(data.Avg_Current).toFixed(2) + " A" : "N/A";
                    return `Meter: ${meterLabel}\nID: ${meterIdVal}\nKWh: ${kwh}\nVoltage: ${voltage}\nCurrent: ${current}`;
                })
            )
        );

    return meterNodeTemplate;
}
