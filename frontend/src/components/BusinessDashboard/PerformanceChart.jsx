import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import styles from './PerformanceChart.module.css';

export default function PerformanceChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>
        <div className={styles.emptyState}>
          אין נתונים להצגה (אין תורים שהושלמו בשבוע האחרון)
        </div>
      </div>
    );
  }

  // Process and format data for Recharts
  const processedData = data.map(item => {
    const dateObj = new Date(item.date);
    return {
      date: item.date,
      revenue: parseFloat(item.revenue) || 0,
      dayMonth: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`,
      fullDate: new Date(item.date).toLocaleDateString('he-IL', {
        day: 'numeric',
        month: 'short'
      })
    };
  });

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{payload[0].payload.fullDate}</p>
          <p className={styles.tooltipRevenue}>
            ₪{payload[0].value.toLocaleString('he-IL', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Format Y-axis values
  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `₪${(value / 1000).toFixed(1)}k`;
    }
    return `₪${value}`;
  };

  // Calculate dynamic bar color based on revenue value
  const maxRevenue = Math.max(...processedData.map(item => item.revenue));
  const getBarColor = (revenue) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 80) return 'var(--stats-green)';
    if (percentage >= 50) return 'var(--stats-cyan)';
    if (percentage >= 30) return 'var(--stats-blue)';
    return 'var(--stats-orange)';
  };

  return (
    <div className={styles.chartCard}>
      <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={processedData}
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
            <XAxis
              dataKey="dayMonth"
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-light)' }}
            />
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--border-light)' }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--bg-hover)' }} />
            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]}
              maxBarSize={60}
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.revenue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
