import { useState } from 'react';
import styles from './Analytics.module.css';
import SimpleChart from './SimpleChart';

export default function Analytics({ data, isMobile }) {
  const [activeChart, setActiveChart] = useState('revenue');

  if (!data || !data.chartData) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>אנליטיקה</h2>
        </div>
        <div className={styles.skeleton}>
          <div className={styles.skeletonChart}></div>
        </div>
      </div>
    );
  }

  const chartOptions = [
    {
      id: 'revenue',
      label: 'הכנסות',
      icon: '💰',
      data: data.chartData.revenue,
      type: 'line'
    },
    {
      id: 'appointments',
      label: 'הזמנות',
      icon: '📅',
      data: data.chartData.appointments,
      type: 'bar'
    },
    {
      id: 'services',
      label: 'שירותים פופולריים',
      icon: '⭐',
      data: data.chartData.topServices,
      type: 'horizontal-bar'
    }
  ];

  const activeChartData = chartOptions.find(chart => chart.id === activeChart);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>אנליטיקה ודוחות</h2>
        
        {/* Chart selector */}
        <div className={styles.chartSelector}>
          {chartOptions.map((chart) => (
            <button
              key={chart.id}
              className={`${styles.chartButton} ${
                activeChart === chart.id ? styles.active : ''
              }`}
              onClick={() => setActiveChart(chart.id)}
            >
              <span className={styles.chartIcon}>{chart.icon}</span>
              {!isMobile && <span>{chart.label}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div className={styles.chartContainer}>
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>
            {activeChartData?.icon} {activeChartData?.label}
          </h3>
          
          {/* Time period selector */}
          <div className={styles.periodSelector}>
            <button className={`${styles.periodButton} ${styles.active}`}>
              30 יום
            </button>
            <button className={styles.periodButton}>
              7 יום
            </button>
            <button className={styles.periodButton}>
              היום
            </button>
          </div>
        </div>

        <div className={styles.chart}>
          <SimpleChart
            data={activeChartData?.data || []}
            type={activeChartData?.type || 'line'}
            height={isMobile ? 250 : 300}
          />
        </div>
      </div>

      {/* Insights */}
    </div>
  );
}