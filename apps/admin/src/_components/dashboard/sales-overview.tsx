'use client';

import { Chart } from 'primereact/chart';
import { Dropdown } from 'primereact/dropdown';
import { useEffect, useState } from 'react';

const SaleOverview = () => {
  const [chartData, setChartData] = useState({});
  const [chartOptions, setChartOptions] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [{ name: 'Weekly' }, { name: 'Monthly' }, { name: 'Yearly' }];

  useEffect(() => {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary') || '#40484b';
    const primaryColor = documentStyle.getPropertyValue('--primary-color') || '#00898f';

    const data = {
      labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      datasets: [
        {
          label: 'Appointments',
          data: [35, 45, 30, 60, 40, 75, 50],
          fill: true,
          borderColor: primaryColor,
          tension: 0.4,
          backgroundColor: 'rgba(0, 137, 143, 0.03)',
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    };

    const options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        x: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: textColorSecondary,
            font: {
              family: 'Inter',
              size: 12
            }
          }
        },
        y: {
          grid: {
            display: false,
            drawBorder: false
          },
          ticks: {
            color: textColorSecondary,
            font: {
              family: 'Inter',
              size: 12
            }
          }
        }
      }
    };

    setChartData(data);
    setChartOptions(options);
  }, []);

  return (
    <div className="card h-full">
      <div className="flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-xs font-bold text-500 uppercase tracking-wider block" style={{ letterSpacing: '0.05em' }}>Overview</span>
          <h5 className="m-0 text-xl font-bold text-900" style={{ fontFamily: "'Hanken Grotesk', sans-serif" }}>Appointment Trends</h5>
        </div>
        <Dropdown value={selectedCategory} onChange={(e) => setSelectedCategory(e.value)} options={categories} optionLabel="name" placeholder="Select Range" className="w-10rem" />
      </div>

      <div style={{ height: '300px' }}>
        <Chart type="line" data={chartData} options={chartOptions} style={{ height: '100%', width: '100%' }} />
      </div>
    </div>
  );
};

export default SaleOverview;
