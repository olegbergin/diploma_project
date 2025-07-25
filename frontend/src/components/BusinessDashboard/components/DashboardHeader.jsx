import { useState } from 'react';
import styles from './DashboardHeader.module.css';

export default function DashboardHeader({ 
  business, 
  isMobile, 
  notificationCount, 
  onNotificationsToggle,
  onRefresh 
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const getCurrentGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 17) return 'צהריים טובים';
    if (hour < 21) return 'ערב טוב';
    return 'לילה טוב';
  };

  const getCurrentDate = () => {
    const today = new Date();
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return today.toLocaleDateString('he-IL', options);
  };

  return (
    <header className={`${styles.header} ${isMobile ? styles.mobile : styles.desktop}`}>
      <div className={styles.headerContent}>
        {/* Left side - Greeting and date */}
        <div className={styles.headerInfo}>
          <div className={styles.greeting}>
            {getCurrentGreeting()}
            {business?.name && (
              <span className={styles.businessName}>, {business.name}</span>
            )}
          </div>
          <div className={styles.date}>{getCurrentDate()}</div>
        </div>

        {/* Right side - Actions */}
        <div className={styles.headerActions}>
          {/* Refresh button */}
          <button
            className={`${styles.actionButton} ${isRefreshing ? styles.refreshing : ''}`}
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="רענן נתונים"
          >
            <span className={styles.refreshIcon}>
              {isRefreshing ? '⏳' : '🔄'}
            </span>
            {!isMobile && <span>רענן</span>}
          </button>

          {/* Notifications button */}
          <button
            className={`${styles.actionButton} ${styles.notificationButton}`}
            onClick={onNotificationsToggle}
            title="התראות"
          >
            <span className={styles.notificationIcon}>🔔</span>
            {notificationCount > 0 && (
              <span className={styles.notificationBadge}>
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
            {!isMobile && <span>התראות</span>}
          </button>

          {/* Business avatar */}
          {business && (
            <div className={styles.businessAvatar}>
              <img
                src={business.image_url || '/images/placeholder_business.png'}
                alt={business.name}
                className={styles.avatarImage}
              />
              {!isMobile && (
                <div className={styles.businessInfo}>
                  <div className={styles.businessName}>{business.name}</div>
                  <div className={styles.businessCategory}>{business.category}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Quick stats bar */}
      {isMobile && business && (
        <div className={styles.mobileStats}>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>⭐</span>
            <span className={styles.statValue}>{business.rating}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>👥</span>
            <span className={styles.statValue}>{business.reviewCount}</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statIcon}>📍</span>
            <span className={styles.statValue}>פתוח</span>
          </div>
        </div>
      )}
    </header>
  );
}