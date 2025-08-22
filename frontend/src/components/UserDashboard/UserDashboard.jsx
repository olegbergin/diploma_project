import React, { useState, useEffect } from 'react';
import styles from './UserDashboard.module.css';
import axiosInstance from '../../api/axiosInstance';

export default function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.userId) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/${user.userId}/dashboard`);
        setDashboardData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError('שגיאה בטעינת נתוני הדשבורד');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.userId]);

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

  const getStatusBadge = (status, date) => {
    const statusMap = {
      'pending': { text: 'ממתין לאישור', class: 'statusPending' },
      'confirmed': { text: 'אושר', class: 'statusConfirmed' },
      'completed': { text: 'הושלם', class: 'statusCompleted' },
      'cancelled_by_user': { text: 'בוטל על ידיך', class: 'statusCancelled' },
      'cancelled_by_business': { text: 'בוטל ע"י העסק', class: 'statusCancelled' },
      'not_arrived': { text: 'לא הגעת', class: 'statusNotArrived' }
    };

    const statusInfo = statusMap[status] || { text: status, class: 'statusDefault' };
    return <span className={`${styles.statusBadge} ${styles[statusInfo.class]}`}>{statusInfo.text}</span>;
  };

  const getAllAppointments = () => {
    if (!dashboardData) return [];
    return [...dashboardData.upcomingAppointments, ...dashboardData.pastAppointments]
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>שלום, {dashboardData.user.firstName}</h1>
        <p>סיכום הפעילות שלך</p>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.totalBookings}</div>
          <div className={styles.statLabel}>סה"כ תורים</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.upcomingBookings}</div>
          <div className={styles.statLabel}>תורים קרובים</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.favoriteBusinesses}</div>
          <div className={styles.statLabel}>עסקים מועדפים</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.pastBookings}</div>
          <div className={styles.statLabel}>תורים שהיו</div>
        </div>
      </div>

      {dashboardData.upcomingAppointments.length > 0 && (
        <div className={styles.section}>
          <h2>התורים הקרובים שלי</h2>
          <div className={styles.appointmentsGrid}>
            {dashboardData.upcomingAppointments.map(appointment => (
              <div key={appointment.id} className={styles.appointmentTile}>
                <div className={styles.appointmentDate}>
                  {formatDate(appointment.date)}
                </div>
                <div className={styles.appointmentBusiness}>
                  {appointment.businessName}
                </div>
                <div className={styles.appointmentService}>
                  {appointment.serviceName}
                </div>
                {appointment.price && (
                  <div className={styles.appointmentPrice}>
                    ₪{appointment.price}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData.favorites.length > 0 && (
        <div className={styles.section}>
          <h2>העסקים המועדפים שלי</h2>
          <div className={styles.favoritesGrid}>
            {dashboardData.favorites.map(business => (
              <div key={business.id} className={styles.favoriteTile}>
                <div className={styles.businessName}>{business.name}</div>
                <div className={styles.businessCategory}>{business.category}</div>
                <div className={styles.businessAddress}>{business.address}</div>
                {business.visitCount > 0 && (
                  <div className={styles.visitCount}>
                    {business.visitCount} ביקורים
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {dashboardData.recentActivities.length > 0 && (
        <div className={styles.section}>
          <h2>פעילות אחרונה</h2>
          <div className={styles.activitiesGrid}>
            {dashboardData.recentActivities.map(activity => (
              <div key={activity.id} className={styles.activityTile}>
                <div className={styles.activityIcon}>{activity.icon}</div>
                <div className={styles.activityContent}>
                  <div className={styles.activityTitle}>{activity.title}</div>
                  <div className={styles.activityDescription}>{activity.description}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Appointments Section */}
      <div className={styles.section}>
        <h2>כל התורים שלי</h2>
        {showAllAppointments ? (
          <div>
            {getAllAppointments().length > 0 ? (
              <div className={styles.allAppointmentsGrid}>
                {getAllAppointments().map(appointment => (
                  <div key={appointment.id} className={styles.appointmentTile}>
                    <div className={styles.appointmentDate}>
                      {formatDate(appointment.date)}
                    </div>
                    <div className={styles.appointmentBusiness}>
                      {appointment.businessName}
                    </div>
                    <div className={styles.appointmentService}>
                      {appointment.serviceName}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                      {appointment.price && (
                        <div className={styles.appointmentPrice}>
                          ₪{appointment.price}
                        </div>
                      )}
                      {getStatusBadge(appointment.status, appointment.date)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <h3>אין תורים</h3>
                <p>עדיין לא קבעת תורים במערכת</p>
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
    </div>
  );
}