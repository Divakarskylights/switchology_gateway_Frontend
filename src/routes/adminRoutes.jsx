import React from "react";
import SetupPage from "../pages/settings/SetupPage";
import MetersBillGeneratePage from "../pages/MetersBillGeneratePage";
import CommunicationSetupPage from "../pages/communication/CommunicationSetupPage";
import { createDashboardRouteElement } from "./RouteHelpers";

export const getAdminRoutes = () => [
  // Admin routes
  {
    path: "/admin/setup",
    element: createDashboardRouteElement(SetupPage, { allowedRoles: ["ADMIN"] }),
  },
  {
    path: "/admin/meter-config",
    element: createDashboardRouteElement(MetersBillGeneratePage, { allowedRoles: ["ADMIN"] }),
  },
  {
    path: "/admin/communication-setup",
    element: createDashboardRouteElement(CommunicationSetupPage, { allowedRoles: ["ADMIN"] }),
  },
  // {/* <Route path="/admin/relay-setup" element={
  //   <ProtectedRoute allowedRoles={['ADMIN']}>
  //     <DashboardLayout component={RelaySetupPage} />
  //   </ProtectedRoute>
  // } /> */}
];
