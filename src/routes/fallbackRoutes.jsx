import React from "react";
import { Navigate } from "react-router-dom";
import ServerIssuePage from "../pages/errors/ServerIssuePage";

export const getFallbackRoutes = ({ getDefaultRoute }) => [
  // Server issue fallback
  {
    path: "/server-issue",
    element: <ServerIssuePage />,
  },
  // Fallback route
  {
    path: "*",
    element: <Navigate to={getDefaultRoute()} replace />,
  },
];
