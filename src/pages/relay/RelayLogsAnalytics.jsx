import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Button,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip
} from '@mui/material';
import {
  Download,
  PictureAsPdf,
  TableChart,
  BarChart,
  Assessment,
  AccessTime
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const RelayLogsAnalytics = ({ relayLogs }) => {
  const [exportFormat, setExportFormat] = useState('excel');
  const [timeRange, setTimeRange] = useState('all');

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!relayLogs.length) return {
      totalLogs: 0,
      onCount: 0,
      offCount: 0,
      sourceStats: {},
      timeStats: {}
    };

    const stats = {
      totalLogs: relayLogs.length,
      onCount: 0,
      offCount: 0,
      sourceStats: {},
      timeStats: {
        averageOnTime: 0,
        averageOffTime: 0,
        peakHour: 0,
        peakHour: 0
      }
    };

    relayLogs.forEach(log => {
      // Count ON/OFF states
      if (log.status?.includes('→ true')) {
        stats.onCount++;
      } else if (log.status?.includes('→ false')) {
        stats.offCount++;
      }

      // Source statistics
      const source = log.source || 'Unknown';
      stats.sourceStats[source] = (stats.sourceStats[source] || 0) + 1;

      // Time statistics
      if (log.createdAt) {
        const hour = new Date(log.createdAt).getHours();
        stats.timeStats.peakHour = Math.max(stats.timeStats.peakHour, hour);
      }
    });

    return stats;
  }, [relayLogs]);

  // Filter logs by time range
  const filteredLogs = useMemo(() => {
    if (timeRange === 'all') return relayLogs;
    
    const now = new Date();
    const cutoffDate = new Date();
    
    switch (timeRange) {
      case '24h':
        cutoffDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      default:
        return relayLogs;
    }
    
    return relayLogs.filter(log => new Date(log.createdAt) >= cutoffDate);
  }, [relayLogs, timeRange]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: i,
      count: 0
    }));

    filteredLogs.forEach(log => {
      if (log.createdAt) {
        const hour = new Date(log.createdAt).getHours();
        hourlyData[hour].count++;
      }
    });

    return hourlyData;
  }, [filteredLogs]);

  const sourceChartData = useMemo(() => {
    const sourceData = {};
    filteredLogs.forEach(log => {
      const source = log.source || 'Unknown';
      sourceData[source] = (sourceData[source] || 0) + 1;
    });

    return Object.entries(sourceData).map(([source, count]) => ({
      source,
      count
    }));
  }, [filteredLogs]);

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLogs.map(log => ({
      'Time': new Date(log.createdAt).toLocaleString(),
      'Relay': log.relayId,
      'Status': log.status,
      'Mode': log.mode,
      'Source': log.source,
      'Message': log.message
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relay Logs');
    XLSX.writeFile(wb, `relay_logs_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    const tableData = filteredLogs.map(log => [
      new Date(log.createdAt).toLocaleString(),
      log.relayId,
      log.status,
      log.mode,
      log.source,
      log.message
    ]);

    doc.autoTable(tableData, {
      head: ['Time', 'Relay', 'Status', 'Mode', 'Source', 'Message'],
      styles: {
        fontSize: 10,
        cellPadding: 3
      }
    });

    doc.save(`relay_logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Time,Relay,Status,Mode,Source,Message'];
    const csvData = filteredLogs.map(log => [
      `"${new Date(log.createdAt).toLocaleString()}"`,
      log.relayId,
      `"${log.status}"`,
      log.mode,
      `"${log.source}"`,
      `"${log.message}"`
    ].join(','));

    const csv = [headers.join(','), ...csvData].join('\n').join(',');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relay_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Relay Logs Analytics
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Assessment color="primary" />
                <Box>
                  <Typography variant="h4">{statistics.totalLogs}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Logs</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BarChart color="success" />
                <Box>
                  <Typography variant="h4">{statistics.onCount}</Typography>
                  <Typography variant="caption" color="text.secondary">ON Events</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <BarChart color="error" />
                <Box>
                  <Typography variant="h4">{statistics.offCount}</Typography>
                  <Typography variant="caption" color="text.secondary">OFF Events</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AccessTime color="warning" />
                <Box>
                  <Typography variant="h4">{statistics.timeStats.peakHour}:00</Typography>
                  <Typography variant="caption" color="text.secondary">Peak Hour</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                displayEmpty
              >
                <MenuItem value="all">All Time</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl size="small" fullWidth>
              <Select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
                displayEmpty
              >
                <MenuItem value="excel">Excel</MenuItem>
                <MenuItem value="pdf">PDF</MenuItem>
                <MenuItem value="csv">CSV</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={() => {
                switch (exportFormat) {
                  case 'excel': exportToExcel(); break;
                  case 'pdf': exportToPDF(); break;
                  case 'csv': exportToCSV(); break;
                }
              }}
              fullWidth
            >
              Export {exportFormat.toUpperCase()}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Hourly Activity
            </Typography>
            <Box sx={{ height: 320, display: 'flex', alignItems: 'flex-end' }}>
              {chartData.map((data, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: 1,
                    mx: 0.5,
                    height: `${(data.count / Math.max(...chartData.map(d => d.count))) * 300}px`,
                    bgcolor: 'primary.main',
                    borderRadius: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pb: 1
                  }}
                >
                  <Typography variant="caption" color="white" sx={{ pb: 0.5 }}>
                    {data.hour}:00
                  </Typography>
                  <Typography variant="caption" color="white">
                    {data.count}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, height: 400 }}>
            <Typography variant="h6" gutterBottom>
              Source Distribution
            </Typography>
            <Box sx={{ height: 320 }}>
              {sourceChartData.map((data, index) => (
                <Box
                  key={data.source}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 1,
                    bgcolor: 'grey.50',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="body2">{data.source}</Typography>
                  <Chip
                    label={data.count}
                    color="primary"
                    size="small"
                    variant="filled"
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Table */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Detailed Logs ({filteredLogs.length} entries)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Relay</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Mode</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.slice(0, 50).map((log) => (
              <TableRow key={log.id}>
                <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                <TableCell>{log.relayId}</TableCell>
                <TableCell>
                  <Chip
                    label={log.status}
                    color={log.status?.includes('→ true') ? 'error' : log.status?.includes('→ false') ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{log.mode}</TableCell>
                <TableCell>{log.source}</TableCell>
                <TableCell>{log.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredLogs.length > 50 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Showing first 50 entries. Use export to view all data.
          </Typography>
        )}
      </Paper>
    </Box>
  );
};

export default RelayLogsAnalytics;
