import React from 'react';
import styles from './ActivityFeed.module.css';

const activityIcons = {
  new_appointment: '📅',
  new_review: '⭐',
  cancellation: '❌',
};

const ActivityItem = ({ activity }) => (
  <li className={styles.activityItem}>
    <div className={styles.iconWrapper}>
      {activityIcons[activity.type] || '🔔'}
    </div>
    <div className={styles.contentWrapper}>
      <p className={styles.activityText}>
        {activity.type === 'new_appointment' && `תור חדש מ- ${activity.user} עבור ${activity.service}`}
        {activity.type === 'new_review' && `ביקורת חדשה מ- ${activity.user} (${activity.rating} כוכבים)`}
        {activity.type === 'cancellation' && `ביטול תור על ידי ${activity.user} עבור ${activity.service}`}
      </p>
      <span className={styles.activityTime}>{activity.time}</span>
    </div>
  </li>
);

export default function ActivityFeed({ activities }) {
  if (!activities || activities.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>פעילות אחרונה</h3>
      <ul className={styles.activityList}>
        {activities.map((activity, index) => (
          <ActivityItem key={index} activity={activity} />
        ))}
      </ul>
    </div>
  );
}
