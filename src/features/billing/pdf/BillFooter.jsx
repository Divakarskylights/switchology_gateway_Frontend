import React from "react";
import { Box, Typography, Paper } from "@mui/material";

const SwitchologyLogo = "/Switchology.png"; // Adjusted path
const SwitchonomyLogo = "/Switchonomy.png"; // Adjusted path

const BillFooter = () => {
  return (
    <Box
      sx={{
        borderTop: "1px solid #e0e0e0",
        mt: 1,
        pt: 1,
        px: 2,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
      }}
    >
      <Box>
        <img src={SwitchonomyLogo} alt="Switchonomy Logo" style={{ width: "auto", height: "40px" }} />
      </Box>
      <Box>
        <img src={SwitchologyLogo} alt="Switchology Logo" style={{ width: "auto", height: "40px" }} />
      </Box>
    </Box>
  );
};

export default BillFooter;
