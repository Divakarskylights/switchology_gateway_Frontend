import { toast } from 'react-toastify';
import { GET_GATEWAYS, UPDATE_GATEWAY, GET_PROFILE_DATA } from '../services/query';
import { clearToken, getValidToken } from '../utils/secureUrls';
import { graphqlClient } from "../services/client";

const useAuth = () => {

  // Fetch gateway row from Postgres
  const getGatewayData = async () => {
    try {
      const data = await graphqlClient.request(GET_GATEWAYS);
      console.log("data", data);
      
      return data?.allGatewaystatuses?.nodes?.[0] || null;  // use correct query name
    } catch (error) {
      console.error("Error fetching gateway:", error);
      return { __networkError: true };
    }
  };
  

  const isLoggedIn = () => getValidToken() !== null;

  // Check if user has a profile
  const hasProfile = async () => {
    try {
      const currentUserId = localStorage.getItem("userid");
      if (!currentUserId) return false;
      
      const profileResponse = await graphqlClient.request(GET_PROFILE_DATA);
      const userProfile = profileResponse?.allProfiles?.nodes?.find(
        (p) => p.userid === currentUserId
      );
      
      return !!userProfile;
    } catch (error) {
      console.error("Error checking profile:", error);
      return false;
    }
  };

  // Check if any profile exists in the system
  const hasAnyProfile = async () => {
    try {
      const profileResponse = await graphqlClient.request(GET_PROFILE_DATA);
      const profiles = profileResponse?.allProfiles?.nodes || [];
      return profiles.length > 0;
    } catch (error) {
      console.error("Error checking if any profile exists:", error);
      return false;
    }
  }; 

  const logoutDashboard = async () => {
    try {
      const dashboardLogoutUrl = `${window.location.protocol}//${window.location.hostname}/d/main/page/dashboards/logout`;
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
      window.location.href = '/auth/login';
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

    if (gateway.gatewayLock) return false;
    if (!gateway.subscriptionIsActive) return false;

    return true;
  };

  const checkGatewayStatus = async () => {
    const gateway = await getGatewayData();
    console.log("gateway2222", gateway);
    
    if (gateway && gateway.__networkError) {
      return { networkError: true, needsAuthentication: false, needsSubscription: false };
    }

    if (!gateway) return { needsAuthentication: false, needsSubscription: false };

    return {
      networkError: false,
      needsAuthentication: gateway.gatewayLock,
      needsSubscription: !gateway.subscriptionIsActive
    };
  };

  const updateGatewayData = async (lockStatus) => {
    try {
      const gateway = await getGatewayData();
      if (!gateway) return null;
      const input = {
        id: gateway.id,
        gatewaystatusPatch: {
          gatewayLock: lockStatus,
          lastUpdated: new Date().toISOString(),
          subscriptionStart: "2024-01-01",
          subscriptionEnd: "2050-12-31",
          subscriptionIsActive: true
        }
      };

      const result = await graphqlClient.request(UPDATE_GATEWAY, { input });
      toast.success("Gateway updated successfully!", result);
      return result.updateGatewaystatusById.gatewaystatus;
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
    isLoggedIn,
    hasProfile,
    hasAnyProfile,
    getGatewayData
  };
};

export default useAuth;
