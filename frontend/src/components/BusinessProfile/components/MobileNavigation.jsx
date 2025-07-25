import styles from './MobileNavigation.module.css';

export default function MobileNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'calendar', label: 'לוח שנה', icon: '📅' },
    { id: 'gallery', label: 'גלריה', icon: '🖼️' },
    { id: 'reviews', label: 'ביקורות', icon: '⭐' }
  ];

  return (
    <nav className={styles.mobileNav}>
      <div className={styles.tabContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={tab.label}
          >
            <span className={styles.tabIcon}>{tab.icon}</span>
            <span className={styles.tabLabel}>{tab.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}