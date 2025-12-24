import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { CircularProgress, Box, Typography } from "@mui/material";
import ProfilePage from "./pages/settings/ProfilePage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import AnalyticsDashboardPage from "./pages/analytics/AnalyticsDashboardPage";
import SetupPage from "./pages/settings/SetupPage";
import AuthKeyPage from "./pages/auth/AuthKeyPage";
import SubscriptionPage from "./pages/settings/SubscriptionPage";
import RelaySetupPage from "./pages/relay/RelaySetupPage";
import { DashboardLayout } from "./layouts/DiagramLayout";
import ProtectedRoute from "./components/common/ProtectedRoute";
import { ScadaDiagram } from "./pages/scada/ScadaPage";
import KpiPage from "./pages/dashboard/KpiPage";
import LoginPage from "./pages/auth/LoginPage";
import MetersBillGeneratePage from "./pages/MetersBillGeneratePage";
import { useAppInitialization } from "./hooks/useAppInitialization";
import useAuth from "./hooks/useAuth";

const AppRoutes = () => {
  const { isLoading, hasProfile, roleLoaded } = useAppInitialization();
  const { checkGatewayStatus, isLoggedIn } = useAuth();
  const [gatewayStatus, setGatewayStatus] = useState({
    needsAuthentication: false,
    needsSubscription: false,
    subscriptionIsActive: true
  });
  const [profileChecked, setProfileChecked] = useState(false);

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

  // Determine the default route based on authentication, profile, and gateway status
  const getDefaultRoute = () => {
    const loggedIn = isLoggedIn();
    
    console.log("getDefaultRoute - loggedIn:", loggedIn, "hasProfile:", hasProfile, "gatewayStatus:", gatewayStatus);
    
    // 1. FIRST PRIORITY: Gateway Lock - ONLY /gateway/auth
    if (gatewayStatus?.needsAuthentication) {
      console.log("Redirecting to /gateway/auth - gateway locked");
      return "/gateway/auth";
    }
    
    // 2. SECOND PRIORITY: Subscription - ONLY /gateway/subscription
    if (gatewayStatus?.needsSubscription) {
      console.log("Redirecting to /gateway/subscription - subscription inactive");
      return "/gateway/subscription";
    }
    
    // 3. THIRD PRIORITY: No Profile - go to profile creation
    if (!hasProfile) {
      console.log("Redirecting to /user/profile - no profile exists");
      return "/user/profile";
    }
    
    // 4. Profile exists but not logged in - go to login
    if (hasProfile && !loggedIn) {
      console.log("Redirecting to /auth/login - profile exists but not logged in");
      return "/auth/login";
    }
    
    // 5. Profile exists and logged in - go to dashboard
    if (hasProfile && loggedIn) {
      console.log("Redirecting to /dashboard - profile exists and logged in");
      return "/dashboard";
    }
    
    // 6. Default fallback
    console.log("Redirecting to /dashboard - default fallback");
    return "/dashboard";
  };

  return (
    <Routes>
      {/* All routes wrapped in ProtectedRoute for strict priority enforcement */}
      <Route path="/auth/login" element={
        <ProtectedRoute>
          <LoginPage />
        </ProtectedRoute>
      } />

      <Route path="/gateway/auth" element={
        <ProtectedRoute>
          <AuthKeyPage />
        </ProtectedRoute>
      } />
      
      <Route path="/gateway/subscription" element={
        <ProtectedRoute>
          <SubscriptionPage />
        </ProtectedRoute>
      } />

      <Route path="/user/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />

      {/* Main app routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout component={DashboardPage} />
        </ProtectedRoute>
      } />
      
      <Route path="/analytics/ems" element={
        <ProtectedRoute>
          <DashboardLayout component={AnalyticsDashboardPage} />
        </ProtectedRoute>
      } />
      
      <Route path="/analytics/kpi" element={
        <ProtectedRoute>
          <DashboardLayout component={KpiPage} />
        </ProtectedRoute>
      } />
      
      <Route path="/scada/diagram" element={
        <ProtectedRoute>
          <DashboardLayout component={ScadaDiagram} />
        </ProtectedRoute>
      } />

      {/* Admin routes */}
      <Route path="/admin/setup" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout component={SetupPage} />
        </ProtectedRoute>
      } />
      
      <Route path="/admin/meter-config" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout component={MetersBillGeneratePage} />
        </ProtectedRoute>
      } />

      {/* <Route path="/admin/relay-setup" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout component={RelaySetupPage} />
        </ProtectedRoute>
      } /> */}

      {/* Fallback route */}
      <Route path="*" element={
        <Navigate to={getDefaultRoute()} replace />
      } />
    </Routes>
  );
};

export default AppRoutes;