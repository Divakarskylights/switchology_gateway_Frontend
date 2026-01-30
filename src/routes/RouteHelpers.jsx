import React from "react";
import ProtectedRoute from "../guards/ProtectedRoute";
import { DashboardLayout } from "../layouts/DashboardLayout";

export const createDashboardRouteElement = (
  Component,
  { enforceProfile = true, allowedRoles } = {},
) => (
  <ProtectedRoute enforceProfile={enforceProfile} allowedRoles={allowedRoles}>
    <DashboardLayout component={Component} />
  </ProtectedRoute>
);
