import React from "react";
import { Navigate } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage";

export const getPublicRoutes = ({ isLoggedIn, getDefaultRoute }) => [
  {
    path: "/auth/login",
    element: isLoggedIn()
      ? <Navigate to={getDefaultRoute()} replace />
      : <LoginPage />,
  },
];
