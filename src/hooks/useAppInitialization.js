import { useState, useEffect, useRef } from "react";
import useRole from "../redux/store/useRole";
import useGateWayName from "../redux/store/useGateWayName";
import { configInit } from "../components/layout/globalvariable";
import { fetchProfilesList } from "../services/profileService";

const isLikelyNetworkError = (err) => {
  if (!err) return false;
  const message = String(err.message || '').toLowerCase();
  return message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('network error') ||
    message.includes('err_connection_refused') ||
    err.name === 'TypeError';
};

export function useAppInitialization() {
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);
  const [networkError, setNetworkError] = useState(false);

  const { setGateWayId } = useGateWayName();
  const { role, setRole } = useRole();
  const initializedRef = useRef(false);

  useEffect(() => {
    const init = async () => {
      // Load system info from localStorage
  
    

      // Load user role from localStorage
      const currentUserId = localStorage.getItem("userid");
      if (currentUserId) {
        const cachedUserRole = localStorage.getItem("userRole");
        if (cachedUserRole && cachedUserRole !== role) setRole(cachedUserRole);
      }
      setRoleLoaded(true);

      // Fetch profile data
      try {
        const profiles = await fetchProfilesList();
        setNetworkError(false);
        
        // Check if any profile exists
        if (profiles.length > 0) {
          setHasProfile(true);
          
          // If user is logged in, find their specific profile for config
          const currentUserId = localStorage.getItem("userid");
          if (currentUserId) {
            const userProfile = profiles.find((p) => p.userid === currentUserId);
            if (userProfile) {
              configInit.orgName = userProfile.orgname;
              configInit.buildingName = userProfile.buildingName;
              configInit.address = userProfile.address;
            }
          }
        }
      } catch (err) {
        console.error("Profile init error:", err);
        if (isLikelyNetworkError(err)) {
          setNetworkError(true);
        }
      } finally {
        setProfileLoaded(true);
        setIsLoading(false);
      }

      // Fetch fast system info
      try {
        const res = await fetch(`${configInit.appBaseUrl}/api/system-info`, {
          signal: AbortSignal.timeout(5000),
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const fastData = await res.json();
        const hostname = fastData?.hostname || "will-be-updated";
        configInit.gatewayName = hostname;
        setGateWayId(hostname);
        setSystemInfo(fastData); // Set the fresh system info
        setNetworkError(false);
    
      } catch (err) {
        const name = err?.name || '';
        if (name === 'AbortError' || name === 'TimeoutError') {
          console.warn('Fast system info request timed out');
        } else {
          console.error('Fast system info error:', err);
          if (isLikelyNetworkError(err)) {
            setNetworkError(true);
          }
        }
      }
    };

    if (!initializedRef.current) {
      initializedRef.current = true;
      init();
    }
  }, [setGateWayId, setRole, role]);

  return {
    isLoading,
    profileLoaded,
    hasProfile,
    role,
    roleLoaded,
    systemInfo,
    networkError,
  };
}
