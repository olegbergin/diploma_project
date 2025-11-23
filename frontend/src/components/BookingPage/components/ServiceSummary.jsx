/**
 * Service Summary Component
 * Displays selected service information and booking details
 *
 * @component
 *
 * הערות בעברית:
 * קומפוננטה זו מציגה כרטיס מידע מסכם על העסק, השירות
 * והתאריך והשעה שנבחרו לתור. הקומפוננטה משמשת להצגת
 * פרטי התור בצורה ברורה לפני שהמשתמש ממשיך להזמנה.
 */

import React from "react";
import { FiMapPin, FiClock, FiDollarSign, FiCalendar } from "react-icons/fi";
import styles from "./ServiceSummary.module.css";

export default function ServiceSummary({
  business,
  service,
  selectedDate,
  selectedTime,
}) {
  /**
   * פונקציה לעיצוב התאריך לתצוגה קריאה בעברית
   */
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  /**
   * פונקציה המחזירה את השעה כפי שהיא
   */
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  return (
    <div className={styles.summaryCard}>
      {/* הצגת פרטי העסק */}
      <div className={styles.businessInfo}>
        <div className={styles.businessImage}>
          {/* אם יש תמונה – מציגים אותה, אחרת מציגים עיגול עם האות הראשונה של העסק */}
          {business.image_url ? (
            <img
              src={business.image_url}
              alt={business.name}
              className={styles.businessImg}
            />
          ) : (
            <div className={styles.businessPlaceholder}>
              {business.name?.charAt(0)}
            </div>
          )}
        </div>

        <div className={styles.businessDetails}>
          {/* שם העסק */}
          <h2 className={styles.businessName}>{business.name}</h2>

          {/* כתובת העסק אם קיימת */}
          {business.address && (
            <div className={styles.businessAddress}>
              <FiMapPin className={styles.icon} />
              <span>{business.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* פרטי השירות */}
      <div className={styles.serviceDetails}>
        {/* שם השירות */}
        <h3 className={styles.serviceName}>{service.name}</h3>

        <div className={styles.serviceInfo}>
          {/* מחיר השירות */}
          <div className={styles.serviceItem}>
            <FiDollarSign className={styles.icon} />
            <span className={styles.servicePrice}>₪{service.price}</span>
          </div>

          {/* משך השירות */}
          {service.duration && (
            <div className={styles.serviceItem}>
              <FiClock className={styles.icon} />
              <span className={styles.serviceDuration}>
                {service.duration} דקות
              </span>
            </div>
          )}
        </div>

        {/* תיאור השירות אם קיים */}
        {service.description && (
          <p className={styles.serviceDescription}>{service.description}</p>
        )}
      </div>

      {/* תאריך ושעה שנבחרו לתור */}
      {(selectedDate || selectedTime) && (
        <div className={styles.appointmentDetails}>
          <h4 className={styles.appointmentTitle}>פרטי התור</h4>

          <div className={styles.appointmentInfo}>
            {/* תאריך */}
            {selectedDate && (
              <div className={styles.appointmentItem}>
                <FiCalendar className={styles.icon} />
                <span className={styles.appointmentDate}>
                  {formatDate(selectedDate)}
                </span>
              </div>
            )}

            {/* שעה */}
            {selectedTime && (
              <div className={styles.appointmentItem}>
                <FiClock className={styles.icon} />
                <span className={styles.appointmentTime}>
                  {formatTime(selectedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* חיווי סטטוס – האם המשתמש מוכן לאישור או עדיין לא השלים בחירה */}
      <div className={styles.statusIndicator}>
        <div
          className={`${styles.statusDot} ${
            selectedDate && selectedTime ? styles.complete : styles.incomplete
          }`}
        />

        <span className={styles.statusText}>
          {selectedDate && selectedTime ? "מוכן לאישור" : "בתהליך בחירה"}
        </span>
      </div>
    </div>
  );
}
