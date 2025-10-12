import React from 'react';
import styles from './PopularServices.module.css';

export default function PopularServices({ services }) {
  if (!services || services.length === 0) {
    return null; // Don't render the card if there are no services
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>שירותים פופולריים</h3>
      <ul className={styles.serviceList}>
        {services.map((service, index) => (
          <li key={index} className={styles.serviceItem}>
            <span className={styles.serviceName}>{service.name}</span>
            <div className={styles.serviceStats}>
              <span className={styles.serviceRevenue}>₪{service.serviceRevenue?.toLocaleString() || 0}</span>
              <span className={styles.serviceBookings}>{service.bookingCount} הזמנות</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
