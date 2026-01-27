import { useState, useEffect, useRef } from "react";
import { graphqlClient } from "../services/client";
import { GET_PROFILE_DATA } from "../services/query";
import useRole from "../redux/store/useRole";
import useGateWayName from "../redux/store/useGateWayName";
import { configInit } from "../components/layout/globalvariable";

export function useAppInitialization() {
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [roleLoaded, setRoleLoaded] = useState(false);
  const [systemInfo, setSystemInfo] = useState(null);

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
        const response = await fetch(`${configInit.appBaseUrl}/api/profiles`);
        const profiles = await response.json();
        
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
        console.error("GraphQL Init Error:", err);
      } finally {
        setProfileLoaded(true);
        setIsLoading(false);
      }

      // Fetch fast system info
      try {
        const res = await fetch(`${configInit.appBaseUrl}/api/system-info`, {
          signal: AbortSignal.timeout(5000),
        });
        const fastData = await res.json();
        const hostname = fastData?.hostname || "will-be-updated";
        configInit.gatewayName = hostname;
        setGateWayId(hostname);
        setSystemInfo(fastData); // Set the fresh system info
    
      } catch (err) {
        const name = err?.name || '';
        if (name === 'AbortError' || name === 'TimeoutError') {
          console.warn('Fast system info request timed out');
        } else {
          console.error('Fast system info error:', err);
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
  };
}
