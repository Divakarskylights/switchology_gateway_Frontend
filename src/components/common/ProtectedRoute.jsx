import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import useRole from '../../redux/store/useRole';

// Enforces access based on:
// - Logged-in state
// - Gateway status (lock/subscription)
// - Optional profile presence (enforceProfile)
// - Optional role restriction via allowedRoles
const ProtectedRoute = ({ children, enforceProfile = true, allowedRoles }) => {
  const location = useLocation();
  const { isLoggedIn, checkGatewayStatus, hasProfile } = useAuth();
  const { role } = useRole();
  const [loading, setLoading] = useState(true);
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const runChecks = async () => {
      // 1) Auth check
      if (!isLoggedIn()) {
        if (!cancelled) setRedirectTo('/auth/login');
        if (!cancelled) setLoading(false);
        return;
      }

      // 2) Role enforcement, if provided
      if (allowedRoles && allowedRoles.length > 0) {
        if (!role || !allowedRoles.includes(role)) {
          if (!cancelled) {
            setRedirectTo('/dashboard');
            setLoading(false);
          }
          return;
        }
      }

      // 3) Gateway status (network/lock/subscription)
      const status = await checkGatewayStatus();
      if (!cancelled) {
        if (status?.networkError) {
          setRedirectTo('/server-issue');
          setLoading(false);
          return;
        }
        if (status?.needsAuthentication) {
          setRedirectTo('/gateway/auth');
          setLoading(false);
          return;
        }
        if (status?.needsSubscription) {
          setRedirectTo('/gateway/subscription');
          setLoading(false);
          return;
        }
      }

      // 4) Profile presence (skip when already on profile page)
      if (enforceProfile && location.pathname !== '/user/profile') {
        try {
          const hasProf = await hasProfile();
          if (!cancelled && !hasProf) {
            setRedirectTo('/user/profile');
            setLoading(false);
            return;
          }
        } catch (_) {
          // If profile check fails, allow navigation to avoid hard lockout
        }
      }

      if (!cancelled) setLoading(false);
    };

    runChecks();
    return () => {
      cancelled = true;
    };
  }, [allowedRoles, checkGatewayStatus, enforceProfile, hasProfile, isLoggedIn, location.pathname, role]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (redirectTo && location.pathname !== redirectTo) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
