import React, { useState, useMemo, useEffect } from "react";
import { Box, Paper, Typography, Grid, Chip, Table, TableBody, TableCell, TableHead, TableRow, TablePagination, TextField, InputAdornment, MenuItem, FormControl, Select, Button, IconButton } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DownloadIcon from '@mui/icons-material/Download';
import RelayStatusDisplay from './RelayStatusDisplay';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { graphqlClient } from "../../services/client";
import { GET_PROFILE_DATA } from "../../services/query";

const getRelayStatusColor = (mode) => {
  switch (mode) {
    case 'INPUT': return 'primary';
    case 'OUTPUT': return 'success';
    default: return 'default';
  }
};

const getStatusColor = (status) => {
  if (!status) return 'default';

  // Handle boolean transitions like "false → true", "true → false", "null → true", etc.
  if (status.includes('→ true')) {
    return 'error'; // Red for ON (true)
  } else if (status.includes('→ false')) {
    return 'success'; // Green for OFF (false)
  } else if (status.includes('NONE')) {
    return 'default'; // Gray for NONE
  } else if (status.includes('INPUT')) {
    return 'primary'; // Blue for INPUT
  } else if (status.includes('OUTPUT')) {
    return 'warning'; // Orange for OUTPUT
  }
  return 'default';
};

const formatLocalTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
    hour12: true
  });
};

const RelayStatusAndLogs = ({ configuredRelays, relayLogs, onSetupRelay }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    search: '',
    relayId: '',
    status: '',
    mode: '',
    source: ''
  });
  const [profileData, setProfileData] = useState({
    orgname: '',
    gatewayName: '',
    name: '',
    email: '',
    buildingName: '',
    address: ''
  });

  // Get unique values for filter dropdowns
  const uniqueRelayIds = useMemo(() => {
    const ids = [...new Set(relayLogs.map(log => log.relayId).filter(Boolean))];
    return ids.sort((a, b) => a - b);
  }, [relayLogs]);

  const uniqueStatuses = useMemo(() => {
    return [...new Set(relayLogs.map(log => log.status).filter(Boolean))];
  }, [relayLogs]);

  const uniqueModes = useMemo(() => {
    return [...new Set(relayLogs.map(log => log.mode).filter(Boolean))];
  }, [relayLogs]);

  const uniqueSources = useMemo(() => {
    return [...new Set(relayLogs.map(log => log.source).filter(Boolean))];
  }, [relayLogs]);

  // Apply filters to logs
  const filteredLogs = useMemo(() => {
    return relayLogs.filter(log => {
      const searchMatch = !filters.search ||
        log.message?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.relayId?.toString().includes(filters.search) ||
        log.status?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.mode?.toLowerCase().includes(filters.search.toLowerCase()) ||
        log.source?.toLowerCase().includes(filters.search.toLowerCase());

      const relayMatch = !filters.relayId || log.relayId === filters.relayId;
      const statusMatch = !filters.status || log.status === filters.status;
      const modeMatch = !filters.mode || log.mode === filters.mode;
      const sourceMatch = !filters.source || log.source === filters.source;

      return searchMatch && relayMatch && statusMatch && modeMatch && sourceMatch;
    });
  }, [relayLogs, filters]);

  // Memoize paginated logs for performance
  const paginatedLogs = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredLogs.slice(startIndex, endIndex);
  }, [filteredLogs, page, rowsPerPage]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      relayId: '',
      status: '',
      mode: '',
      source: ''
    });
    setPage(0);
  };

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await graphqlClient.request(GET_PROFILE_DATA);
        const profiles = response.allProfiles?.nodes || [];
        if (profiles.length > 0) {
          const profile = profiles[0];
          setProfileData({
            orgname: profile.orgname || '',
            gatewayName: profile.gatewayName || '',
            name: profile.name || '',
            email: profile.email || '',
            buildingName: profile.buildingName || '',
            address: profile.address || ''
          });
        }
      } catch (error) {
        console.error('Error fetching profile data:', error);
      }
    };

    fetchProfileData();
  }, []);

  // Export functions
  const exportToExcel = () => {
    const exportData = filteredLogs.map(log => ({
      'Time': formatLocalTime(log.createdAt),
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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header function
    const addHeader = (doc, pageNumber) => {
      // Light header bar so dark text is visible
      doc.setFillColor(240, 240, 240); // Light gray background
      doc.rect(0, 0, pageWidth, 22);

      // Logo & Title - dark text for visibility
      doc.setTextColor(33, 33, 33); // Dark gray
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('SWITCHOLOGY', 20, 10);

      // Report Date & Time and Gateway Name in header
      doc.setFontSize(8);
      doc.setTextColor(66, 66, 66); // Medium dark gray
      const reportDateTime = new Date().toLocaleString();
      const gatewayName = profileData.gatewayName || 'Relay Management System';
      doc.text(`${reportDateTime} | ${gatewayName}`, 20, 15);

      // Page number - medium dark text
      doc.setTextColor(66, 66, 66);
      doc.setFontSize(8);
      doc.text(`Page ${pageNumber}`, pageWidth - 25, 19);
    };

    // Calculate statistics
    const onCount = filteredLogs.filter(log => log.status?.includes('→ true')).length;
    const offCount = filteredLogs.filter(log => log.status?.includes('→ false')).length;
    const sourceStats = {};
    const hourlyStats = Array.from({ length: 24 }, (_, i) => ({ hour: i, count: 0 }));
    const relayStats = {};

    filteredLogs.forEach(log => {
      // Source statistics
      const source = log.source || 'Unknown';
      sourceStats[source] = (sourceStats[source] || 0) + 1;

      // Hourly statistics
      if (log.createdAt) {
        const hour = new Date(log.createdAt).getHours();
        hourlyStats[hour].count++;
      }

      // Relay statistics
      const relayId = log.relayId || 0;
      relayStats[relayId] = (relayStats[relayId] || 0) + 1;
    });
    // Page 1: Title and Overview
    addHeader(doc, 1);

    // Organization Profile Section
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(13);                         // Slightly smaller
    doc.setFont(undefined, 'bold');
    doc.text('Organization Profile', 20, 42);    // ↓ from 48 → 42

    // Profile Box
    doc.setFillColor(245, 245, 245);
    // ↓ box height reduced from 40 → 32, moved up
    doc.rect(20, 47, pageWidth - 40, 32, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, 47, pageWidth - 40, 32);

    // Profile Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9.5);                        // Slightly smaller for compact feel
    doc.setFont(undefined, 'bold');
    doc.text(profileData.orgname || 'SWITCHOLOGY INDUSTRIES', 30, 58);   // ↓ from 70 → 58

    doc.setFont(undefined, 'normal');
    doc.text(`Gateway: ${profileData.gatewayName || 'Relay Management System'}`, 30, 64); // ↓ from 78 → 64
    doc.text(`Contact: ${profileData.name || 'System Administrator'}`, 30, 70);           // ↓ from 86 → 70

    // Building and Address Info
    doc.setFontSize(8);
    doc.setTextColor(80, 80, 80);

    // Combine in less space
    let addressLine = '';
    if (profileData.buildingName) addressLine += profileData.buildingName;
    if (profileData.address) addressLine += addressLine ? ', ' + profileData.address : profileData.address;
    if (profileData.email) addressLine += addressLine ? ' | ' + profileData.email : profileData.email;

    // ↓ from 94 → 76 (much closer + inside profile block area)
    doc.text(addressLine || 'Industrial Automation & Control Systems', 30, 76);

    // Report Title
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Relay Logs Analytics Report', pageWidth / 2, 115, { align: 'center' }); // ↓ from 130 → 115

    // Report Info
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    doc.text(`Report Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 124, { align: 'center' });
    doc.text(`Data Period: All Available Records | Total: ${filteredLogs.length} entries`, pageWidth / 2, 132, { align: 'center' });

    // Key Metrics Section starting position more compact
    let yPos = 140;  // ↓ from 165 → 140

    // Calculate positions for 2x2 grid layout
    const cardWidth = 50;
    const cardHeight = 25;
    const cardSpacing = 15;
    const rowSpacing = 20;
    const totalRowWidth = (2 * cardWidth) + cardSpacing;
    const startX = (pageWidth - totalRowWidth) / 2;

    const metrics = [
      { label: 'Total Events', value: filteredLogs.length, color: [0, 102, 204] },
      { label: 'ON Events', value: onCount, color: [76, 175, 80] },
      { label: 'OFF Events', value: offCount, color: [244, 67, 54] },
      { label: 'Sources', value: Object.keys(sourceStats).length, color: [255, 152, 0] }
    ];

    // Draw first row (2 cards)
    metrics.slice(0, 2).forEach((metric, index) => {
      const x = startX + (index * (cardWidth + cardSpacing));
      // Draw box
      doc.setFillColor(...metric.color);
      doc.rect(x, yPos, cardWidth, cardHeight, 'F');

      // Add text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(metric.label, x + (cardWidth / 2), yPos + 12, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value.toString(), x + (cardWidth / 2), yPos + 20, { align: 'center' });
    });

    // Draw second row (2 cards)
    yPos += cardHeight + rowSpacing;
    metrics.slice(2, 4).forEach((metric, index) => {
      const x = startX + (index * (cardWidth + cardSpacing));
      // Draw box
      doc.setFillColor(...metric.color);
      doc.rect(x, yPos, cardWidth, cardHeight, 'F');

      // Add text
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.text(metric.label, x + (cardWidth / 2), yPos + 12, { align: 'center' });
      doc.setFontSize(11);
      doc.setFont(undefined, 'bold');
      doc.text(metric.value.toString(), x + (cardWidth / 2), yPos + 20, { align: 'center' });
    });

    // Summary Statistics Section
    yPos += 50;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Summary Statistics', 20, yPos);

    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Two-column layout for statistics
    const leftCol = 25;
    const rightCol = 110;
    let currentY = yPos;

    // Left column
    doc.text(`• Total ON Events: ${onCount}`, leftCol, currentY);
    currentY += 12;
    doc.text(`• Total OFF Events: ${offCount}`, leftCol, currentY);
    currentY += 12;
    doc.text(`• Peak Hour: ${Object.keys(hourlyStats).reduce((a, b) => (hourlyStats[a] || 0) > (hourlyStats[b] || 0) ? a : b)}:00`, leftCol, currentY);

    // Right column
    currentY = yPos;
    doc.text(`• Active Sources: ${Object.keys(sourceStats).length}`, rightCol, currentY);
    currentY += 12;
    doc.text(`• Active Relays: ${Object.keys(relayStats).length}`, rightCol, currentY);
    currentY += 12;
    doc.text(`• Report Type: Analytics Summary`, rightCol, currentY);

    // Page 2: Charts
    doc.addPage();
    addHeader(doc, 2);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Analytics Charts', 20, 55);

    // Hourly Activity Bar Chart
    yPos = 75;
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Hourly Activity Distribution', 20, yPos);

    // Draw simple bar chart
    yPos += 15;
    const chartWidth = 170;
    const chartHeight = 60;
    const barWidth = chartWidth / 24;
    const maxCount = Math.max(...hourlyStats.map(h => h.count));

    // Chart background
    doc.setFillColor(245, 245, 245);
    doc.rect(20, yPos, chartWidth, chartHeight, 'F');

    // Draw bars
    hourlyStats.forEach((hour, index) => {
      if (hour.count > 0) {
        const barHeight = (hour.count / maxCount) * chartHeight;
        doc.setFillColor(0, 102, 204);
        doc.rect(20 + (index * barWidth), yPos + chartHeight - barHeight, barWidth - 1, barHeight, 'F');
      }
    });

    // Chart labels
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(8);
    for (let i = 0; i < 24; i += 4) {
      doc.text(`${i}:00`, 20 + (i * barWidth), yPos + chartHeight + 10);
    }

    // Source Distribution Pie Chart (simplified as bars)
    yPos += 80;
    doc.setFontSize(14);
    doc.text('Source Distribution', 20, yPos);

    yPos += 15;
    const sourceEntries = Object.entries(sourceStats).slice(0, 5);
    const sourceMax = Math.max(...sourceEntries.map(([, count]) => count));

    sourceEntries.forEach(([source, count], index) => {
      const barWidth = (count / sourceMax) * 100;
      doc.setFillColor(0, 102, 204);
      doc.rect(20, yPos + (index * 12), barWidth, 8, 'F');

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.text(source, 25, yPos + (index * 12) + 6);
      doc.text(`(${count})`, 130, yPos + (index * 12) + 6);
    });

    // Page 3: Detailed Table
    doc.addPage();
    addHeader(doc, 3);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text('Detailed Log Data', 20, 55);

    const tableData = filteredLogs.slice(0, 50).map(log => [
      formatLocalTime(log.createdAt),
      log.relayId?.toString() || '',
      log.status || '',
      log.mode || '',
      log.source || '',
      (log.message || '').substring(0, 30)
    ]);

    autoTable(doc, {
      head: [['Time', 'Relay', 'Status', 'Mode', 'Source', 'Message']],
      body: tableData,
      startY: 70,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [242, 89, 42], // #F2592A primary color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 9
      },
      alternateRowStyles: {
        fillColor: [248, 248, 248]
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Time
        1: { cellWidth: 12 }, // Relay
        2: { cellWidth: 22 }, // Status
        3: { cellWidth: 18 }, // Mode
        4: { cellWidth: 28 }, // Source
        5: { cellWidth: 40 }  // Message
      },
      margin: { left: 10, right: 10 },
      tableWidth: 'auto' // Let table use full available width
    });

    // Footer note
    if (filteredLogs.length > 50) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`Showing first 50 of ${filteredLogs.length} records`, 20, pageHeight - 15);
    }

    doc.save(`relay_logs_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const exportToCSV = () => {
    const headers = ['Time,Relay,Status,Mode,Source,Message'];
    const csvData = filteredLogs.map(log => [
      `"${formatLocalTime(log.createdAt)}"`,
      log.relayId,
      `"${log.status}"`,
      log.mode,
      `"${log.source}"`,
      `"${log.message}"`
    ].join(','));

    const csv = [headers.join(','), ...csvData].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

    // Create download link
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `relay_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      // Fallback for older browsers
      window.open(`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`);
    }
  };
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Relay Status
      </Typography>
      <RelayStatusDisplay configuredRelays={configuredRelays} onSetupRelay={onSetupRelay} />

      {/* Relay Logs (History) */}
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1">
              Relay Logs (History)
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Showing {filteredLogs.length} of {relayLogs.length} logs
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportToExcel}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportToPDF}
            >
              PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              CSV
            </Button>
          </Box>
        </Box>

        {/* Filters */}
        <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <FilterListIcon color="action" />
            <Typography variant="subtitle2">Filters</Typography>
            <Typography
              variant="caption"
              color="primary"
              sx={{ cursor: 'pointer', ml: 'auto' }}
              onClick={clearFilters}
            >
              Clear all
            </Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                size="small"
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl size="small" fullWidth>
                <Select
                  value={filters.relayId}
                  onChange={(e) => handleFilterChange('relayId', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Relays</MenuItem>
                  {uniqueRelayIds.map(id => (
                    <MenuItem key={id} value={id}>Relay {id}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl size="small" fullWidth>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Status</MenuItem>
                  {uniqueStatuses.map(status => (
                    <MenuItem key={status} value={status}>
                      <Chip
                        label={status}
                        color={getStatusColor(status)}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      />
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl size="small" fullWidth>
                <Select
                  value={filters.mode}
                  onChange={(e) => handleFilterChange('mode', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Modes</MenuItem>
                  {uniqueModes.map(mode => (
                    <MenuItem key={mode} value={mode}>{mode}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={2}>
              <FormControl size="small" fullWidth>
                <Select
                  value={filters.source}
                  onChange={(e) => handleFilterChange('source', e.target.value)}
                  displayEmpty
                >
                  <MenuItem value="">All Sources</MenuItem>
                  {uniqueSources.map(source => (
                    <MenuItem key={source} value={source}>{source}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {relayLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No relay logs available.
          </Typography>
        ) : (
          <>
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
                {paginatedLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{formatLocalTime(log.createdAt)}</TableCell>
                    <TableCell>{log.relayId}</TableCell>
                    <TableCell>
                      <Chip
                        label={log.status}
                        color={getStatusColor(log.status)}
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
            <TablePagination
              rows={filteredLogs}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredLogs.length}
            />
          </>
        )}
      </Box>
    </Paper>
  );
};

export default RelayStatusAndLogs;