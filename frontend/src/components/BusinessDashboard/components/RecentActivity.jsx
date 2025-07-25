import styles from './RecentActivity.module.css';

export default function RecentActivity({ activities }) {
  if (!activities || activities.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>פעילות אחרונה</h2>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📭</div>
          <p className={styles.emptyText}>אין פעילות אחרונה</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type) => {
    switch (type) {
      case 'booking': return '📅';
      case 'review': return '⭐';
      case 'payment': return '💳';
      case 'cancellation': return '❌';
      case 'message': return '💬';
      default: return '📝';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'var(--error-color)';
      case 'normal': return 'var(--primary-color)';
      case 'low': return 'var(--text-muted)';
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>פעילות אחרונה</h2>
        <button className={styles.viewAllButton}>
          צפה בהכל
        </button>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className={`${styles.activityItem} ${styles[activity.priority]}`}
          >
            <div className={styles.activityIcon}>
              {getActivityIcon(activity.type)}
            </div>
            
            <div className={styles.activityContent}>
              <div className={styles.activityHeader}>
                <h3 className={styles.activityTitle}>
                  {activity.title}
                </h3>
                <span className={styles.activityTime}>
                  לפני {activity.time}
                </span>
              </div>
              
              <p className={styles.activityDescription}>
                {activity.description}
              </p>
            </div>

            <div 
              className={styles.priorityIndicator}
              style={{ background: getPriorityColor(activity.priority) }}
            />
          </div>
        ))}
      </div>

      {activities.length > 5 && (
        <div className={styles.footer}>
          <button className={styles.loadMoreButton}>
            טען עוד פעילויות
          </button>
        </div>
      )}
    </div>
  );
}