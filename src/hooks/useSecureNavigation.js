import { useNavigate, useLocation } from 'react-router-dom';
import { createSecureUrls, validateSecureToken, extractTokenFromUrl } from '../utils/secureUrls';

export const useSecureNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get current token from URL
  const getCurrentToken = () => {
    return extractTokenFromUrl(location.search);
  };

  // Validate current token
  const isTokenValid = () => {
    const token = getCurrentToken();
    return token && validateSecureToken(token);
  };

  // Navigate to secure route
  const navigateToSecure = (route, token = null) => {
    const currentToken = token || getCurrentToken();
    const secureUrls = createSecureUrls(currentToken);
    
    // Map route to secure URL
    const routeMap = {
      '/dashboard': secureUrls.dashboard,
      '/user/profile': secureUrls.profile,
      '/analytics/ems': secureUrls.analyticsEms,
      '/analytics/kpi': secureUrls.analyticsKpi,
      '/admin/setup': secureUrls.adminSetup,
      '/admin/meter-config': secureUrls.adminMeterConfig,
      '/scada/diagram': secureUrls.scadaDiagram,
      '/gateway/auth': secureUrls.gatewayAuth,
      '/gateway/subscription': secureUrls.gatewaySubscription,
      '/auth/login': secureUrls.authLogin
    };

    const secureUrl = routeMap[route] || route;
    navigate(secureUrl);
  };

  // Navigate to dashboard with secure token
  const navigateToDashboard = (token = null) => {
    navigateToSecure('/dashboard', token);
  };

  // Navigate to profile with secure token
  const navigateToProfile = (token = null) => {
    navigateToSecure('/user/profile', token);
  };

  // Navigate to analytics with secure token
  const navigateToAnalytics = (type = 'ems', token = null) => {
    const route = type === 'kpi' ? '/analytics/kpi' : '/analytics/ems';
    navigateToSecure(route, token);
  };

  // Navigate to admin routes with secure token
  const navigateToAdmin = (route = 'setup', token = null) => {
    const adminRoute = route === 'meter-config' ? '/admin/meter-config' : '/admin/setup';
    navigateToSecure(adminRoute, token);
  };

  // Navigate to scada with secure token
  const navigateToScada = (token = null) => {
    navigateToSecure('/scada/diagram', token);
  };

  // Navigate to gateway routes with secure token
  const navigateToGateway = (route = 'auth', token = null) => {
    const gatewayRoute = route === 'subscription' ? '/gateway/subscription' : '/gateway/auth';
    navigateToSecure(gatewayRoute, token);
  };

  return {
    navigateToSecure,
    navigateToDashboard,
    navigateToProfile,
    navigateToAnalytics,
    navigateToAdmin,
    navigateToScada,
    navigateToGateway,
    isTokenValid,
    getCurrentToken,
    createSecureUrls
  };
}; 