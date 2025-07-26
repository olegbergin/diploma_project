import React from 'react';
import styles from './DashboardHeader.module.css';

export default function DashboardHeader({ 
  user, 
  isMobile, 
  isNavOpen, 
  onNavToggle, 
  activeView 
}) {
  const getViewTitle = (view) => {
    switch (view) {
      case 'bookings':
        return 'התורים שלי';
      case 'favorites':
        return 'המועדפים שלי';
      case 'profile':
        return 'הפרופיל שלי';
      default:
        return 'דשבורד אישי';
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'בוקר טוב';
    if (hour < 18) return 'צהריים טובים';
    return 'ערב טוב';
  };

  if (isMobile) {
    return (
      <header className={styles.mobileHeader}>
        <button 
          className={styles.menuToggle}
          onClick={onNavToggle}
          aria-label="תפריט ראשי"
        >
          <span className={`${styles.hamburger} ${isNavOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburger} ${isNavOpen ? styles.active : ''}`}></span>
          <span className={`${styles.hamburger} ${isNavOpen ? styles.active : ''}`}></span>
        </button>
        
        <div className={styles.headerContent}>
          <h1 className={styles.mobileTitle}>{getViewTitle(activeView)}</h1>
          {activeView === 'dashboard' && (
            <p className={styles.mobileGreeting}>
              {getGreeting()}, {user.firstName || user.first_name}
            </p>
          )}
        </div>
        
        <div className={styles.headerActions}>
          <div className={styles.userAvatar}>
            {user.avatarUrl ? (
              <img 
                src={user.avatarUrl} 
                alt={`${user.firstName || user.first_name}`}
                className={styles.avatarImage}
              />
            ) : (
              <span className={styles.avatarInitial}>
                {(user.firstName || user.first_name)?.charAt(0)?.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={styles.desktopHeader}>
      <div className={styles.headerMain}>
        <div className={styles.welcomeSection}>
          <h1 className={styles.welcomeTitle}>
            {getGreeting()}, {user.firstName || user.first_name}!
          </h1>
          <p className={styles.welcomeSubtitle}>
            ברוכים השבים לדשבורד האישי שלכם
          </p>
        </div>
        
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <div className={styles.userDetails}>
              <span className={styles.userName}>
                {user.firstName || user.first_name} {user.lastName || user.last_name}
              </span>
              <span className={styles.userRole}>לקוח</span>
            </div>
            <div className={styles.userAvatar}>
              {user.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={`${user.firstName || user.first_name}`}
                  className={styles.avatarImage}
                />
              ) : (
                <span className={styles.avatarInitial}>
                  {(user.firstName || user.first_name)?.charAt(0)?.toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.headerStats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>12</span>
          <span className={styles.statLabel}>תורים השנה</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>5</span>
          <span className={styles.statLabel}>עסקים מועדפים</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>8.5</span>
          <span className={styles.statLabel}>דירוג ממוצע</span>
        </div>
      </div>
    </header>
  );
}