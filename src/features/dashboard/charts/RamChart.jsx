import React, { useEffect, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Box, CircularProgress, Typography } from '@mui/material';

const RamChart = ({ totalRAM, AvailRAM, usedRAM }) => {
  const [series, setSeries] = useState([0, 100]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (totalRAM > 0) {
      const usedP = (usedRAM / totalRAM) * 100;
      const availableP = (AvailRAM / totalRAM) * 100;
      setSeries([usedP, availableP]);
      setIsLoading(false);
    }
  }, [usedRAM, totalRAM, AvailRAM]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (totalRAM === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Typography>RAM Data Not Available</Typography>
      </Box>
    );
  }

  const options = {
    chart: {
      type: 'donut',
    },
    labels: [
      `Used RAM: ${(Number(usedRAM) || 0).toFixed(2)} MB`,
      `Available RAM: ${(Number(AvailRAM) || 0).toFixed(2)} MB`,
    ],
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '12px',
      offsetY: 5,
      itemMargin: {
        horizontal: 5,
        vertical: 2,
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      y: {
        formatter: function (val) {
          return (typeof val === 'number' ? val.toFixed(2) : '0.00') + '%';
        },
      },
    },
    colors: ['#d32f2f', '#4caf50'], // Red for used, Green for available
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '16px',
              fontWeight: 600,
              offsetY: -10,
            },
            value: {
              show: true,
              fontSize: '18px',
              fontWeight: 'bold',
              offsetY: 5,
              formatter: function (val) {
                return (typeof val === 'number' ? val.toFixed(1) : '0.0') + '%';
              },
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total RAM',
              fontSize: '14px',
              color: '#373d3f',
              formatter: function () {
                return (Number(totalRAM) || 0).toFixed(2) + ' MB';
              },
            },
          },
        },
      },
    },
  };

  return (
    <div id="ram-chart" style={{ width: '100%', height: '100%' }}>
      <ReactApexChart options={options} series={series} type="donut" height="100%" width="100%" />
    </div>
  );
};

export default RamChart;