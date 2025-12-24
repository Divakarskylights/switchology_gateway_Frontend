import React from 'react';
import { Box, Typography, Paper, Grid, Card, CardContent } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const RelayCharts = ({ relayLogs }) => {
  // Prepare data for different charts
  const hourlyData = React.useMemo(() => {
    const data = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      onCount: 0,
      offCount: 0,
      totalCount: 0
    }));

    relayLogs.forEach(log => {
      if (log.createdAt) {
        const hour = new Date(log.createdAt).getHours();
        data[hour].totalCount++;
        if (log.status?.includes('→ true')) {
          data[hour].onCount++;
        } else if (log.status?.includes('→ false')) {
          data[hour].offCount++;
        }
      }
    });

    return data;
  }, [relayLogs]);

  const sourceData = React.useMemo(() => {
    const sourceMap = {};
    relayLogs.forEach(log => {
      const source = log.source || 'Unknown';
      if (!sourceMap[source]) {
        sourceMap[source] = { name: source, value: 0, onCount: 0, offCount: 0 };
      }
      sourceMap[source].value++;
      if (log.status?.includes('→ true')) {
        sourceMap[source].onCount++;
      } else if (log.status?.includes('→ false')) {
        sourceMap[source].offCount++;
      }
    });
    return Object.values(sourceMap);
  }, [relayLogs]);

  const relayActivityData = React.useMemo(() => {
    const relayMap = {};
    relayLogs.forEach(log => {
      const relayId = log.relayId || 0;
      if (!relayMap[relayId]) {
        relayMap[relayId] = { relay: relayId, onCount: 0, offCount: 0, totalCount: 0 };
      }
      relayMap[relayId].totalCount++;
      if (log.status?.includes('→ true')) {
        relayMap[relayId].onCount++;
      } else if (log.status?.includes('→ false')) {
        relayMap[relayId].offCount++;
      }
    });
    return Object.values(relayMap).sort((a, b) => a.relay - b.relay);
  }, [relayLogs]);

  const timeSeriesData = React.useMemo(() => {
    const timeMap = {};
    relayLogs.forEach(log => {
      if (log.createdAt) {
        const date = new Date(log.createdAt).toLocaleDateString();
        if (!timeMap[date]) {
          timeMap[date] = { date, onCount: 0, offCount: 0, totalCount: 0 };
        }
        timeMap[date].totalCount++;
        if (log.status?.includes('→ true')) {
          timeMap[date].onCount++;
        } else if (log.status?.includes('→ false')) {
          timeMap[date].offCount++;
        }
      }
    });
    return Object.values(timeMap).slice(-30); // Last 30 days
  }, [relayLogs]);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relay Analytics Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* Hourly Activity Chart */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Relay Activity
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onCount" stackId="a" fill="#4CAF50" name="ON Events" />
                <Bar dataKey="offCount" stackId="a" fill="#F44336" name="OFF Events" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Source Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Source Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={sourceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Relay Activity by Relay Number */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Activity by Relay
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={relayActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="relay" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="onCount" fill="#4CAF50" name="ON" />
                <Bar dataKey="offCount" fill="#F44336" name="OFF" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Time Series Line Chart */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Daily Activity Trend (Last 30 Days)
            </Typography>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="onCount" stroke="#4CAF50" strokeWidth={2} name="ON Events" />
                <Line type="monotone" dataKey="offCount" stroke="#F44336" strokeWidth={2} name="OFF Events" />
                <Line type="monotone" dataKey="totalCount" stroke="#2196F3" strokeWidth={2} name="Total Events" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Statistics Cards */}
        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="primary">
                    {relayLogs.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="success.main">
                    {relayLogs.filter(log => log.status?.includes('→ true')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ON Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="error.main">
                    {relayLogs.filter(log => log.status?.includes('→ false')).length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    OFF Events
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent>
                  <Typography variant="h4" color="info.main">
                    {sourceData.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Sources
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RelayCharts;
