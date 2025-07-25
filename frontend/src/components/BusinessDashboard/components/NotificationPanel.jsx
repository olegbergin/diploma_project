import { useEffect } from 'react';
import styles from './NotificationPanel.module.css';

export default function NotificationPanel({ notifications, onClose, isMobile }) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobile]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'urgent': return '🚨';
      case 'positive': return '🎉';
      case 'warning': return '⚠️';
      case 'info': return '💡';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'urgent': return 'var(--error-color)';
      case 'positive': return 'var(--success-color)';
      case 'warning': return 'var(--warning-color)';
      case 'info': return 'var(--primary-color)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // Handle notification click action
  };

  const handleMarkAllRead = () => {
    console.log('Mark all as read');
    // Handle mark all as read
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Panel */}
      <div className={`${styles.panel} ${isMobile ? styles.mobile : styles.desktop}`}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>התראות</h2>
            <div className={styles.headerActions}>
              {notifications?.unread > 0 && (
                <button 
                  className={styles.markAllButton}
                  onClick={handleMarkAllRead}
                >
                  סמן הכל כנקרא
                </button>
              )}
              <button 
                className={styles.closeButton}
                onClick={onClose}
                aria-label="סגור פאנל התראות"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className={styles.content}>
          {!notifications?.items?.length ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3 className={styles.emptyTitle}>אין התראות חדשות</h3>
              <p className={styles.emptyText}>
                כל ההתראות יופיעו כאן
              </p>
            </div>
          ) : (
            <div className={styles.notificationsList}>
              {notifications.items.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.notification} ${
                    !notification.read ? styles.unread : styles.read
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.notificationContent}>
                    <div className={styles.notificationHeader}>
                      <div className={styles.notificationMeta}>
                        <span 
                          className={styles.notificationIcon}
                          style={{ color: getNotificationColor(notification.type) }}
                        >
                          {getNotificationIcon(notification.type)}
                        </span>
                        <span className={styles.notificationTime}>
                          לפני {notification.time}
                        </span>
                      </div>
                      {!notification.read && (
                        <div className={styles.unreadDot} />
                      )}
                    </div>
                    
                    <h4 className={styles.notificationTitle}>
                      {notification.title}
                    </h4>
                    
                    <p className={styles.notificationMessage}>
                      {notification.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications?.items?.length > 0 && (
          <div className={styles.footer}>
            <button className={styles.viewAllButton}>
              צפה בכל ההתראות
            </button>
          </div>
        )}
      </div>
    </>
  );
}