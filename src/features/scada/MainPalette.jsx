import React, { useState } from "react";
import DraggableNode from "./Diagram_Components/DraggableNode";
import { Box, Typography, IconButton, Collapse, useTheme } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { GlobalDiagram } from "./GlobalDiagram"; // Import GlobalDiagram

const NodePalette = ({ meters = [] }) => {
  const theme = useTheme();
  const [isMetersCollapsed, setIsMetersCollapsed] = useState(false);
  const [isShapesCollapsed, setIsShapesCollapsed] = useState(false); // New state for shapes section

  console.log("meters_for_nodes_drag", meters);

  const meterNodesToDrag = meters.map((meter) => ({
    id: meter.slave_id,
    text: meter.meter_name || `Meter ${meter.slave_id}`,
    slave_id: meter.slave_id,
    category: "MeterNode",
    minWidth: GlobalDiagram.nodeDefinitions.meters[0].minWidth,
    minHeight: GlobalDiagram.nodeDefinitions.meters[0].minHeight,
    meterDetails: { ...meter },
  }));

  console.log("meterNodesToDrag", meterNodesToDrag);

  const genericShapes = Object.values(GlobalDiagram.nodeDefinitions.shapes);
  const toggleMetersCollapse = () => {
    setIsMetersCollapsed(!isMetersCollapsed);
  };

  const toggleShapesCollapse = () => {
    setIsShapesCollapsed(!isShapesCollapsed);
  };

  const paletteHeaderStyle = {
    height: 40,
    bgcolor: theme.palette.background.paper,
    borderRadius: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 8px",
    borderBottom: `1px solid ${theme.palette.divider}`,
    cursor: "pointer",
  };

  return (
    console.log("meterNodesToDrag", meterNodesToDrag),
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          backgroundColor: theme.palette.background.default,
        }}
      >
        {/* Meters Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
          }}
        >
          <Box sx={paletteHeaderStyle} onClick={toggleMetersCollapse}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              Meters
            </Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleMetersCollapse();
              }}
              size="small"
            >
              {isMetersCollapsed ? (
                <ExpandMoreIcon sx={{ color: "success.main" }} />
              ) : (
                <ExpandLessIcon sx={{ color: "error.main" }} />
              )}
            </IconButton>
          </Box>
          <Collapse in={!isMetersCollapsed}>
            <Box sx={{ alignContent: "center", p: 0.5 }}>
              {meterNodesToDrag.length > 0 ? (
                meterNodesToDrag.map((nodeData) => (
                  <DraggableNode key={nodeData.id} nodeGlobalData={nodeData} />
                  // "true"
                ))
              ) : (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    textAlign: "center",
                    p: 2,
                    color: theme.palette.text.secondary,
                  }}
                >
                  No meters configured.
                </Typography>
              )}
            </Box>
          </Collapse>
        </Box>

        {/* Shapes Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignContent: "center",
            mt: 1 /* Add some margin top */,
          }}
        >
          <Box sx={paletteHeaderStyle} onClick={toggleShapesCollapse}>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: "bold",
                color: theme.palette.text.primary,
              }}
            >
              Shapes
            </Typography>
            <IconButton
              onClick={(e) => {
                e.stopPropagation();
                toggleShapesCollapse();
              }}
              size="small"
            >
              {isShapesCollapsed ? (
                <ExpandMoreIcon sx={{ color: "success.main" }} />
              ) : (
                <ExpandLessIcon sx={{ color: "error.main" }} />
              )}
            </IconButton>
          </Box>
          <Collapse in={!isShapesCollapsed}>
            <Box sx={{ alignContent: "center", p: 0.5 }}>
              {genericShapes.map((shapeData) => (
                <DraggableNode key={shapeData.id} nodeGlobalData={shapeData} />
              ))}
            </Box>
          </Collapse>
        </Box>
      </div>
    )
  );
};

export default NodePalette;
