import React, { useState, useEffect } from 'react';
import styles from './UserDashboard.module.css';
import axiosInstance from '../../api/axiosInstance';
import ProfileModal from './ProfileModal/ProfileModal';

export default function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/${user.id}/dashboard`);
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
  }, [user?.id]);

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
    if (!dateString) return 'תאריך לא זמין';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'תאריך לא תקין';
      return date.toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'תאריך לא תקין';
    }
  };

  const getStatusBadge = (status) => {
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
    const upcoming = dashboardData.upcomingAppointments || [];
    const past = dashboardData.pastAppointments || [];
    return [...upcoming, ...past]
      .sort((a, b) => new Date(b.date || b.appointment_datetime) - new Date(a.date || a.appointment_datetime));
  };

  // Calculate better metrics
  const calculateMetrics = () => {
    if (!dashboardData) return {
      appointmentsThisWeek: 0,
      futureAppointments: 0,
      pastAppointments: 0,
      reviewsCount: 0
    };
    
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    const allAppointments = getAllAppointments();
    
    const appointmentsThisWeek = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date || apt.appointment_datetime);
      return !isNaN(aptDate.getTime()) && aptDate >= startOfWeek && aptDate <= endOfWeek;
    }).length;
    
    const futureAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date || apt.appointment_datetime);
      return !isNaN(aptDate.getTime()) && aptDate > now;
    }).length;
    
    const pastAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date || apt.appointment_datetime);
      return !isNaN(aptDate.getTime()) && aptDate < now;
    }).length;
    
    // For now, we'll use favorite businesses as proxy for reviews
    // This should ideally come from the backend
    const reviewsCount = dashboardData.favoriteBusinesses || 0;
    
    return {
      appointmentsThisWeek,
      futureAppointments,
      pastAppointments,
      reviewsCount
    };
  };
  
  const metrics = calculateMetrics();

  const handleProfileUpdate = (updatedUser) => {
    // Update the dashboard data if needed
    if (dashboardData) {
      setDashboardData(prev => ({
        ...prev,
        user: updatedUser
      }));
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1>שלום, {dashboardData.user.firstName}</h1>
        <p>סיכום הפעילות שלך</p>
      </div>

      {/* Quick Actions Panel */}
      <div className={styles.quickActions}>
        <h3>פעולות מהירות</h3>
        <div className={styles.quickActionsGrid}>
          <button className={styles.actionButton} onClick={() => window.location.href = '/search'}>
            <div className={styles.actionIcon}>🔍</div>
            <div className={styles.actionLabel}>חיפוש עסקים</div>
          </button>
          
          
          <button className={styles.actionButton} onClick={() => setShowProfileModal(true)}>
            <div className={styles.actionIcon}>👤</div>
            <div className={styles.actionLabel}>פרופיל</div>
          </button>
          
          <button className={styles.actionButton} onClick={() => window.location.href = '/favorites'}>
            <div className={styles.actionIcon}>❤️</div>
            <div className={styles.actionLabel}>מועדפים</div>
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{metrics.futureAppointments}</div>
          <div className={styles.statLabel}>תורים עתידיים</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{metrics.appointmentsThisWeek}</div>
          <div className={styles.statLabel}>תורים השבוע</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{metrics.pastAppointments}</div>
          <div className={styles.statLabel}>תורים שהיו</div>
        </div>
        
        <div className={styles.statTile}>
          <div className={styles.statNumber}>{dashboardData.favoriteBusinesses}</div>
          <div className={styles.statLabel}>עסקים מועדפים</div>
        </div>
      </div>

      {dashboardData.upcomingAppointments.length > 0 && (
        <div className={styles.section}>
          <h2>התורים הקרובים שלי</h2>
          <div className={styles.appointmentsGrid}>
            {dashboardData.upcomingAppointments.slice(0, 3).map(appointment => (
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
          {dashboardData.upcomingAppointments.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: 'var(--space-4)' }}>
              <span className={styles.moreIndicator}>ועוד {dashboardData.upcomingAppointments.length - 3} תורים...</span>
            </div>
          )}
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


      {/* All Appointments Section */}
      <div className={styles.section}>
        <h2>כל התורים שלי</h2>
        {showAllAppointments ? (
          <div>
            {getAllAppointments().length > 0 ? (
              <>
                <div className={styles.appointmentsSummary}>
                  <p>מציג {getAllAppointments().length} תורים סה"כ</p>
                </div>
                <div className={styles.allAppointmentsGrid}>
                  {getAllAppointments().map((appointment, index) => (
                    <div key={appointment.id || `appointment-${index}`} className={styles.appointmentTile}>
                      <div className={styles.appointmentDate}>
                        {formatDate(appointment.date || appointment.appointment_datetime)}
                      </div>
                      <div className={styles.appointmentBusiness}>
                        {appointment.businessName || appointment.business_name}
                      </div>
                      <div className={styles.appointmentService}>
                        {appointment.serviceName || appointment.service_name}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
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
              </>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>📅</div>
                <h3>אין תורים</h3>
                <p>עדיין לא קבעת תורים במערכת</p>
                <button 
                  className={styles.actionButton}
                  onClick={() => window.location.href = '/search'}
                  style={{ marginTop: 'var(--space-4)' }}
                >
                  <div className={styles.actionIcon}>🔍</div>
                  <div className={styles.actionLabel}>חפש עסקים</div>
                </button>
              </div>
            )}
            <div className={styles.buttonContainer}>
              <button 
                className={styles.viewAllButton}
                onClick={() => setShowAllAppointments(false)}
              >
                הסתר רשימה
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.buttonContainer}>
            <button 
              className={styles.viewAllButton}
              onClick={() => setShowAllAppointments(true)}
            >
              הצג את כל התורים ({getAllAppointments().length})
            </button>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal
        user={dashboardData?.user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpdateSuccess={handleProfileUpdate}
      />
    </div>
  );
}