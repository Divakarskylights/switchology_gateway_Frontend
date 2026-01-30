import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Error404Page from "../../components/common/404ErrorPage";
import { configInit } from "../../components/layout/globalvariable";

const HEALTH_ENDPOINT = `${configInit.appBaseUrl}/api/system-info`;

const ServerIssuePage = () => {
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  const fallbackRoute = useCallback(() => {
    const from = location.state?.from;
    if (from && from !== "/server-issue") return from;
    const storedRoute = sessionStorage.getItem("lastKnownRoute");
    if (storedRoute && storedRoute !== "/server-issue") return storedRoute;
    return "/dashboard";
  }, [location.state]);

  const checkServerHealth = useCallback(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    try {
      const res = await fetch(HEALTH_ENDPOINT, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });
      if (res.ok) {
        const target = fallbackRoute() || "/dashboard";
        try {
          sessionStorage.setItem("lastKnownRoute", target);
        } catch (err) {
          console.warn("Failed to persist last route before reload:", err);
        }
        window.location.replace(target);
        return true;
      }
    } catch (err) {
      console.warn("Server health check failed:", err);
    } finally {
      clearTimeout(timeout);
    }
    setChecking(false);
    return false;
  }, [fallbackRoute]);

  useEffect(() => {
    checkServerHealth();
  }, [checkServerHealth]);

  const handleRetry = useCallback(() => {
    setChecking(true);
    checkServerHealth();
  }, [checkServerHealth]);

  return <Error404Page onRetry={handleRetry} showReload={!checking} />;
};

export default ServerIssuePage;
