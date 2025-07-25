import styles from './KPICards.module.css';

export default function KPICards({ analytics, isMobile }) {
  if (!analytics) {
    return (
      <div className={`${styles.grid} ${isMobile ? styles.mobile : styles.desktop}`}>
        {[...Array(4)].map((_, index) => (
          <div key={index} className={`${styles.card} ${styles.skeleton}`}>
            <div className={styles.skeletonContent}></div>
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      id: 'revenue',
      title: 'הכנסות החודש',
      value: `₪${analytics.revenue.current.toLocaleString()}`,
      change: analytics.revenue.change,
      trend: analytics.revenue.trend,
      icon: '💰',
      color: 'blue'
    },
    {
      id: 'appointments',
      title: 'הזמנות החודש',
      value: analytics.appointments.current.toString(),
      change: analytics.appointments.change,
      trend: analytics.appointments.trend,
      icon: '📅',
      color: 'green'
    },
    {
      id: 'customers',
      title: 'לקוחות חדשים',
      value: analytics.customers.current.toString(),
      change: analytics.customers.change,
      trend: analytics.customers.trend,
      icon: '👥',
      color: 'purple'
    },
    {
      id: 'rating',
      title: 'דירוג ממוצע',
      value: analytics.rating.current.toFixed(1),
      change: analytics.rating.change,
      trend: analytics.rating.trend,
      icon: '⭐',
      color: 'orange'
    }
  ];

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return '📈';
      case 'down': return '📉';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'up': return 'var(--success-color)';
      case 'down': return 'var(--error-color)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className={`${styles.grid} ${isMobile ? styles.mobile : styles.desktop}`}>
      {kpis.map((kpi) => (
        <div 
          key={kpi.id} 
          className={`${styles.card} ${styles[kpi.color]}`}
        >
          <div className={styles.cardHeader}>
            <div className={styles.cardIcon}>{kpi.icon}</div>
            <div className={styles.cardTitle}>{kpi.title}</div>
          </div>
          
          <div className={styles.cardContent}>
            <div className={styles.cardValue}>{kpi.value}</div>
            
            <div className={styles.cardChange}>
              <span 
                className={styles.changeIndicator}
                style={{ color: getTrendColor(kpi.trend) }}
              >
                {getTrendIcon(kpi.trend)}
                <span className={styles.changeValue}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                </span>
              </span>
              <span className={styles.changeLabel}>מהחודש הקודם</span>
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className={styles.miniChart}>
            <div className={`${styles.chartBar} ${styles[kpi.trend]}`}></div>
          </div>
        </div>
      ))}
    </div>
  );
}