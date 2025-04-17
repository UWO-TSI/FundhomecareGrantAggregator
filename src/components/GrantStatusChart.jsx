import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const GrantStatusChart = ({ grants }) => {
  const statusCount = {
    Applied: 0,
    Granted: 0,
    'Not Granted': 0,
    'In Process': 0,
  };

  grants.forEach(grant => {
    statusCount[grant.status] = (statusCount[grant.status] || 0) + 1;
  });

  const data = {
    labels: Object.keys(statusCount),
    datasets: [
      {
        label: '# of Grants',
        data: Object.values(statusCount),
        backgroundColor: ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0'],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: '400px', margin: '20px auto' }}>
      <h3>Grant Status Overview</h3>
      <Pie data={data} />
    </div>
  );
};

export default GrantStatusChart;
