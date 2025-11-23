import React, { useState, useMemo } from "react";
import styles from "./ActivityFeed.module.css";

/**
 * קומפוננטה להצגת תור בודד ברשימה
 * מציגה: לקוח, שירות, תאריך, סטטוס + צבע
 */
const AppointmentItem = ({ appointment, isPast }) => {
  // פונקציה שמחזירה תאריך בפורמט קריא בעברית
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // החזרת צבע סטטוס לפי סוג התור
  const getStatusColor = (status) => {
    const colors = {
      completed: styles.statusCompleted, // הושלם
      confirmed: styles.statusConfirmed, // מאושר
      pending: styles.statusPending, // ממתין
      cancelled_by_user: styles.statusCancelled, // בוטל
      cancelled_by_business: styles.statusCancelled, // בוטל
      not_arrived: styles.statusCancelled, // לא הגיע
    };
    return colors[status] || styles.statusDefault;
  };

  // תרגום של סטטוס באנגלית → עברית
  const translateStatus = (status) => {
    const statusMap = {
      pending: "ממתין",
      confirmed: "מאושר",
      completed: "הושלם",
      cancelled_by_user: "בוטל",
      cancelled_by_business: "בוטל",
      not_arrived: "לא הגיע",
    };
    return statusMap[status] || status;
  };

  return (
    <li className={styles.appointmentItem}>
      <div className={styles.itemContent}>
        {/* מידע על הלקוח והשירות */}
        <div className={styles.customerInfo}>
          <span className={styles.customerName}>
            {appointment.first_name} {appointment.last_name}
          </span>
          <span className={styles.serviceName}>{appointment.service_name}</span>
        </div>

        {/* תאריך וסטטוס */}
        <div className={styles.appointmentMeta}>
          <span className={styles.appointmentTime}>
            {formatDate(appointment.appointment_datetime)}
          </span>

          <span
            className={`${styles.appointmentStatus} ${getStatusColor(
              appointment.status
            )}`}
          >
            {translateStatus(appointment.status)}
          </span>
        </div>
      </div>
    </li>
  );
};

/**
 * קומפוננטה להצגת רשימה של תורים מסוג מסוים
 * כולל: כותרת, כמות תורים, הצגת 6 ראשונים + כפתור "הצג עוד"
 */
const AppointmentSection = ({
  title,
  appointments,
  showAll,
  onToggle,
  emptyMessage,
}) => {
  // אם לא לוחצים "הצג עוד" → רואים רק 6
  const displayedAppointments = showAll
    ? appointments
    : appointments.slice(0, 6);

  // האם יש יותר מ–6 תורים?
  const hasMore = appointments.length > 6;

  return (
    <div className={styles.section}>
      {/* כותרת + מספר תורים */}
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <span className={styles.sectionCount}>({appointments.length})</span>
      </div>

      {/* אם יש תורים */}
      {appointments.length > 0 ? (
        <>
          {/* רשימת התורים */}
          <ul className={styles.appointmentList}>
            {displayedAppointments.map((apt) => (
              <AppointmentItem
                key={apt.appointment_id}
                appointment={apt}
                isPast={title.includes("קודמים")}
              />
            ))}
          </ul>

          {/* כפתור "הצג עוד" אם יש מעל 6 */}
          {hasMore && (
            <button className={styles.toggleButton} onClick={onToggle}>
              {showAll ? "הצג פחות" : `הצג עוד (${appointments.length - 6})`}
            </button>
          )}
        </>
      ) : (
        // אם אין תורים בסוג הזה
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      )}
    </div>
  );
};

/**
 * הקומפוננטה הראשית:
 * ActivityFeed – היסטוריית תורים מלאה
 * כולל:
 * - חלוקה לתורים קודמים ועתידיים
 * - מיון נכון
 * - כפתורי הצג/הסתר
 */
export default function ActivityFeed({ appointments = [] }) {
  // האם להציג את כל התורים הקודמים/עתידיים?
  const [showAllPast, setShowAllPast] = useState(false);
  const [showAllFuture, setShowAllFuture] = useState(false);

  // עיבוד התורים: מפריד לעתיד / עבר + ממיין
  const { pastAppointments, futureAppointments } = useMemo(() => {
    const now = new Date();
    const past = [];
    const future = [];

    // מחלקים תורים לעבר/עתיד
    appointments.forEach((apt) => {
      const aptDate = new Date(apt.appointment_datetime);
      if (aptDate < now) {
        past.push(apt);
      } else {
        future.push(apt);
      }
    });

    // מיון:
    past.sort(
      (a, b) =>
        new Date(b.appointment_datetime) - new Date(a.appointment_datetime)
    ); // עבר: חדש → ישן
    future.sort(
      (a, b) =>
        new Date(a.appointment_datetime) - new Date(b.appointment_datetime)
    ); // עתיד: קרוב → רחוק

    return { pastAppointments: past, futureAppointments: future };
  }, [appointments]);

  // אם אין בכלל תורים – לא מציגים כלום
  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      {/* כותרת הכרטיס */}
      <h3 className={styles.cardTitle}>היסטוריית תורים</h3>

      {/* תורים קודמים */}
      <AppointmentSection
        title="תורים קודמים"
        appointments={pastAppointments}
        showAll={showAllPast}
        onToggle={() => setShowAllPast(!showAllPast)}
        emptyMessage="אין תורים קודמים"
      />

      <div className={styles.divider} />

      {/* תורים עתידיים */}
      <AppointmentSection
        title="תורים עתידיים"
        appointments={futureAppointments}
        showAll={showAllFuture}
        onToggle={() => setShowAllFuture(!showAllFuture)}
        emptyMessage="אין תורים עתידיים"
      />
    </div>
  );
}
