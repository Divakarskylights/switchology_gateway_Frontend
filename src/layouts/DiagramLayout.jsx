import React from "react";
import { Box,  AppBar,  Drawer as MuiDrawer,  
  useTheme, alpha,  Toolbar, useMediaQuery } from "@mui/material";
import Topbar from "../components/common/Topbar";
import { DrawerList } from "../components/common/DrawerList";
import useDrawerState from "../redux/store/useDrawerState";
// ... existing imports ...
import { useLocation } from "react-router-dom";

const drawerWidth = 200;

export const DashboardLayout = ({ component: Component }) => {
  const { open, setOpen } = useDrawerState();
  const theme = useTheme();
  const location = useLocation();
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  
  const hideUserControls = location.pathname === "/gateway/auth" || 
                         location.pathname === "/user/profile";
  const drawerDocked = !hideUserControls && isDesktop;
  const drawerVisible = !hideUserControls && open;
  const drawerPushesLayout = drawerDocked && open;

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
          ...(drawerPushesLayout && {
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
        <Topbar 
          open={!hideUserControls && open} 
          setOpen={setOpen} 
          drawerWidth={drawerWidth} 
        />
      </AppBar>

      {/* Drawer - Only show when not on auth/profile pages */}
      {!hideUserControls && (
        <MuiDrawer
          variant={isDesktop ? "persistent" : "temporary"}
          ModalProps={{ keepMounted: true }}
          onClose={() => setOpen(false)}
          anchor="left"
          open={drawerVisible}
          sx={{
            width: drawerDocked ? (open ? drawerWidth : 0) : drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerDocked ? (open ? drawerWidth : 0) : drawerWidth,
              boxSizing: "border-box",
              backgroundColor: theme.palette.background.paper,
              borderRight: drawerDocked && !open ? "none" : `1px solid ${alpha(theme.palette.divider, 0.2)}`,
              boxShadow: "none",
              overflowX: "hidden",
              transition: theme.transitions.create(["width"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.shorter,
              }),
            },
          }}
        >
          <Toolbar />
          <Box sx={{ overflow: "auto" }}>
            <DrawerList open={open} setOpen={setOpen} isXs={false} />
          </Box>
        </MuiDrawer>
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          minWidth: 0,
          marginTop: hideUserControls ? 0 : "64px",
          minHeight: hideUserControls ? "100vh" : "calc(100vh - 64px)",
          backgroundColor: theme.palette.background.default,
          overflow: "auto",
          transition: theme.transitions.create(["padding"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.shorter,
          }),
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <Component />
      </Box>
    </Box>
  );
};