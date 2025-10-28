import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import useAuth from '../../hooks/useAuth';
import { IOSSwitch } from './IOSSwitch';
const SESSION_LIMIT = 10 * 60; // 2 minutes in seconds 

const SessionTimer = () => {
  const [remainingTime, setRemainingTime] = useState(SESSION_LIMIT);
  const [enabled, setEnabled] = useState(true); // toggle on/off 
  const { logout } = useAuth();

  // 🔹 Reset session timestamp 
  const resetSession = useCallback(() => {
    const tokenDataStr = sessionStorage.getItem('secureTokenData');
    if (!tokenDataStr) return;
    try {
      const tokenData = JSON.parse(tokenDataStr);
      tokenData.createdAt = Date.now();
      sessionStorage.setItem('secureTokenData', JSON.stringify(tokenData));
      setRemainingTime(SESSION_LIMIT); // refresh UI immediately 
    } catch (error) {
      console.error("Failed to reset session", error);
    }
  }, []);

  // 🔹 Track remaining time 
  const getRemainingTime = () => {
    const tokenDataStr = sessionStorage.getItem('secureTokenData');
    if (!tokenDataStr) return 0;
    try {
      const tokenData = JSON.parse(tokenDataStr);
      const createdAt = tokenData.createdAt;
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - createdAt) / 1000);
      return Math.max(0, SESSION_LIMIT - elapsedSeconds);
    } catch (error) {
      return 0;
    }
  };

  // 🔹 Listen for user activity 
  useEffect(() => {
    if (!enabled) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach(ev => window.addEventListener(ev, resetSession));
    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetSession));
    };
  }, [enabled, resetSession]);

  // 🔹 Timer countdown 
  useEffect(() => {
    if (!enabled) return;
    const updateTimer = () => {
      const time = getRemainingTime();
      setRemainingTime(time);
      if (time <= 0) {
        logout();
      }
    }; 
    const interval = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(interval);
  }, [enabled, logout]);

  const formatTime = (seconds) => {
    if (seconds <= 0) return 'Expired';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getColor = () => {
    if (remainingTime <= 30)
      return '#1E88E5';
    if (remainingTime <= 60)
      return '#26A69A'; return '#43A047';
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Tooltip title={!enabled ? "Auto Logout Disabled" : "Auto Logout Enabled"} placement="top" >
        <IOSSwitch checked={enabled} onChange={() => setEnabled(!enabled)} />
      </Tooltip>
      {!enabled && (
        <Typography variant="caption" sx={{ color: 'text' }}>
          {"Disabled"}
        </Typography>)}
      {enabled && (
        <Tooltip title={`Expires in ${formatTime(remainingTime)}`} arrow>
          <Typography variant="caption" sx={{ color: getColor() }}>
            {formatTime(remainingTime)}
          </Typography>
        </Tooltip>
      )}
    </Box>
  );
}; export default SessionTimer;