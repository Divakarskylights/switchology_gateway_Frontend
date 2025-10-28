import React from 'react';
import ReactApexChart from 'react-apexcharts';

const StorageChart = ({ totalStorage, AvailStorage, usedStorage }) => {
  const usedPercentage = totalStorage > 0 ? (usedStorage / totalStorage) * 100 : 0;
  const availablePercentage = totalStorage > 0 ? (AvailStorage / totalStorage) * 100 : 0;

  const series = [
    typeof usedPercentage === 'number' ? usedPercentage : 0,
    typeof availablePercentage === 'number' ? availablePercentage : 0,
  ];

  const options = {
    chart: {
      type: 'donut',
    },
    labels: [
      `Used Storage: ${(Number(usedStorage) || 0).toFixed(2)} GB`,
      `Available Storage: ${(Number(AvailStorage) || 0).toFixed(2)} GB`,
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
        formatter: (val) =>
          (typeof val === 'number' ? val.toFixed(2) : '0.00') + '%',
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
              formatter: (val) =>
                (typeof val === 'number' ? val.toFixed(1) : '0.0') + '%',
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Storage',
              fontSize: '14px',
              color: '#373d3f',
              formatter: () =>
                (Number(totalStorage) || 0).toFixed(2) + ' GB',
            },
          },
        },
      },
    },
  };

  return (
    <div id="storage-chart" style={{ width: '100%', height: '100%' }}>
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height="100%"
        width="100%"
      />
    </div>
  );
};

export default StorageChart;
