import React, { useState, useMemo } from 'react';
import styles from './ActivityFeed.module.css';

const AppointmentItem = ({ appointment, isPast }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'completed': styles.statusCompleted,
      'confirmed': styles.statusConfirmed,
      'pending': styles.statusPending,
      'cancelled_by_user': styles.statusCancelled,
      'cancelled_by_business': styles.statusCancelled,
      'not_arrived': styles.statusCancelled
    };
    return colors[status] || styles.statusDefault;
  };

  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'ממתין',
      'confirmed': 'מאושר',
      'completed': 'הושלם',
      'cancelled_by_user': 'בוטל',
      'cancelled_by_business': 'בוטל',
      'not_arrived': 'לא הגיע'
    };
    return statusMap[status] || status;
  };

  return (
    <li className={styles.appointmentItem}>
      <div className={styles.itemContent}>
        <div className={styles.customerInfo}>
          <span className={styles.customerName}>
            {appointment.first_name} {appointment.last_name}
          </span>
          <span className={styles.serviceName}>{appointment.service_name}</span>
        </div>
        <div className={styles.appointmentMeta}>
          <span className={styles.appointmentTime}>{formatDate(appointment.appointment_datetime)}</span>
          <span className={`${styles.appointmentStatus} ${getStatusColor(appointment.status)}`}>
            {translateStatus(appointment.status)}
          </span>
        </div>
      </div>
    </li>
  );
};

const AppointmentSection = ({ title, appointments, showAll, onToggle, emptyMessage }) => {
  const displayedAppointments = showAll ? appointments : appointments.slice(0, 6);
  const hasMore = appointments.length > 6;

  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <h4 className={styles.sectionTitle}>{title}</h4>
        <span className={styles.sectionCount}>({appointments.length})</span>
      </div>

      {appointments.length > 0 ? (
        <>
          <ul className={styles.appointmentList}>
            {displayedAppointments.map((apt) => (
              <AppointmentItem
                key={apt.appointment_id}
                appointment={apt}
                isPast={title.includes('קודמים')}
              />
            ))}
          </ul>

          {hasMore && (
            <button className={styles.toggleButton} onClick={onToggle}>
              {showAll ? 'הצג פחות' : `הצג עוד (${appointments.length - 6})`}
            </button>
          )}
        </>
      ) : (
        <p className={styles.emptyMessage}>{emptyMessage}</p>
      )}
    </div>
  );
};

export default function ActivityFeed({ appointments = [] }) {
  const [showAllPast, setShowAllPast] = useState(false);
  const [showAllFuture, setShowAllFuture] = useState(false);

  const { pastAppointments, futureAppointments } = useMemo(() => {
    const now = new Date();
    const past = [];
    const future = [];

    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_datetime);
      if (aptDate < now) {
        past.push(apt);
      } else {
        future.push(apt);
      }
    });

    // Sort: past descending (newest first), future ascending (nearest first)
    past.sort((a, b) => new Date(b.appointment_datetime) - new Date(a.appointment_datetime));
    future.sort((a, b) => new Date(a.appointment_datetime) - new Date(b.appointment_datetime));

    return { pastAppointments: past, futureAppointments: future };
  }, [appointments]);

  if (appointments.length === 0) {
    return null;
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>היסטוריית תורים</h3>

      <AppointmentSection
        title="תורים קודמים"
        appointments={pastAppointments}
        showAll={showAllPast}
        onToggle={() => setShowAllPast(!showAllPast)}
        emptyMessage="אין תורים קודמים"
      />

      <div className={styles.divider} />

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
