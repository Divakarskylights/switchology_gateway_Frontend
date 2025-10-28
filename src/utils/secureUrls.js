// Utility for generating secure URLs with tokens
import { v4 as uuidv4 } from 'uuid';

// No expiration time - tokens don't expire

// Generate a secure token for URLs
export const generateSecureToken = () => {
  return uuidv4().replace(/-/g, '').substring(0, 16);
};

// Create token without expiration
export const createTokenWithExpiration = () => {
  const token = generateSecureToken();
  
  const tokenData = {
    token,
    createdAt: Date.now()
  };
  
  const tokenStr = JSON.stringify(tokenData);
  // Store in both sessionStorage and localStorage for reliability
  sessionStorage.setItem('secureTokenData', tokenStr);
  localStorage.setItem('secureTokenData', tokenStr);
  
  console.log('New token created and stored');
  return token;
};

// Get current token if exists
export const getValidToken = () => {
  try {
    // Check both sessionStorage and localStorage for backward compatibility
    let tokenDataStr = sessionStorage.getItem('secureTokenData') || localStorage.getItem('secureTokenData');
    
    if (!tokenDataStr) {
      console.log('No token found in storage');
      return null;
    }
    
    const tokenData = JSON.parse(tokenDataStr);
    
    // If token exists in localStorage but not in sessionStorage, sync them
    if (localStorage.getItem('secureTokenData') && !sessionStorage.getItem('secureTokenData')) {
      sessionStorage.setItem('secureTokenData', tokenDataStr);
    }
    
    return tokenData.token || null;
  } catch (error) {
    console.error('Error getting valid token:', error);
    clearToken();
    return null;
  }
};

// Check if token exists
export const isTokenExpired = () => {
  const token = getValidToken();
  return token === null;
};

// Get token creation time
export const getTokenTimeRemaining = () => {
  const tokenDataStr = sessionStorage.getItem('secureTokenData');
  if (!tokenDataStr) return 0;
  
  try {
    const tokenData = JSON.parse(tokenDataStr);
    return tokenData.createdAt;
  } catch (error) {
    return 0;
  }
};

// Create a secure URL with token
export const createSecureUrl = (basePath, token = null) => {
  const secureToken = token || getValidToken() || createTokenWithExpiration();
  return `${basePath}?token=${secureToken}`;
};

// Validate secure URL token
export const validateSecureToken = (token) => {
  // Check if token exists and is not expired
  const validToken = getValidToken();
  return validToken === token;
};

// Extract token from URL
export const extractTokenFromUrl = (url) => {
  const urlParams = new URLSearchParams(url.split('?')[1]);
  return urlParams.get('token');
};

// Clear token (for logout)
export const clearToken = () => {
  sessionStorage.removeItem('secureTokenData');
  localStorage.removeItem('secureTokenData');
  console.log('Token cleared from storage');
};

// Secure route mapping
export const SECURE_ROUTES = {
  DASHBOARD: '/dashboard',
  PROFILE: '/user/profile',
  ANALYTICS_EMS: '/analytics/ems',
  ANALYTICS_KPI: '/analytics/kpi',
  ADMIN_SETUP: '/admin/setup',
  ADMIN_METER_CONFIG: '/admin/meter-config',
  SCADA_DIAGRAM: '/scada/diagram',
  GATEWAY_AUTH: '/gateway/auth',
  GATEWAY_SUBSCRIPTION: '/gateway/subscription',
  AUTH_LOGIN: '/auth/login'
};

// Create secure URLs for all routes
export const createSecureUrls = (token = null) => {
  const secureToken = token || getValidToken() || createTokenWithExpiration();
  return {
    dashboard: createSecureUrl(SECURE_ROUTES.DASHBOARD, secureToken),
    profile: createSecureUrl(SECURE_ROUTES.PROFILE, secureToken),
    analyticsEms: createSecureUrl(SECURE_ROUTES.ANALYTICS_EMS, secureToken),
    analyticsKpi: createSecureUrl(SECURE_ROUTES.ANALYTICS_KPI, secureToken),
    adminSetup: createSecureUrl(SECURE_ROUTES.ADMIN_SETUP, secureToken),
    adminMeterConfig: createSecureUrl(SECURE_ROUTES.ADMIN_METER_CONFIG, secureToken),
    scadaDiagram: createSecureUrl(SECURE_ROUTES.SCADA_DIAGRAM, secureToken),
    gatewayAuth: createSecureUrl(SECURE_ROUTES.GATEWAY_AUTH, secureToken),
    gatewaySubscription: createSecureUrl(SECURE_ROUTES.GATEWAY_SUBSCRIPTION, secureToken),
    authLogin: createSecureUrl(SECURE_ROUTES.AUTH_LOGIN, secureToken)
  };
}; 