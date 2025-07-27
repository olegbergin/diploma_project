import React from 'react';
import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner';
import styles from './KPICards.module.css';

export default function KPICards({ data, loading }) {
  const kpiData = [
    {
      key: 'totalBookings',
      title: 'סה״כ תורים',
      value: data?.totalBookings || 0,
      subtitle: 'השנה',
      icon: '📅',
      trend: data?.totalBookings > 0 ? '+15%' : '-',
      trendType: data?.totalBookings > 0 ? 'positive' : 'neutral',
      color: 'primary'
    },
    {
      key: 'upcomingBookings',
      title: 'תורים קרובים',
      value: data?.upcomingBookings || 0,
      subtitle: 'השבועיים הקרובים',
      icon: '⏰',
      trend: data?.upcomingBookings > 0 ? '+2' : '-',
      trendType: data?.upcomingBookings > 0 ? 'positive' : 'neutral',
      color: 'success'
    },
    {
      key: 'favoriteBusinesses',
      title: 'עסקים מועדפים',
      value: data?.favoriteBusinesses || 0,
      subtitle: 'ברשימה שלך',
      icon: '⭐',
      trend: data?.favoriteBusinesses > 0 ? '+1' : '-',
      trendType: data?.favoriteBusinesses > 0 ? 'positive' : 'neutral',
      color: 'warning'
    },
    {
      key: 'averageRating',
      title: 'דירוג ממוצע',
      value: data?.averageRating || 0,
      subtitle: 'מהביקורות שלך',
      icon: '🌟',
      trend: data?.averageRating > 0 ? '+0.2' : '-',
      trendType: data?.averageRating > 0 ? 'positive' : 'neutral',
      color: 'info'
    }
  ];

  if (loading) {
    return (
      <div className={styles.kpiContainer}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="medium" message="טוען נתוני מדדים..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.kpiContainer}>
      {kpiData.map((kpi, index) => (
        <div 
          key={kpi.key} 
          className={`${styles.kpiCard} ${styles[kpi.color]}`}
          style={{ '--animation-delay': `${index * 0.1}s` }}
        >
          <div className={styles.kpiHeader}>
            <div className={styles.kpiIcon}>
              <span className={styles.iconEmoji}>{kpi.icon}</span>
            </div>
            <div className={styles.kpiTrend}>
              <span className={`${styles.trendValue} ${styles[kpi.trendType]}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
          
          <div className={styles.kpiContent}>
            <div className={styles.kpiValue}>
              {typeof kpi.value === 'number' && kpi.value % 1 !== 0 
                ? kpi.value.toFixed(1) 
                : kpi.value
              }
            </div>
            <div className={styles.kpiTitle}>{kpi.title}</div>
            <div className={styles.kpiSubtitle}>{kpi.subtitle}</div>
          </div>
          
          <div className={styles.kpiBackground}>
            <div className={styles.kpiPattern}></div>
          </div>
          
          <div className={styles.kpiGlow}></div>
        </div>
      ))}
    </div>
  );
}