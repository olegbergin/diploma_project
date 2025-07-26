import React from 'react';
import styles from './KPICards.module.css';

export default function KPICards({ data, loading }) {
  const kpiData = [
    {
      key: 'totalBookings',
      title: 'סה״כ תורים',
      value: data?.totalBookings || 12,
      subtitle: 'השנה',
      icon: '📅',
      trend: '+15%',
      trendType: 'positive',
      color: 'primary'
    },
    {
      key: 'upcomingBookings',
      title: 'תורים קרובים',
      value: data?.upcomingBookings || 3,
      subtitle: 'השבועיים הקרובים',
      icon: '⏰',
      trend: '+2',
      trendType: 'positive',
      color: 'success'
    },
    {
      key: 'favoriteBusinesses',
      title: 'עסקים מועדפים',
      value: data?.favoriteBusinesses || 7,
      subtitle: 'ברשימה שלך',
      icon: '⭐',
      trend: '+1',
      trendType: 'positive',
      color: 'warning'
    },
    {
      key: 'averageRating',
      title: 'דירוג ממוצע',
      value: data?.averageRating || 4.8,
      subtitle: 'מהביקורות שלך',
      icon: '🌟',
      trend: '+0.2',
      trendType: 'positive',
      color: 'info'
    }
  ];

  if (loading) {
    return (
      <div className={styles.kpiContainer}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`${styles.kpiCard} ${styles.loading}`}>
            <div className={styles.loadingSkeleton}></div>
          </div>
        ))}
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