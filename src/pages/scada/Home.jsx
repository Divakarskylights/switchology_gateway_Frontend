import React, { useEffect, useRef } from 'react';
import * as go from "gojs";
import { Box, Button, Tooltip, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RestoreIcon from '@mui/icons-material/Restore';
import UpdateIcon from '@mui/icons-material/Update';
import ViewInArIcon from '@mui/icons-material/ViewInAr';
import { useNavigate } from 'react-router-dom';
import { createPalette } from './diagram/Palette';
import { addNodeTemplates } from './diagram/Diagram_Components/NodeTemplate';
import { GlobalDiagram } from './diagram/GlobalDiagram';
import { useSecureNavigation } from '../../hooks/useSecureNavigation';

const newMenuStyle = { color: 'white', display: 'block', transition: 'transform 150ms ease-in-out, background-color 150ms ease-in-out, color 150ms ease-in-out', cursor: 'pointer', textAlign: 'center', }

export default function Home() {
    const { navigateToDashboard } = useSecureNavigation();
    const diagramRef = useRef(null);

    useEffect(() => {
        if (!diagramRef.current) return;

        // Create a GoJS diagram inside the div
        const $ = go.GraphObject.make;
        const diagram = $(go.Diagram, diagramRef.current, {
            "undoManager.isEnabled": true, // Enable undo & redo
            'toolManager.mouseWheelBehavior': go.WheelMode.Zoom,
            'minScale': GlobalDiagram.DiagramScale.ZOOM_OUT, // Set minimum zoom level
          'maxScale': GlobalDiagram.DiagramScale.ZOOM_IN,
            'InitialLayoutCompleted': e => updateTotalGroupDepth(),
            
        });
     
        const colors = {
            white: '#fffcf6',
            blue: '#dfebe5',
            darkblue: '#cae0d8',
            yellow: '#fcdba2',
            gray: '#59524c',
            black: '#000000'
        }
        // this function is used to highlight a Group that the selection may be dropped into
        function highlightGroup(e, grp, show) {
            if (!grp) return;
            e.handled = true;
            if (show) {
                // cannot depend on the grp.diagram.selection in the case of external drag-and-drops;
                // instead depend on the DraggingTool.draggedParts or .copiedParts
                var tool = grp.diagram.toolManager.draggingTool;
                var map = tool.draggedParts || tool.copiedParts;  // this is a Map
                // now we can check to see if the Group will accept membership of the dragged Parts
                if (grp.canAddMembers(map.toKeySet())) {
                    grp.isHighlighted = true;
                    return;
                }
            }
            grp.isHighlighted = false;
        }
        function finishDrop(e, grp) {
            var ok = (grp !== null
                ? grp.addMembers(grp.diagram.selection, true)
                : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
            if (!ok) e.diagram.currentTool.doCancel();

            const slider = document.getElementById('levelSlider');
            const oldMax = parseInt(slider.max);

            updateTotalGroupDepth();

            const newMax = parseInt(slider.max);
            // keep the slider value accurate to the current depth
            slider.value = parseInt(slider.value) + newMax - oldMax;
        }
       
        // function finishDrop(e, grp) {
        //     var ok = (grp !== null
        //         ? grp.addMembers(grp.diagram.selection, true)
        //         : e.diagram.commandHandler.addTopLevelParts(e.diagram.selection, true));
        //     if (!ok) e.diagram.currentTool.doCancel();

        //     const slider = document.getElementById('levelSlider');
        //     const oldMax = parseInt(slider.max);

        //     updateTotalGroupDepth();

        //     const newMax = parseInt(slider.max);
        //     // keep the slider value accurate to the current depth
        //     slider.value = parseInt(slider.value) + newMax - oldMax;
        // }
        // Define a simple node template
        diagram.groupTemplate = new go.Group('Auto', {
            ungroupable: true,
            // highlight when dragging into the Group
            mouseDragEnter: (e, grp, prev) => highlightGroup(e, grp, true),
            mouseDragLeave: (e, grp, next) => highlightGroup(e, grp, false),
            computesBoundsAfterDrag: true,
            computesBoundsIncludingLocation: true,
            // when the selection is dropped into a Group, add the selected Parts into that Group;
            // if it fails, cancel the tool, rolling back any changes
            mouseDrop: finishDrop,
            handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
            // Groups containing Groups lay out their members horizontally
            layout: makeLayout(false),
            background: defaultColor(false) // default value if not specified in data
        })
            .bind('background', 'horiz', defaultColor)
            .bind('layout', 'horiz', makeLayout)
            .add(
                new go.Shape('Rectangle', { stroke: colors.gray, strokeWidth: 1, hasShadow: true, })
                    .bindObject('fill', 'isHighlighted', h => h ? 'rgba(0,255,0,.3)' : 'transparent'),
                new go.Panel('Vertical')  // title above Placeholder
                    .add(
                        new go.Panel('Horizontal', { stretch: go.Stretch.Horizontal }) // button next to TextBlock
                            .add(
                                go.GraphObject.build('SubGraphExpanderButton', { alignment: go.Spot.Right, margin: 5 }),
                                new go.TextBlock({
                                    alignment: go.Spot.Left,
                                    editable: true,
                                    margin: new go.Margin(6, 10, 6, 1),
                                    font: 'bold 16px Lora, serif',
                                    opacity: 0.95,  // allow some color to show through
                                    stroke: colors.black
                                })
                                    .bind('font', 'horiz', (horiz) => horiz ? 'bold 20px Lora, serif' : 'bold 16px Lora, serif')
                                    .bindTwoWay('text')
                            ),  // end Horizontal Panel
                        new go.Placeholder({ padding: 8, margin: 4, alignment: go.Spot.TopLeft })
                    )  // end Vertical Panel
            )  // end Auto Panel


        const myPalette = createPalette(diagram); // 🔹 Create Palette
        myPalette.div = document.getElementById("myPaletteDiv");
        addNodeTemplates($, go, diagram);
        // Handle items dropped from palette
        // diagram.addDiagramListener("ExternalObjectsDropped", function (e) {
        //     e.subject.each(node => {
        //         let newTemplate = diagram.nodeTemplateMap.get(node.category);
        //         if (newTemplate) {
        //             node.category = node.category;
        //             diagram.model.setDataProperty(node.data, "category", node.category);
        //             diagram.nodeTemplateMap.add(node.category, newTemplate);
        //             diagram.model.updateTargetBindings(node.data);
        //         }
        //     });
        // });

        // }, []);

        var slider = document.getElementById('levelSlider');
        slider.addEventListener('change', reexpand);
        slider.addEventListener('input', reexpand);
        // console.log("dhhidswhw", diagram.model.nodeDataArray);
        function reexpand(e) {
            diagram.commit(diag => {
                var level = parseInt(document.getElementById('levelSlider').value);
                diag.findTopLevelGroups().each(g => expandGroups(g, 0, level))
            }, 'reexpand');
        }
        function expandGroups(g, i, level) {
            if (!(g instanceof go.Group)) return;
            g.isSubGraphExpanded = i < level;
            g.memberParts.each(m => expandGroups(m, i + 1, level))
        }
        function updateTotalGroupDepth() {
            let d = 0;
            diagram.findTopLevelGroups().each(g => d = Math.max(d, groupDepth(g)));
            document.getElementById('levelSlider').max = Math.max(0, d);
        }
        function groupDepth(g) {
            if (!(g instanceof go.Group)) return 0;
            let d = 1;
            g.memberParts.each(m => d = Math.max(d, groupDepth(m) + 1));
            return d;
        }


        window.addEventListener('DOMContentLoaded', Home);
        return () => diagram.div = null; // Cleanup on unmount
    }, []);

    return (
        <>
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                        gap: 2,
                        p: 2,
                        bgcolor: "background.default"
                    }}
                >
                    {/* Header Bar */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            bgcolor: "slategray",
                            padding: "0 0.5rem",
                            borderRadius: 2,
                            mb: 1,
                            flexShrink: 0 // Ensures it's not shrinkable
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Button
                                variant="contained"
                                sx={{ maxHeight: "30px" }}
                                startIcon={<ArrowBackIcon />}
                                onClick={() => navigateToDashboard()}
                            >
                                Back
                            </Button>
                        </Box>

                        {/* Toolbar Buttons */}
                        <Box sx={{ display: "flex" }}>
                            <Tooltip title="Undo">
                                <Button sx={newMenuStyle}>
                                    <RestoreIcon fontSize="small" />
                                    <Typography fontSize="10px" color="white">Undo</Typography>
                                </Button>
                            </Tooltip>
                            <Tooltip title="Redo">
                                <Button sx={newMenuStyle}>
                                    <UpdateIcon fontSize="small" />
                                    <Typography fontSize="10px" color="white">Redo</Typography>
                                </Button>
                            </Tooltip>
                            <Tooltip title="View">
                                <Button sx={newMenuStyle}>
                                    <ViewInArIcon fontSize="small" />
                                    <Typography fontSize="10px" color="white">View</Typography>
                                </Button>
                            </Tooltip>
                        </Box>
                    </Box>

                    {/* Diagram Section (Takes Remaining Space) */}
                    <Box
                        sx={{
                            flex: 1,  // Takes all available space
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "white",
                            borderRadius: 2,
                            overflow: "hidden"  // Prevents unwanted scrolling
                        }}
                    >

                        <Box
                            sx={{
                                display: "flex",
                                height: "100%",
                                width: "100%",
                                overflow: "hidden"  // Prevents unwanted scrolling
                            }}
                        >
                            {/* Main Diagram Area */}
                            <Box
                                ref={diagramRef}
                                sx={{
                                    flex: 1,  // Takes remaining space
                                    height: "100%",
                                    width: "80%",
                                    backgroundColor: "white",
                                    border: "solid 2px black"
                                }}
                            />
                            {/* Left Sidebar (Palette) */}
                            <Box
                                id="myPaletteDiv"
                                sx={{
                                    width: "15%",
                                    height: "100%",
                                    backgroundColor: "#CCCCFF",
                                    border:  "2px solid black", /* Applies border to all sides */
                                    borderLeft: "none",
                                    marginRight: "2px",
                                    flexShrink: 0 // Prevents resizing when flex container shrinks
                                }}
                            />
                        </Box>
                    </Box>
                    <input id="levelSlider" type="range" min="0" max="5" />
                </Box>
            </div>
        </>
    );
}
