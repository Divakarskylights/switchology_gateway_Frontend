import React from "react";
import AuthKeyPage from "../pages/auth/AuthKeyPage";
import SubscriptionPage from "../pages/settings/SubscriptionPage";
import ProfilePage from "../pages/settings/ProfilePage";
import { createDashboardRouteElement } from "./RouteHelpers";

export const getGatewayRoutes = () => [
  // Gateway authentication page (requires login, but no profile enforcement)
  {
    path: "/gateway/auth",
    element: createDashboardRouteElement(AuthKeyPage, { enforceProfile: false }),
  },
  // Gateway subscription page (requires login, but no profile enforcement)
  {
    path: "/gateway/subscription",
    element: createDashboardRouteElement(SubscriptionPage, { enforceProfile: false }),
  },
  // Profile page: allow access without enforcing profile to avoid redirect loop
  {
    path: "/user/profile",
    element: createDashboardRouteElement(ProfilePage, { enforceProfile: false }),
  },
];
