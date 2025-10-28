import React from "react";
import { Box,  AppBar,  Drawer as MuiDrawer,  
  useTheme, alpha,  Toolbar } from "@mui/material";
import Topbar from "../components/common/Topbar";
import { DrawerList } from "../components/common/DrawerList";
import useDrawerState from "../redux/store/useDrawerState";

const drawerWidth = 200;

export const DashboardLayout = ({ component: Component }) => {
  const { open, setOpen } = useDrawerState();
  const theme = useTheme();

  return (
    <Box sx={{ display: "flex", height: "100vh", width: "100%" }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          ...(open && {
            marginLeft: `${drawerWidth}px`,
            width: `calc(100% - ${drawerWidth}px)`,
            transition: theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
          backgroundColor: theme.palette.primary.main,
          boxShadow: theme.shadows[4],
        }}
      >
        <Topbar open={open} setOpen={setOpen} drawerWidth={drawerWidth} />
      </AppBar>

      {/* Drawer */}
      <MuiDrawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            backgroundColor:
              theme.palette.mode === "dark"
                ? alpha(theme.palette.background.paper, 0.85)
                : alpha(theme.palette.background.default, 0.9),
            backdropFilter: "blur(10px)",
            borderRight: "none",
            boxShadow: theme.shadows[5],
          },
        }}
      >
        <DrawerList open={open} setOpen={setOpen} isXs={false} />
      </MuiDrawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: "100vh",
          overflow: "auto",
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          marginLeft: open ? 0 : `-${drawerWidth}px`,
          ...(open && {
            transition: theme.transitions.create("margin", {
              easing: theme.transitions.easing.easeOut,
              duration: theme.transitions.duration.enteringScreen,
            }),
          }),
        }}
      >
        <Toolbar />
        <Component />
      </Box>
    </Box>
  );
};
