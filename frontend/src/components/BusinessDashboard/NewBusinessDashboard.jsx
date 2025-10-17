import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NewBusinessDashboard.module.css';
import axiosInstance from '../../api/axiosInstance';

// Import new components
import KpiCards from './KpiCards';
import PerformanceChart from './PerformanceChart';
import PopularServices from './PopularServices';

export default function NewBusinessDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchDashboardData = useCallback(async () => {
    if (!user?.businessId && !user?.id) return;
    const businessId = user?.businessId || user?.id;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/businesses/${businessId}/dashboard`);

      setDashboardData(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching business dashboard data:', error);
      setError('שגיאה בטעינת נתוני הדשבורד');
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, user?.id]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const statusMap = {
        approve: 'confirmed',
        reject: 'cancelled_by_business',
      };
      const status = statusMap[action];
      if (!status) return;

      await axiosInstance.put(`/appointments/${appointmentId}/status`, { status });
      // Refresh data after action
      fetchDashboardData(); 
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      setError('שגיאה בעדכון התור');
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'ממתין',
      'confirmed': 'מאושר',
      'completed': 'הושלם',
      'cancelled_by_user': 'בוטל ע"י לקוח',
      'cancelled_by_business': 'בוטל ע"י בית עסק',
      'not_arrived': 'לא הגיע'
    };
    return statusMap[status] || status;
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>טוען נתונים...</p></div>;
  }

  if (error) {
    return <div className={styles.errorContainer}><p>{error}</p></div>;
  }

  if (!dashboardData) {
    return <div className={styles.errorContainer}><p>לא נמצאו נתונים</p></div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>שלום, {dashboardData.business.name}</h1>
        <div className={styles.headerActions}>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/reports')}>📊 דוחות</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/appointments/history')}>📋 היסטוריית תורים</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/calendar')}>📅 הצג לוח שנה</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate('/services')}>🔧 ניהול שירותים</button>
          <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={() => navigate(`/business/${user?.businessId || user?.id}/edit`)}>✏️ עריכת פרופיל</button>
        </div>
      </header>

      <section className={styles.kpis}>
        <KpiCards analytics={dashboardData.analytics} />
      </section>

      <main className={styles.mainContent}>
        <div className={styles.leftColumn}>
          {dashboardData.pending_appointments?.length > 0 && (
            <div className={`${styles.card} ${styles.pendingCard}`}>
              <h3 className={styles.cardTitle}>בקשות ממתינות ({dashboardData.pending_appointments.length})</h3>
              <ul className={styles.appointmentsList}>
                {dashboardData.pending_appointments.map(apt => (
                  <li key={apt.appointment_id} className={styles.appointmentItem}>
                    <div className={styles.appointmentDetails}>
                      <span className={styles.appointmentTime}>{formatDate(apt.appointment_datetime)}</span>
                      <span className={styles.customerName}>{apt.first_name} {apt.last_name}</span>
                      <span className={styles.serviceName}>{apt.service_name}</span>
                    </div>
                    <div className={styles.appointmentActions}>
                      <button className={styles.approveButton} onClick={() => handleAppointmentAction(apt.appointment_id, 'approve')}>✅ אשר</button>
                      <button className={styles.rejectButton} onClick={() => handleAppointmentAction(apt.appointment_id, 'reject')}>❌ דחה</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              {dashboardData.debug_info?.using_upcoming_fallback ? 'תורים קרובים' : 'תורים להיום'}
            </h3>
            {dashboardData.today_appointments?.length > 0 ? (
              <ul className={styles.appointmentsList}>
                {dashboardData.today_appointments.map(apt => (
                  <li key={apt.appointment_id} className={styles.appointmentItem}>
                    <div className={styles.appointmentDetails}>
                      <span className={styles.appointmentTime}>
                        {new Date(apt.appointment_datetime).toLocaleDateString('he-IL', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={styles.customerName}>{apt.first_name} {apt.last_name}</span>
                      <span className={styles.serviceName}>{apt.service_name}</span>
                      <span className={styles.price}>₪{apt.price}</span>
                    </div>
                    <span className={`${styles.status} ${styles.statusConfirmed}`}>{translateStatus(apt.status)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>
                {dashboardData.debug_info?.using_upcoming_fallback ? 'אין תורים קרובים.' : 'אין תורים להיום.'}
              </p>
            )}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <PerformanceChart data={dashboardData.analytics.dailyRevenueLast7Days} />
          <PopularServices services={dashboardData.analytics.servicePerformance} />
        </div>
      </main>
    </div>
  );
}