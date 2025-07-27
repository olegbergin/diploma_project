import { useNavigate } from 'react-router-dom';
import styles from './QuickActions.module.css';

export default function QuickActions({ businessId, isMobile }) {
  const navigate = useNavigate();

  const actions = [
    {
      id: 'add-service',
      title: 'הוסף שירות',
      description: 'הוסף שירות חדש לעסק',
      icon: '➕',
      color: 'blue',
      onClick: () => console.log('Add service')
    },
    {
      id: 'view-calendar',
      title: 'לוח זמנים',
      description: 'צפה בתורים היום',
      icon: '📅',
      color: 'green',
      onClick: () => navigate(`/business/${businessId}/calendar`)
    },
  ];

  const handleActionClick = (action) => {
    if (action.onClick) {
      action.onClick();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>פעולות מהירות</h2>
        <p className={styles.subtitle}>ניהול יומיומי של העסק</p>
      </div>

      <div className={`${styles.grid} ${isMobile ? styles.mobile : styles.desktop}`}>
        {actions.map((action) => (
          <button
            key={action.id}
            className={`${styles.actionCard} ${styles[action.color]}`}
            onClick={() => handleActionClick(action)}
          >
            <div className={styles.actionIcon}>
              {action.icon}
            </div>
            <div className={styles.actionContent}>
              <h3 className={styles.actionTitle}>{action.title}</h3>
              <p className={styles.actionDescription}>{action.description}</p>
            </div>
            <div className={styles.actionArrow}>
              ←
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}