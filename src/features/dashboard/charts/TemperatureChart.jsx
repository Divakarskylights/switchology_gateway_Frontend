
import { Box } from '@mui/material';
import React from 'react';
import ReactApexChart from 'react-apexcharts';

const TemperatureChart = ({ osGatewayTemp }) => { // Renamed component
  const temperatureValue = parseFloat(osGatewayTemp);
  const seriesValue = isNaN(temperatureValue) ? 0 : temperatureValue; // Default to 0 if not a number

  const options = {
    chart: {
      
    },
    plotOptions: {
      radialBar: {
        hollow: {
          size: '50%',
        },
        dataLabels: {
          name: {
            show: false,
            fontSize: '15px',
            fontWeight: 'bold',
          },
          value: {
            show: true,
            fontSize: '20px',
            fontWeight: 'bold',
            formatter: function (val) {
              return (typeof val === 'number' ? val.toFixed(2) : '0.00') + '°C';
            },
          },
        },
      },
    },
    labels: ['Temperature'],
    // If series is a direct value, not a percentage of a total, fill should be simpler
    fill: {
        type: 'gradient',
        gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.5,
            gradientToColors: ['#ABE5A1'], // Color for higher temperatures
            inverseColors: true,
            opacityFrom: 1,
            opacityTo: 1,
            stops: [0, 100] // Assuming temp range 0-100 for gradient, adjust if needed
        }
    },
    // Example stroke, adjust as needed
    stroke: {
        lineCap: 'round'
    },
    legend: {
      show: true,
      position: 'bottom', // Changed to bottom
      horizontalAlign: 'center',
      fontSize: '12px', // Reduced font size for legend
      offsetY: 0,
      itemMargin: {
        horizontal: 5,
        vertical: 5
      }
    },
  };

 const series = [seriesValue]; 

  return (
    <Box id="temperature-chart" style={{ width: '100%', height: '100%' }}> {/* Changed id for clarity */}
      <ReactApexChart options={options} series={series} type="radialBar" height={220} />
    </Box>
  );
};

export default TemperatureChart;

    