import React from "react";
import DashboardPage from "../pages/dashboard/DashboardPage";
import AnalyticsDashboardPage from "../pages/analytics/AnalyticsDashboardPage";
import KpiPage from "../pages/kpi/KpiPage";
import RelaySetupPage from "../pages/relay/RelaySetupPage";
import { ScadaDiagram } from "../pages/scada/ScadaPage";
import { createDashboardRouteElement } from "./RouteHelpers";

export const getProtectedRoutes = () => [
  // Main dashboard
  {
    path: "/dashboard",
    element: createDashboardRouteElement(DashboardPage),
  },
  // Analytics dashboards
  {
    path: "/analytics/ems",
    element: createDashboardRouteElement(AnalyticsDashboardPage),
  },
  {
    path: "/analytics/kpi",
    element: createDashboardRouteElement(KpiPage),
  },
  // Relay setup accessible to both ADMIN and VIEWER
  {
    path: "/admin/relay-setup",
    element: createDashboardRouteElement(RelaySetupPage),
  },
  // SCADA diagram
  {
    path: "/scada/diagram",
    element: createDashboardRouteElement(ScadaDiagram),
  },
];
