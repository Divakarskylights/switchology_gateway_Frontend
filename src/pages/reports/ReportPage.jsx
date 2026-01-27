import React, { useEffect, useState } from 'react';
import {
  Box, Button, CircularProgress, Container, LinearProgress, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Fade, Grow, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { TOAST_IDS } from '../../constants/toastIds';
import { useDateRange } from '../../redux/store/useDateRange';
import { configInit } from '../../components/layout/globalvariable';
import { MeterReportForm } from '../../features/reports/components/MeterReportForm';

const ReportPage = () => {
  const { dateRange } = useDateRange();
  const [token] = useState(localStorage.getItem('accessToken') || '');
  const [meterData, setMeterData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meterName, setMeterName] = useState('');
  const [parameters, setParameters] = useState([]);
  const [interval, setInterval] = useState({ duration: 60, type: 's' });
  const [aggregator, setAggregator] = useState('mean');
  const [backdrop, setBackdrop] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [isPdfView, setIsPdfView] = useState(false);
  const [loaded, setLoaded] = useState(true); // For animation
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const fetchMeterData = async () => {
    try {
      const { data } = await axios.get(
        `${configInit.appBaseUrl}/v2/api/meterconfig/getallmeter`
      );
      // console.log('Fetched meterData:', data);
      setMeterData(data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to fetch meter data', { toastId: TOAST_IDS.REPORT_GENERATE });
      setLoading(false);
    }
  };

  const fetchGeneratedFiles = async () => {
    try {
      const { data } = await axios.get(`${configInit.appBaseUrl}/v2/api/db/generated-files`);
      setTableData(
        data.files.map(file => ({
          fileName: file.name,
          dateCreated: file.createdAt,
          fileUrl: `${configInit.appBaseUrl}/generatedDownload/${file.name}`
        }))
      );
    } catch (error) {
      setTableData([]);
      toast.error('Failed to fetch generated files', { toastId: TOAST_IDS.REPORT_GENERATE });
    }
  };

  useEffect(() => {
    fetchMeterData();
    fetchGeneratedFiles();
  }, [token]);

  const getUnixTimestampWithOffset = (dateString) => {
    const date = new Date(dateString);
    date.setHours(date.getHours() + 5, date.getMinutes() + 30);
    return Math.floor(date.getTime() / 1000);
  };

  const handleDownload = async () => {
    setBackdrop(true);
    try {
      const response = await axios.post(
        `${configInit.appBaseUrl}/v2/api/db/download-data`,
        {
          tableName: meterName,
          columns: parameters,
          startdate: getUnixTimestampWithOffset(dateRange.startDate),
          enddate: getUnixTimestampWithOffset(dateRange.endDate),
          interval: `${interval.duration}${interval.type}`,
          aggregator,
        },
        { responseType: 'blob' }
      );
      // After successful generation, refresh the table
      await fetchGeneratedFiles();
    } catch (error) {
      toast.error(error.response?.data || 'Failed to process request', { toastId: TOAST_IDS.REPORT_GENERATE });
    } finally {
      setBackdrop(false);
    }
  };

  const formatDate = (dateString) => new Date(dateString);

  if (loading) return <CircularProgress sx={{ m: 'auto', display: 'block', mt: 4 }} />;
  if (!meterData?.measurements?.length) {
    // Show full-screen message if no meters are found
    return (
      <Container maxWidth={false} sx={{ py: 2, minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error" variant="h5" align="center">
          No meters found. Please add a meter to generate reports.
        </Typography>
      </Container>
    );
  }
  return (
    <Fade in={loaded} timeout={700}>
      <Container maxWidth={false} sx={{ py: 2 }}>
      
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
          <MeterReportForm
            meterName={meterName}
            setMeterName={setMeterName}
            meterData={meterData}
            parameters={parameters}
            setParameters={setParameters}
            interval={interval}
            setInterval={setInterval}
            aggregator={aggregator}
            setAggregator={setAggregator}
            onGenerateClick={() => setConfirmDialogOpen(true)}
          />
        </Paper>
        {/* Confirmation Dialog */}
        <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
          <DialogTitle>Confirm Download</DialogTitle>
          <DialogContent>
            <Typography>Are you sure you want to download?</Typography>
          </DialogContent>
          <DialogActions>
            <Button  onClick={() => setConfirmDialogOpen(false)} color="inherit">Cancel</Button>
            <Button
              onClick={() => {
                setConfirmDialogOpen(false);
                handleDownload();
              }}
              color="primary"
              variant="contained"
            >
              Download
            </Button>
          </DialogActions>
        </Dialog>


        <Typography variant="h6" sx={{ mt: 2 }}>Generated Reports</Typography>
        <Typography variant="body2" color="error" fontStyle={'italic'} sx={{ mb: 1 }}>
         (Note: Only the latest 10 files are retained; older files are automatically deleted.)
        </Typography>
        <Grow in={loaded} timeout={500}>
          <TableContainer component={Paper} elevation={3} sx={{ mt: 1, borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>S. No.</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>File Name</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.length ? (
                  tableData
                    .filter(item => item.fileName.endsWith(isPdfView ? '.pdf' : '.csv'))
                    .sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
                    .map((item, index) => (
                      <TableRow key={index} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{configInit.formatDates(item.dateCreated)}</TableCell>
                        <TableCell>{item.fileName}</TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = item.fileUrl;
                              link.setAttribute('download', item.fileName);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);

                              toast.success('Download started', { toastId: TOAST_IDS.REPORT_GENERATE });
                            }}
                          >
                            Download
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No Data Available</TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        </Grow>

        <LinearProgress sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1300, visibility: backdrop ? 'visible' : 'hidden' }} />
      </Container>
    </Fade>
  );
};

export default ReportPage;