import React from 'react';
import styles from './Navigation.module.css';

export default function Navigation({ 
  activeView, 
  onViewChange, 
  isMobile, 
  isOpen, 
  onClose 
}) {
  const navigationItems = [
    {
      key: 'dashboard',
      label: 'דשבורד',
      icon: '🏠',
      description: 'סקירה כללית'
    },
    {
      key: 'bookings',
      label: 'התורים שלי',
      icon: '📅',
      description: 'ניהול תורים'
    },
    {
      key: 'favorites',
      label: 'מועדפים',
      icon: '⭐',
      description: 'העסקים המועדפים'
    },
    {
      key: 'profile',
      label: 'פרופיל',
      icon: '👤',
      description: 'הגדרות אישיות'
    }
  ];

  const handleItemClick = (viewKey) => {
    onViewChange(viewKey);
    if (isMobile) {
      onClose();
    }
  };

  const handleLogout = () => {
    // Clear user data and redirect to login
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <nav className={`
      ${styles.navigation} 
      ${isMobile ? styles.mobileNav : styles.desktopNav}
      ${isMobile && isOpen ? styles.open : ''}
    `}>
      <div className={styles.navHeader}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>💎</span>
          <span className={styles.logoText}>לקוח פנל</span>
        </div>
        {isMobile && (
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="סגור תפריט"
          >
            ✕
          </button>
        )}
      </div>

      <div className={styles.navContent}>
        <ul className={styles.navList}>
          {navigationItems.map((item) => (
            <li key={item.key} className={styles.navItem}>
              <button
                className={`
                  ${styles.navButton} 
                  ${activeView === item.key ? styles.active : ''}
                `}
                onClick={() => handleItemClick(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <div className={styles.navTextContainer}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
                </div>
                {activeView === item.key && (
                  <div className={styles.activeIndicator}></div>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.navFooter}>
        <div className={styles.quickStats}>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatIcon}>📊</span>
            <div className={styles.quickStatText}>
              <span className={styles.quickStatNumber}>12</span>
              <span className={styles.quickStatLabel}>תורים השנה</span>
            </div>
          </div>
          <div className={styles.quickStatItem}>
            <span className={styles.quickStatIcon}>⏰</span>
            <div className={styles.quickStatText}>
              <span className={styles.quickStatNumber}>2</span>
              <span className={styles.quickStatLabel}>תורים השבוע</span>
            </div>
          </div>
        </div>

        <button 
          className={styles.logoutButton}
          onClick={handleLogout}
        >
          <span className={styles.logoutIcon}>🚪</span>
          <span className={styles.logoutText}>יציאה</span>
        </button>
      </div>
    </nav>
  );
}