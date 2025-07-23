// ---------------------------------------------------------
// קומפוננטת כרטיס תור - מציגה מידע על תור אחד עם עיצוב משופר
// AppointmentCard – Displays appointment information with enhanced design
// ---------------------------------------------------------

import React from "react";
import styles from "./AppointmentCard.module.css";

/**
 * כרטיס תור עם מידע מפורט ועיצוב משופר
 * @param {Object} appointment - פרטי התור
 * @param {string} type - סוג התור (upcoming/past/canceled)
 * @param {Function} onCancel - פונקציית ביטול תור
 * @param {boolean} isCanceling - האם התור בתהליך ביטול
 */
export default function AppointmentCard({ appointment, type, onCancel, isCanceling }) {
  const appointmentDate = new Date(appointment.appointment_datetime);
  const now = new Date();
  const isToday = appointmentDate.toDateString() === now.toDateString();
  const isTomorrow = appointmentDate.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  
  // עיצוב תאריך קריא יותר
  const formatDate = (date) => {
    if (isToday) return "היום";
    if (isTomorrow) return "מחר";
    
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    };
    return date.toLocaleDateString('he-IL', options);
  };

  // עיצוב שעה
  const formatTime = (date) => {
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // צבע הסטטוס
  const getStatusColor = () => {
    switch (type) {
      case 'upcoming': return isToday ? '#4CAF50' : '#2196F3';
      case 'past': return '#9E9E9E';
      case 'canceled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getStatusText = () => {
    if (type === 'upcoming') return isToday ? 'היום' : 'מתוכנן';
    if (type === 'past') return 'הסתיים';
    if (type === 'canceled') return 'בוטל';
    return '';
  };

  return (
    <div className={`${styles.card} ${styles[type]}`}>
      {/* סטטוס התור */}
      <div 
        className={styles.statusBadge}
        style={{ backgroundColor: getStatusColor() }}
      >
        {getStatusText()}
      </div>

      {/* פרטי העסק והשירות */}
      <div className={styles.cardHeader}>
        <h3 className={styles.businessName}>{appointment.business_name}</h3>
        <p className={styles.serviceName}>{appointment.service_name}</p>
      </div>

      {/* תאריך ושעה */}
      <div className={styles.dateTimeSection}>
        <div className={styles.dateInfo}>
          <span className={styles.dateLabel}>תאריך:</span>
          <span className={styles.dateValue}>{formatDate(appointmentDate)}</span>
        </div>
        <div className={styles.timeInfo}>
          <span className={styles.timeLabel}>שעה:</span>
          <span className={styles.timeValue}>{formatTime(appointmentDate)}</span>
        </div>
      </div>

      {/* מחיר (אם זמין) */}
      {appointment.service_price && (
        <div className={styles.priceInfo}>
          <span className={styles.priceLabel}>מחיר:</span>
          <span className={styles.priceValue}>₪{appointment.service_price}</span>
        </div>
      )}

      {/* כפתור ביטול (רק לתורים עתידיים) */}
      {type === 'upcoming' && (
        <button
          onClick={() => onCancel(appointment.appointment_id)}
          disabled={isCanceling}
          className={styles.cancelBtn}
          aria-label="בטל תור"
        >
          {isCanceling ? (
            <>
              <span className={styles.spinner}></span>
              מבטל...
            </>
          ) : (
            'בטל תור'
          )}
        </button>
      )}

      {/* הערות נוספות */}
      {appointment.notes && (
        <div className={styles.notesSection}>
          <span className={styles.notesLabel}>הערות:</span>
          <p className={styles.notesText}>{appointment.notes}</p>
        </div>
      )}
    </div>
  );
}