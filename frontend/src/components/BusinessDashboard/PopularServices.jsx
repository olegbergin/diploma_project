import React from "react";
import styles from "./PopularServices.module.css";

export default function PopularServices({ services }) {
  /* 
    בדיקה: אם אין נתונים על שירותים או שהמערך ריק –  
    לא מציגים בכלל את הכרטיס. 
    זה מונע כרטיס ריק בדשבורד.
  */
  if (!services || services.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      {/* כותרת הכרטיס */}
      <h3 className={styles.cardTitle}>שירותים פופולריים</h3>

      {/* רשימת השירותים */}
      <ul className={styles.serviceList}>
        {services.map((service, index) => (
          <li key={index} className={styles.serviceItem}>
            {/* שם השירות */}
            <span className={styles.serviceName}>{service.name}</span>

            {/* נתוני השירות: הכנסה + כמות הזמנות */}
            <div className={styles.serviceStats}>
              {/* 
                סכום הכנסות לשירות  
                משתמשים ב-toLocaleString כדי להציג עם פסיקים בצורה יפה  
                ואם אין ערך – מציג 0
              */}
              <span className={styles.serviceRevenue}>
                ₪{service.serviceRevenue?.toLocaleString() || 0}
              </span>

              {/* מספר ההזמנות לשירות */}
              <span className={styles.serviceBookings}>
                {service.bookingCount} הזמנות
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
