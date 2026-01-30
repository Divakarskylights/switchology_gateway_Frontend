import { toast } from 'react-toastify';
import { clearToken, getValidToken } from '../utils/secureUrls';
import { configInit } from '../components/layout/globalvariable';
import { fetchProfilesList, invalidateProfilesCache } from '../services/profileService';

let cachedProfilePresence = null;
const HAS_PROFILE_STORAGE_KEY = 'hasProfile';
const GATEWAY_STATUS_CACHE_TTL = 4000;
let gatewayStatusCache = null;
let gatewayStatusCachedAt = 0;
let gatewayStatusPromise = null;

const getStoredProfilePresence = () => {
  try {
    const stored = sessionStorage.getItem(HAS_PROFILE_STORAGE_KEY);
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch (err) {
    console.warn('Unable to read stored profile flag:', err);
  }
  return null;
};

const persistProfilePresence = (value) => {
  cachedProfilePresence = value;
  try {
    sessionStorage.setItem(HAS_PROFILE_STORAGE_KEY, value ? 'true' : 'false');
  } catch (err) {
    console.warn('Unable to persist profile flag:', err);
  }
};

const useAuth = () => {

  // REST helpers
  const apiBase = () => (configInit?.appBaseUrl || '').replace(/\/+$/, '');
  const getJson = async (path) => {
    const res = await fetch(`${apiBase()}${path}`, { headers: { 'Content-Type': 'application/json' } });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw new Error((data && data.message) || text || `HTTP ${res.status}`);
    return data;
  };

  const asBool = (value, defaultValue = false) => {
    if (value === undefined || value === null) return defaultValue;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
      if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
    }
    return Boolean(value);
  };
  const putJson = async (path, body) => {
    const res = await fetch(`${apiBase()}${path}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = text; }
    if (!res.ok) throw new Error((data && data.message) || text || `HTTP ${res.status}`);
    return data;
  };

  // Fetch gateway row via REST API
  const getGatewayData = async () => {
    try {
      const data = await getJson('/api/gateway-status');
      // Accept either direct object or wrapped shapes
      const node = Array.isArray(data?.nodes) ? data.nodes[0]
        : Array.isArray(data?.data?.nodes) ? data.data.nodes[0]
        : Array.isArray(data) ? data[0]
        : (data?.gateway || data?.gatewaystatus || data || null);
      return node || null;
    } catch (error) {
      console.error("Error fetching gateway:", error);
      return { __networkError: true };
    }
  };
  

  const isLoggedIn = () => getValidToken() !== null;

  // Check if at least one profile exists in the system
  const hasProfile = async () => {
    if (cachedProfilePresence === true) return true;
    const storedPresence = getStoredProfilePresence();
    if (storedPresence === true) {
      cachedProfilePresence = true;
      return true;
    }
    try {
      const profiles = await fetchProfilesList();
      const exists = profiles.length > 0;
      persistProfilePresence(exists);
      return exists;
    } catch (error) {
      console.error("Error checking profile:", error);
      if (cachedProfilePresence === true || storedPresence === true) return true;
      return false;
    }
  };

  // Check if any profile exists in the system
  const hasAnyProfile = async () => {
    try {
      return hasProfile();
    } catch (error) {
      console.error("Error checking if any profile exists:", error);
      return false;
    }
  }; 

  const logoutDashboard = async () => {
    try {
      const dashboardLogoutUrl = `${window.location.protocol}//${window.location.hostname}/main/page/dashboards/logout`;
      const response = await fetch(dashboardLogoutUrl, { method: 'GET', credentials: 'include' });
      if (response.ok) console.log('Logged out from Dashboard successfully');
    } catch (error) {
      console.warn('Error during Dashboard logout:', error);
    }
  };

  const logout = async () => {
    try {
      await logoutDashboard();
      clearToken();
      localStorage.clear();
      sessionStorage.clear();
      toast.success("Logged out successfully.");
      // TEMP DEV: avoid /auth/login to prevent redirect loop, go to dashboard instead
      window.location.href = '/dashboard';
    } catch (e) {
      console.error('Logout error:', e);
      toast.error("Logout failed.");
    }
  };

  // Check gateway authentication based on DB
  const checkGatewayAuth = async () => {
    const gateway = await getGatewayData();
    console.log("gateway1111", gateway);
    
    if (!gateway) return false;

    const locked = asBool(gateway.gatewayLock, false);
    const subscriptionActive = asBool(gateway.subscriptionIsActive, true);

    if (locked) return false;
    if (!subscriptionActive) return false;

    return true;
  };

  const buildGatewayStatus = (gateway) => {
    if (gateway && gateway.__networkError) {
      return { networkError: true, needsAuthentication: false, needsSubscription: false };
    }
    if (!gateway) {
      return { networkError: false, needsAuthentication: false, needsSubscription: false };
    }
    const locked = asBool(gateway.gatewayLock, false);
    const subscriptionActive = asBool(gateway.subscriptionIsActive, true);
    return {
      networkError: false,
      needsAuthentication: locked,
      needsSubscription: !subscriptionActive
    };
  };

  const invalidateGatewayStatusCache = () => {
    gatewayStatusCache = null;
    gatewayStatusCachedAt = 0;
    gatewayStatusPromise = null;
  };

  const checkGatewayStatus = async () => {
    const now = Date.now();
    if (gatewayStatusCache && now - gatewayStatusCachedAt < GATEWAY_STATUS_CACHE_TTL) {
      return gatewayStatusCache;
    }
    if (gatewayStatusPromise) {
      return gatewayStatusPromise;
    }

    gatewayStatusPromise = (async () => {
      const gateway = await getGatewayData();
      const status = buildGatewayStatus(gateway);
      gatewayStatusCache = status;
      gatewayStatusCachedAt = Date.now();
      gatewayStatusPromise = null;
      return status;
    })().catch((err) => {
      gatewayStatusPromise = null;
      throw err;
    });

    return gatewayStatusPromise;
  };

  const updateGatewayData = async (lockStatus) => {
    try {
      const gateway = await getGatewayData();
      if (!gateway) return null;
      const body = {
        gatewayLock: !!lockStatus,
        lastUpdated: new Date().toISOString(),
        subscriptionStart: "2024-01-01",
        subscriptionEnd: "2050-12-31",
        subscriptionIsActive: true,
      };
      const updated = await putJson(`/api/gateway-status/${encodeURIComponent(gateway.id)}`, body);
      invalidateGatewayStatusCache();
      toast.success("Gateway updated successfully!");
      return updated?.gateway || updated?.gatewaystatus || updated;
    } catch (error) {
      console.error("Error updating gateway:", error);
      toast.error("Failed to update gateway");
      return null;
    }
  };

  return {
    logout,
    logoutDashboard,
    checkGatewayAuth,
    checkGatewayStatus,
    updateGatewayData,
    invalidateGatewayStatusCache,
    isLoggedIn,
    hasProfile,
    hasAnyProfile,
    getGatewayData
  };
};

export default useAuth;
