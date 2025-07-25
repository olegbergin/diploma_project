import { useState } from 'react';
import styles from './Navigation.module.css';

export default function Navigation({ 
  isMobile, 
  activeView, 
  onViewChange, 
  businessName,
  onLogout 
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationItems = [
    {
      id: 'overview',
      label: 'סקירה כללית',
      icon: '📊',
      shortLabel: 'סקירה'
    },
    {
      id: 'calendar',
      label: 'לוח זמנים',
      icon: '📅',
      shortLabel: 'לוח'
    },
    {
      id: 'services',
      label: 'שירותים',
      icon: '⚙️',
      shortLabel: 'שירותים'
    },
    {
      id: 'customers',
      label: 'לקוחות',
      icon: '👥',
      shortLabel: 'לקוחות'
    }
  ];

  const handleNavItemClick = (viewId) => {
    onViewChange(viewId);
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm('האם אתה בטוח שברצונך להתנתק?')) {
      onLogout();
    }
  };

  if (isMobile) {
    return (
      <>
        {/* Bottom Navigation */}
        <nav className={styles.bottomNav}>
          {navigationItems.map((item) => (
            <button
              key={item.id}
              className={`${styles.bottomNavItem} ${
                activeView === item.id ? styles.active : ''
              }`}
              onClick={() => handleNavItemClick(item.id)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel}>{item.shortLabel}</span>
            </button>
          ))}
          
          {/* Logout button */}
          <button
            className={`${styles.bottomNavItem} ${styles.logoutItem}`}
            onClick={handleLogout}
          >
            <span className={styles.navIcon}>🚪</span>
            <span className={styles.navLabel}>יציאה</span>
          </button>
        </nav>

        {/* Mobile overlay menu (if needed for additional options) */}
        {isMobileMenuOpen && (
          <div 
            className={styles.mobileOverlay}
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </>
    );
  }

  // Desktop Sidebar
  return (
    <aside className={styles.sidebar}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>🏢</div>
        <div className={styles.brandContent}>
          <div className={styles.brandTitle}>
            {businessName || 'לוח הבקרה'}
          </div>
          <div className={styles.brandSubtitle}>ניהול עסק</div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className={styles.sidebarNav}>
        <ul className={styles.navList}>
          {navigationItems.map((item) => (
            <li key={item.id}>
              <button
                className={`${styles.navItem} ${
                  activeView === item.id ? styles.active : ''
                }`}
                onClick={() => handleNavItemClick(item.id)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className={styles.sidebarFooter}>
        <button
          className={`${styles.navItem} ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          <span className={styles.navIcon}>🚪</span>
          <span className={styles.navLabel}>התנתק</span>
        </button>
        
        <div className={styles.footerInfo}>
          <div className={styles.version}>גרסה 1.0.0</div>
        </div>
      </div>
    </aside>
  );
}