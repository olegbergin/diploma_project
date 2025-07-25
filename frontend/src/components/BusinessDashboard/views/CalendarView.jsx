import { useState } from 'react';
import styles from './CalendarView.module.css';
import CalendarGrid from '../components/CalendarGrid';
import AppointmentModal from '../components/AppointmentModal';
import { useAppointments } from '../hooks/useAppointments';

export default function CalendarView({ businessId }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('week'); // 'day', 'week', 'month'

  const {
    appointments,
    isLoading,
    error,
    createAppointment,
    updateAppointment,
    deleteAppointment,
    refreshAppointments
  } = useAppointments(businessId);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleAppointmentClick = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleAppointmentCreate = (timeSlot) => {
    setSelectedAppointment({
      date: selectedDate,
      time: timeSlot,
      isNew: true
    });
    setIsModalOpen(true);
  };

  const handleModalSave = async (appointmentData) => {
    try {
      if (selectedAppointment?.isNew) {
        await createAppointment(appointmentData);
      } else {
        await updateAppointment(selectedAppointment.id, appointmentData);
      }
      setIsModalOpen(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleModalDelete = async () => {
    if (selectedAppointment && !selectedAppointment.isNew) {
      try {
        await deleteAppointment(selectedAppointment.id);
        setIsModalOpen(false);
        setSelectedAppointment(null);
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>שגיאה בטעינת הלוח זמנים</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={refreshAppointments}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <h1 className={styles.title}>לוח זמנים</h1>
          <p className={styles.subtitle}>
            ניהול תורים ופגישות
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* View Mode Selector */}
          <div className={styles.viewModeSelector}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'day' ? styles.active : ''}`}
              onClick={() => setViewMode('day')}
            >
              יום
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'week' ? styles.active : ''}`}
              onClick={() => setViewMode('week')}
            >
              שבוע
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'month' ? styles.active : ''}`}
              onClick={() => setViewMode('month')}
            >
              חודש
            </button>
          </div>

          {/* Today Button */}
          <button
            className={styles.todayButton}
            onClick={() => setSelectedDate(new Date())}
          >
            היום
          </button>

          {/* Refresh Button */}
          <button
            className={styles.refreshButton}
            onClick={refreshAppointments}
            disabled={isLoading}
          >
            {isLoading ? '⏳' : '🔄'}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendarContainer}>
        <CalendarGrid
          appointments={appointments}
          selectedDate={selectedDate}
          viewMode={viewMode}
          onDateSelect={handleDateSelect}
          onAppointmentClick={handleAppointmentClick}
          onTimeSlotClick={handleAppointmentCreate}
          isLoading={isLoading}
        />
      </div>

      {/* Appointment Modal */}
      {isModalOpen && (
        <AppointmentModal
          appointment={selectedAppointment}
          businessId={businessId}
          onSave={handleModalSave}
          onDelete={handleModalDelete}
          onClose={handleModalClose}
        />
      )}

      {/* Stats Summary */}
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>📅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {appointments?.filter(apt => {
                const today = new Date();
                const aptDate = new Date(apt.date);
                return aptDate.toDateString() === today.toDateString();
              }).length || 0}
            </div>
            <div className={styles.statLabel}>תורים היום</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>⏰</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {appointments?.filter(apt => apt.status === 'pending').length || 0}
            </div>
            <div className={styles.statLabel}>ממתינים לאישור</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>✅</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>
              {appointments?.filter(apt => apt.status === 'confirmed').length || 0}
            </div>
            <div className={styles.statLabel}>מאושרים</div>
          </div>
        </div>
      </div>
    </div>
  );
}