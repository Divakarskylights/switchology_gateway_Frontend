import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import { useAppInitialization } from "./hooks/useAppInitialization";
import useAuth from "./hooks/useAuth";
import { getPublicRoutes } from "./routes/publicRoutes";
import { getGatewayRoutes } from "./routes/gatewayRoutes";
import { getProtectedRoutes } from "./routes/protectedRoutes";
import { getAdminRoutes } from "./routes/adminRoutes";
import { getFallbackRoutes } from "./routes/fallbackRoutes";

const AppRoutes = () => {
  const location = useLocation();
  const { isLoading, hasProfile, roleLoaded, networkError } = useAppInitialization();
  const { checkGatewayStatus, isLoggedIn } = useAuth();
  const [gatewayStatus, setGatewayStatus] = useState({
    needsAuthentication: false,
    needsSubscription: false,
    subscriptionIsActive: true
  });
  const [profileChecked, setProfileChecked] = useState(false);

  useEffect(() => {
    if (location.pathname !== "/server-issue") {
      try {
        sessionStorage.setItem(
          "lastKnownRoute",
          `${location.pathname}${location.search || ""}`
        );
      } catch (err) {
        console.warn("Failed to cache last route:", err);
      }
    }
  }, [location]);

  // Fetch gateway status
  useEffect(() => {
    const init = async () => {
      // Check gateway status
      const status = await checkGatewayStatus();
      setGatewayStatus(status);
      setProfileChecked(true);
    };
    init();
  }, []);

  if (networkError && location.pathname !== "/server-issue") {
    return <Navigate to="/server-issue" replace state={{ from: location.pathname }} />;
  }

  if (isLoading || !roleLoaded || !profileChecked) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
          gap: 2
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6">Loading application...</Typography>
      </Box>
    );
  }

  // Determine the default route (TEMP DEV: always dashboard)
  const getDefaultRoute = () => {
    return "/dashboard";
  };

  const publicRoutes = getPublicRoutes({ isLoggedIn, getDefaultRoute });
  const gatewayRoutes = getGatewayRoutes();
  const protectedRoutes = getProtectedRoutes();
  const adminRoutes = getAdminRoutes();
  const fallbackRoutes = getFallbackRoutes({ getDefaultRoute });

  return (
    <Routes>
      {publicRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {gatewayRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {protectedRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {adminRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}

      {fallbackRoutes.map((route) => (
        <Route key={route.path} path={route.path} element={route.element} />
      ))}
    </Routes>
  );
};

export default AppRoutes;