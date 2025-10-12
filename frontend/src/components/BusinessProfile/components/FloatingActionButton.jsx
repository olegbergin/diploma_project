import { useState } from 'react';
import styles from './FloatingActionButton.module.css';

export default function FloatingActionButton({ onQuickAction }) {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    { id: 'profile', label: 'פרטי עסק', icon: '🏢', color: '#7038b7' },
    { id: 'services', label: 'שירותים', icon: '⚙️', color: '#9c27b0' },
    { id: 'appointments', label: 'תורים', icon: '📋', color: '#673ab7' },
    { id: 'requests', label: 'בקשות', icon: '📨', color: '#5e35b1' }
  ];

  const handleActionClick = (actionId) => {
    onQuickAction(actionId);
    setIsOpen(false);
  };

  return (
    <div className={styles.fabContainer}>
      {/* Action buttons */}
      {isOpen && (
        <div className={styles.actionsList}>
          {actions.map((action, index) => (
            <button
              key={action.id}
              className={styles.actionButton}
              onClick={() => handleActionClick(action.id)}
              style={{ 
                '--delay': `${index * 0.1}s`,
                '--color': action.color
              }}
              aria-label={action.label}
            >
              <span className={styles.actionIcon}>{action.icon}</span>
              <span className={styles.actionLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB */}
      <button
        className={`${styles.fab} ${isOpen ? styles.fabOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'סגור תפריט' : 'פתח תפריט פעולות'}
      >
        <span className={styles.fabIcon}>
          {isOpen ? '✕' : '+'}
        </span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}