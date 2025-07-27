import React from 'react';
import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner';
import styles from './RecentActivity.module.css';

export default function RecentActivity({ data, loading }) {
  const activities = data?.recentActivities || [];

  const getActivityColor = (type) => {
    switch (type) {
      case 'booking':
        return 'success';
      case 'favorite':
        return 'warning';
      case 'review':
        return 'info';
      case 'cancelled':
        return 'danger';
      case 'completed':
        return 'primary';
      default:
        return 'neutral';
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      confirmed: { text: 'מאושר', color: 'success' },
      active: { text: 'פעיל', color: 'warning' },
      published: { text: 'פורסם', color: 'info' },
      cancelled: { text: 'בוטל', color: 'danger' },
      completed: { text: 'הושלם', color: 'primary' },
      pending: { text: 'ממתין', color: 'neutral' }
    };
    
    return statusMap[status] || statusMap.pending;
  };

  if (loading) {
    return (
      <div className={styles.activityContainer}>
        <div className={styles.activityHeader}>
          <h2 className={styles.sectionTitle}>פעילות אחרונה</h2>
        </div>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="medium" message="טוען פעילות אחרונה..." />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.activityContainer}>
      <div className={styles.activityHeader}>
        <h2 className={styles.sectionTitle}>פעילות אחרונה</h2>
        <p className={styles.sectionDescription}>
          סקירה של הפעילויות האחרונות שלך במערכת
        </p>
        <button className={styles.viewAllButton}>
          צפה בהכל
          <span className={styles.buttonArrow}>←</span>
        </button>
      </div>

      <div className={styles.activityList}>
        {activities.map((activity, index) => (
          <div 
            key={activity.id} 
            className={`${styles.activityItem} ${styles[getActivityColor(activity.type)]}`}
            style={{ '--animation-delay': `${index * 0.1}s` }}
          >
            <div className={styles.activityIcon}>
              <span className={styles.iconEmoji}>{activity.icon}</span>
            </div>
            
            <div className={styles.activityContent}>
              <div className={styles.activityMain}>
                <h3 className={styles.activityTitle}>{activity.title}</h3>
                <span className={styles.activityTime}>{activity.time}</span>
              </div>
              
              <p className={styles.activityDescription}>
                {activity.description}
              </p>
              
              <div className={styles.activityFooter}>
                <span className={styles.businessName}>
                  🏢 {activity.business}
                </span>
                <span className={`${styles.statusBadge} ${styles[getStatusBadge(activity.status).color]}`}>
                  {getStatusBadge(activity.status).text}
                </span>
              </div>
            </div>
            
            <div className={styles.activityActions}>
              <button 
                className={styles.actionButton}
                aria-label="פעולות נוספות"
              >
                ⋯
              </button>
            </div>
            
            <div className={styles.activityGlow}></div>
          </div>
        ))}
      </div>
      
      {activities.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📋</div>
          <h3 className={styles.emptyTitle}>אין פעילות אחרונה</h3>
          <p className={styles.emptyDescription}>
            כשתתחיל להשתמש במערכת, תראה כאן את הפעילות שלך
          </p>
          <button className={styles.emptyAction}>
            התחל עכשיו
          </button>
        </div>
      )}
    </div>
  );
}