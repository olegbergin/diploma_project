import React from 'react';
import styles from './QuickActions.module.css';

export default function QuickActions({ onAction }) {
  const quickActions = [
    {
      key: 'search',
      title: 'חיפוש עסקים',
      description: 'מצא עסקים לפי קטגוריה או מיקום',
      icon: '🔍',
      color: 'primary',
      gradient: 'linear-gradient(135deg, #7038b7, #9c27b0)'
    },
    {
      key: 'book',
      title: 'קבע תור',
      description: 'הזמן תור בעסק מהמועדפים',
      icon: '📅',
      color: 'success',
      gradient: 'linear-gradient(135deg, #4caf50, #66bb6a)'
    },
    {
      key: 'favorites',
      title: 'מועדפים',
      description: 'עיין ברשימת העסקים המועדפים',
      icon: '⭐',
      color: 'warning',
      gradient: 'linear-gradient(135deg, #ff9800, #ffb74d)'
    },
    {
      key: 'profile',
      title: 'עדכן פרופיל',
      description: 'עדכן פרטים אישיים והעדפות',
      icon: '👤',
      color: 'info',
      gradient: 'linear-gradient(135deg, #2196f3, #64b5f6)'
    }
  ];

  return (
    <div className={styles.quickActions}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>פעולות מהירות</h2>
        <p className={styles.sectionDescription}>
          גישה מהירה לפעולות הנפוצות ביותר
        </p>
      </div>
      
      <div className={styles.actionsGrid}>
        {quickActions.map((action) => (
          <button
            key={action.key}
            className={`${styles.actionCard} ${styles[action.color]}`}
            onClick={() => onAction(action.key)}
            style={{ '--gradient': action.gradient }}
          >
            <div className={styles.actionIcon}>
              <span className={styles.iconEmoji}>{action.icon}</span>
            </div>
            
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            
            <div className={styles.actionArrow}>
              <span>←</span>
            </div>
            
            <div className={styles.actionHover}></div>
          </button>
        ))}
      </div>
      
      {/* Recent activities placeholder */}
      <div className={styles.recentActions}>
        <h3 className={styles.recentTitle}>פעילות אחרונה</h3>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>
            התחל לבצע פעולות כדי לראות כאן את הפעילות האחרונה
          </p>
        </div>
      </div>
    </div>
  );
}