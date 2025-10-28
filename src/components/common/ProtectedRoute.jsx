import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useRole from '../../redux/store/useRole';
import useAuth from '../../hooks/useAuth';
import { useAppInitialization } from '../../hooks/useAppInitialization';
import Error404Page from './404ErrorPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role } = useRole();
  const { hasProfile } = useAppInitialization();
  const { isLoggedIn, checkGatewayStatus } = useAuth();
  const location = useLocation();
  const [profileChecked, setProfileChecked] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const [gatewayStatus, setGatewayStatus] = useState({
    networkError: false,
    needsAuthentication: false,
    needsSubscription: false
  });
  
  const loggedIn = isLoggedIn();

  // Check gateway status asynchronously
  useEffect(() => {
    const checkStatus = async () => {
      console.log("ProtectedRoute - checking gateway status, loggedIn:", loggedIn, "hasProfile:", hasProfile);
      
      // Check gateway status
      const status = await checkGatewayStatus();
      setGatewayStatus(status);
      
      setProfileChecked(true);
    };
    
    checkStatus();
  }, [loggedIn, hasProfile, retryTick]); // Depend on both loggedIn and hasProfile

  // Show loading while checking profile and gateway status
  if (!profileChecked) {
    return <div>Loading...</div>;
  }

  if (gatewayStatus?.networkError) {
    return <Error404Page onRetry={() => setRetryTick((n) => n + 1)} showReload={true} />;
  }

  // 1. FIRST PRIORITY: Gateway Lock - ONLY allow /gateway/auth
  if (gatewayStatus?.needsAuthentication) {
    if (location.pathname === '/gateway/auth') {
      console.log("ProtectedRoute - Gateway locked, allowing /gateway/auth");
      return children;
    }
    console.log("ProtectedRoute - Gateway locked, redirecting to /gateway/auth");
    return <Navigate to="/gateway/auth" replace />;
  }

  // 2. SECOND PRIORITY: Subscription - ONLY allow /gateway/subscription
  if (gatewayStatus?.needsSubscription) {
    if (location.pathname === '/gateway/subscription') {
      console.log("ProtectedRoute - Subscription inactive, allowing /gateway/subscription");
      return children;
    }
    console.log("ProtectedRoute - Subscription inactive, redirecting to /gateway/subscription");
    return <Navigate to="/gateway/subscription" replace />;
  }

  // 3. THIRD PRIORITY: No Profile - ONLY allow /user/profile
  if (!hasProfile) {
    if (location.pathname === '/user/profile') {
      console.log("ProtectedRoute - No profile exists, allowing /user/profile");
      return children;
    }
    console.log("ProtectedRoute - No profile exists, redirecting to /user/profile");
    return <Navigate to="/user/profile" replace />;
  }

  // 4. Profile exists but not logged in - ONLY allow /auth/login
  if (hasProfile && !loggedIn) {
    if (location.pathname === '/auth/login') {
      console.log("ProtectedRoute - Profile exists but not logged in, allowing /auth/login");
      return children;
    }
    console.log("ProtectedRoute - Profile exists but not logged in, redirecting to /auth/login");
    return <Navigate to="/auth/login" replace />;
  }

  // 5. Profile exists and logged in - redirect away from entry point routes
  if (hasProfile && loggedIn) {
    console.log("ProtectedRoute - Profile exists and logged in, checking route access");
    
    // Redirect logged-in users away from entry point routes
    const entryPointRoutes = ['/auth/login', '/gateway/auth', '/gateway/subscription', '/user/profile'];
    if (entryPointRoutes.includes(location.pathname)) {
      console.log("ProtectedRoute - Logged in user trying to access entry route, redirecting to dashboard");
      return <Navigate to="/dashboard" replace />;
    }
    
    // Continue to role-based checks below for other routes
  } else {
    // Handle authentication for other routes
    if (!loggedIn) {
      return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />;
    }
  }

  // 6. Handle role-based access for admin-only routes
  if (allowedRoles && (!role || !allowedRoles.includes(role))) {
    return <Navigate to="/dashboard" replace />;
  }

  // 7. Allow access to the requested route
  return children;
};

export default ProtectedRoute;
