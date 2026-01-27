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
import CommunicationSetupPage from "./features/communicationSetup/pages/CommunicationSetupPage";

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

  // Determine the default route (TEMP DEV: always dashboard)
  const getDefaultRoute = () => {
    return "/dashboard";
  };

  return (
    <Routes>
      {/* Public: Login */}
      <Route
        path="/auth/login"
        element={
          isLoggedIn()
            ? <Navigate to={getDefaultRoute()} replace />
            : <LoginPage />
        }
      />

      {/* Gateway authentication page (requires login, but no profile enforcement) */}
      <Route
        path="/gateway/auth"
        element={
          <ProtectedRoute enforceProfile={false}>
            <DashboardLayout component={AuthKeyPage} />
          </ProtectedRoute>
        }
      />
      
      {/* Gateway subscription page (requires login, but no profile enforcement) */}
      <Route
        path="/gateway/subscription"
        element={
          <ProtectedRoute enforceProfile={false}>
            <DashboardLayout component={SubscriptionPage} />
          </ProtectedRoute>
        }
      />

      {/* Profile page: allow access without enforcing profile to avoid redirect loop */}
      <Route
        path="/user/profile"
        element={
          <ProtectedRoute enforceProfile={false}>
            <DashboardLayout component={ProfilePage} />
          </ProtectedRoute>
        }
      />

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

      <Route path="/admin/communication-setup" element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <DashboardLayout component={CommunicationSetupPage} />
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