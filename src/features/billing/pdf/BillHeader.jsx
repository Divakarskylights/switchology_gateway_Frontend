import React from "react";
import { Box, Typography, Paper } from "@mui/material";
const SkylightsEnergyLogo = "/skylightsenergyLOGO.png"; // Adjusted path

const BillHeader = () => {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        px: 2,
        pt: 3,
        backgroundColor: "#fff",
        flexDirection: { xs: "column", md: "row" },
        "@media print": {
          flexDirection: "row",
          pageBreakInside: "avoid"
        }
      }}
    >
      <Box sx={{ display: "flex", flex: 1 }}>
       
        <Box sx={{ ml: 1 }}>
          <img src={SkylightsEnergyLogo} alt="Skylights Energy Logo" style={{ width: "auto", height: "28px" }} />
          <Box sx={{color: "text.secondary", mt: 0 }}>
            <Typography fontSize="10px">www.skylightsenergy.in</Typography>
            <Typography fontSize="10px">info@skylightsenergy.in</Typography>
            <Typography fontSize="10px">
              No. 15 1st Cross, 3rd Main Begur Rd, Bommanahalli Bangalore 560068, KA India
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ 
        textAlign: { xs: "left", md: "right" }, 
        mt: { xs: 1, md: 0 },
        flex: 1,
        "@media print": {
          textAlign: "right",
          mt: 0
        }
      }}>
        <Typography fontWeight="bold">Harnessing Tech x Driven Power</Typography>
        <Typography sx={{ mt: 1 }} fontSize="10px">
          +91-9100010019
        </Typography>
        <Typography sx={{ mt: 1 }} fontSize="10px">GSTIN: 29ACGFS8716P1ZZ</Typography>
      </Box>
    </Box>
  );
};

export default BillHeader;
