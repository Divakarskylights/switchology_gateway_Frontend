import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Grid, Paper, Typography, useTheme, Fade, Grow } from '@mui/material';
import { configInit } from "../../components/layout/globalvariable";
import RamChart from "../../features/dashboard/charts/RamChart";
import StorageChart from "../../features/dashboard/charts/StorageChart";
import TemperatureChart from "../../features/dashboard/charts/TemperatureChart";
import { useAppInitialization } from '../../hooks/useAppInitialization';

const DashboardPage = () => {
  const theme = useTheme();
  const { systemInfo } = useAppInitialization();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  console.log("DashboardPage - systemInfo:", systemInfo);
  console.log("DashboardPage - loading:", loading);
  console.log("DashboardPage - data:", data);

  useEffect(() => {
    try {
      setData(systemInfo);
      setLoading(false);
    } catch (error) {
      console.error("Failed to process system info:", error);
      setLoading(false);
    }
  }, [systemInfo]);

  if (loading) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Fade in timeout={600}>
      <Box sx={{ px: 2, py: 1 }}>
        <Typography variant="h5" mb={1} fontWeight="bold">Gateway Dashboard</Typography>

        {/* System Overview Section */}
        <Paper elevation={2} sx={{ p: 1, mb: 3, backgroundColor: theme.palette.background.paper, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
            System Overview
          </Typography>

          <Grid container spacing={2}>
            {/* Column 1 */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Gateway Serial NO:</strong> {configInit.gatewayName || 'N/A'}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Network Interface:</strong>
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, mb: 0.5 }}>
                Default MAC: {data?.mac?.eth0 || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                Wifi MAC: {data?.mac?.wlan0 || 'N/A'}
              </Typography>
              <Typography variant="body2" sx={{ ml: 2, mb: 1 }}>
                Ethernet IP Address: {data?.ipAddr || 'N/A'}
              </Typography>
              <Typography variant="body1">
                <strong>Device Model:</strong> {"SKYGW0.5GBR"}
              </Typography>
            </Grid>

            {/* Column 2 */}
            <Grid item xs={12} sm={6}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Software Version:</strong> {"SKYGW0.5GBR_V1"}
              </Typography>

              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Up Time:</strong> {data?.uptime || "N/A"}
              </Typography>

              <Typography variant="body1">
                <strong>Manufacture Date:</strong> {"1st Aug 2024"}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Charts Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex' }}>
            <Grow in timeout={800}>
              <Paper sx={{ px: 2, py: 1, flexGrow: 1, height: 270, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">CPU Temperature</Typography>
                <TemperatureChart osGatewayTemp={parseFloat(data?.cpuTemperature) || 0} />
              </Paper>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex' }}>
            <Grow in timeout={800}>
              <Paper sx={{ px: 2, py: 1, flexGrow: 1, height: 270, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">RAM Usage</Typography>
                <RamChart
                  totalRAM={parseFloat(data?.memory?.total) || 0}
                  AvailRAM={parseFloat(data?.memory?.free) || 0}
                  usedRAM={parseFloat(data?.memory?.used) || 0}
                />
              </Paper>
            </Grow>
          </Grid>

          <Grid item xs={12} sm={6} md={4} lg={4} sx={{ display: 'flex' }}>
            <Grow in timeout={800}>
              <Paper sx={{ px: 2, py: 1, flexGrow: 1, height: 270, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="h6">Storage</Typography>
                <StorageChart
                  totalStorage={parseFloat(data?.disk?.total) || 0}
                  AvailStorage={parseFloat(data?.disk?.free) || 0}
                  usedStorage={parseFloat(data?.disk?.used) || 0}
                />
              </Paper>
            </Grow>
          </Grid>
        </Grid>
      </Box>
    </Fade>
  );
};

export default DashboardPage;
