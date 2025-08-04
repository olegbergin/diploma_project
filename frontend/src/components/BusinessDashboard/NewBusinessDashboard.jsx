import React, { useState, useEffect } from 'react';
import styles from './NewBusinessDashboard.module.css';
import axiosInstance from '../../api/axiosInstance';

export default function NewBusinessDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
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
    };

    fetchDashboardData();
  }, [user?.businessId, user?.id]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתונים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>לא נמצאו נתונים</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'ממתין לאישור', class: 'statusPending' },
      'confirmed': { text: 'אושר', class: 'statusConfirmed' },
      'completed': { text: 'הושלם', class: 'statusCompleted' },
      'cancelled_by_user': { text: 'בוטל ע"י לקוח', class: 'statusCancelled' },
      'cancelled_by_business': { text: 'בוטל ע"י עסק', class: 'statusCancelled' },
      'not_arrived': { text: 'לא הגיע', class: 'statusNotArrived' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'statusDefault' };
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const getAllAppointments = () => {
    if (!dashboardData.recent_appointments) return [];
    return dashboardData.recent_appointments.sort((a, b) => new Date(b.appointment_datetime) - new Date(a.appointment_datetime));
  };

  const getPendingAppointments = () => {
    if (!dashboardData.recent_appointments) return [];
    return dashboardData.recent_appointments.filter(apt => apt.status === 'pending');
  };

  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const endpoint = action === 'approve' ? 'confirmed' : action === 'reject' ? 'cancelled_by_business' : action;
      await axiosInstance.put(`/appointments/${appointmentId}/status`, { status: endpoint });
      
      // Refresh dashboard data
      const businessId = user?.businessId || user?.id;
      const response = await axiosInstance.get(`/businesses/${businessId}/dashboard`);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('שגיאה בעדכון התור');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>שלום, {dashboardData.business.name}</h1>
        <p>סיכום פעילות העסק שלך</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.analytics.total_appointments}</div>
          <div className={styles.statLabel}>סה"כ תורים</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.analytics.approved_appointments}</div>
          <div className={styles.statLabel}>תורים אושרו</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.analytics.pending_appointments}</div>
          <div className={styles.statLabel}>ממתינים לאישור</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.business.total_services}</div>
          <div className={styles.statLabel}>שירותים פעילים</div>
        </div>
      </div>

      {getPendingAppointments().length > 0 && (
        <div className={styles.section}>
          <h2>תורים ממתינים לאישור ({getPendingAppointments().length})</h2>
          <div className={styles.appointmentsGrid}>
            {getPendingAppointments().map(appointment => (
              <div key={appointment.appointment_id} className={styles.pendingAppointmentTile}>
                <div className={styles.appointmentTime}>
                  {formatDate(appointment.appointment_datetime)}
                </div>
                <div className={styles.appointmentCustomer}>
                  {appointment.first_name && appointment.last_name 
                    ? `${appointment.first_name} ${appointment.last_name}` 
                    : 'לקוח'}
                </div>
                <div className={styles.appointmentService}>
                  {appointment.service_name}
                </div>
                <div className={styles.appointmentActions}>
                  <button 
                    className={styles.approveButton}
                    onClick={() => handleAppointmentAction(appointment.appointment_id, 'approve')}
                  >
                    ✅ אשר
                  </button>
                  <button 
                    className={styles.rejectButton}
                    onClick={() => handleAppointmentAction(appointment.appointment_id, 'reject')}
                  >
                    ❌ דחה
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData.today_appointments && dashboardData.today_appointments.length > 0 && (
        <div className={styles.section}>
          <h2>תורים להיום</h2>
          <div className={styles.appointmentsGrid}>
            {dashboardData.today_appointments.map(appointment => (
              <div key={appointment.appointment_id} className={styles.appointmentTile}>
                <div className={styles.appointmentTime}>
                  {formatDate(appointment.appointment_datetime)}
                </div>
                <div className={styles.appointmentCustomer}>
                  {appointment.first_name && appointment.last_name 
                    ? `${appointment.first_name} ${appointment.last_name}` 
                    : 'לקוח'}
                </div>
                <div className={styles.appointmentService}>
                  {appointment.service_name}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                  {appointment.price && (
                    <div className={styles.appointmentPrice}>
                      ₪{appointment.price}
                    </div>
                  )}
                  {getStatusBadge(appointment.status)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData.analytics?.service_stats && dashboardData.analytics.service_stats.length > 0 && (
        <div className={styles.section}>
          <h2>השירותים שלי</h2>
          <div className={styles.servicesGrid}>
            {dashboardData.analytics.service_stats.map(service => (
              <div key={service.service_id} className={styles.serviceTile}>
                <div className={styles.serviceName}>{service.service_name}</div>
                <div className={styles.servicePrice}>₪{service.service_revenue || 0}</div>
                <div className={styles.serviceDuration}>הכנסות סה"כ</div>
                <div className={styles.serviceBookings}>
                  {service.booking_count || 0} הזמנות סה"כ
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2>כל התורים</h2>
        {showAllAppointments ? (
          <div>
            {getAllAppointments().length > 0 ? (
              <div className={styles.allAppointmentsGrid}>
                {getAllAppointments().map(appointment => (
                  <div key={appointment.appointment_id} className={styles.appointmentTile}>
                    <div className={styles.appointmentTime}>
                      {formatDate(appointment.appointment_datetime)}
                    </div>
                    <div className={styles.appointmentCustomer}>
                      {appointment.first_name && appointment.last_name 
                        ? `${appointment.first_name} ${appointment.last_name}` 
                        : 'לקוח'}
                    </div>
                    <div className={styles.appointmentService}>
                      {appointment.service_name}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      {appointment.price && (
                        <div className={styles.appointmentPrice}>
                          ₪{appointment.price}
                        </div>
                      )}
                      {getStatusBadge(appointment.status)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <h3>אין תורים</h3>
                <p>עדיין לא נקבעו תורים לעסק שלך</p>
              </div>
            )}
            <button 
              className={styles.viewAllButton}
              onClick={() => setShowAllAppointments(false)}
            >
              הסתר רשימה
            </button>
          </div>
        ) : (
          <button 
            className={styles.viewAllButton}
            onClick={() => setShowAllAppointments(true)}
          >
            הצג את כל התורים ({getAllAppointments().length})
          </button>
        )}
      </div>

      {dashboardData.recent_appointments && dashboardData.recent_appointments.length > 0 && (
        <div className={styles.section}>
          <h2>פעילות אחרונה</h2>
          <div className={styles.activitiesGrid}>
            {dashboardData.recent_appointments.slice(0, 5).map((appointment, index) => (
              <div key={index} className={styles.activityTile}>
                <div className={styles.activityIcon}>📅</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>
                    תור חדש - {appointment.first_name} {appointment.last_name}
                  </div>
                  <div className={styles.activityDescription}>
                    {appointment.service_name} בתאריך {formatDate(appointment.appointment_datetime)}
                  </div>
                  <div className={styles.activityTime}>
                    סטטוס: {getStatusBadge(appointment.status)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}