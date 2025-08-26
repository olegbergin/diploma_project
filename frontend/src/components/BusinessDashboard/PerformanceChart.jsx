import React from 'react';
import styles from './PerformanceChart.module.css';

export default function PerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>
        <div className={styles.emptyState}>אין נתונים להצגה</div>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.revenue));
  const yAxisLabels = [0, maxValue / 2, maxValue].map(val => Math.round(val));

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>
      <div className={styles.chartWrapper}>
        <div className={styles.yAxis}>
          {yAxisLabels.map(label => <div key={label} className={styles.yLabel}>₪{label}</div>)}
        </div>
        <div className={styles.chart}>
          {data.map((item, index) => (
            <div key={index} className={styles.barWrapper}>
              <div 
                className={styles.bar} 
                style={{ height: `${(item.revenue / maxValue) * 100}%` }}
                title={`₪${item.revenue}`}
              ></div>
              <div className={styles.xLabel}>
                {new Date(item.date).toLocaleDateString('he-IL', { weekday: 'short' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
