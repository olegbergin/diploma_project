import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './BusinessDashboard.module.css';
import DashboardHeader from './components/DashboardHeader';
import KPICards from './components/KPICards';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import Analytics from './components/Analytics';
import Navigation from './components/Navigation';
import NotificationPanel from './components/NotificationPanel';
import CalendarView from './views/CalendarView';
import ServicesView from './views/ServicesView';
import { useDashboardData } from './hooks/useDashboardData';

export default function BusinessDashboard() {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [activeView, setActiveView] = useState('overview');
  const [showNotifications, setShowNotifications] = useState(false);

  // Custom hook for dashboard data
  const { 
    business, 
    analytics, 
    recentActivity, 
    notifications,
    isLoading,
    error,
    refreshData 
  } = useDashboardData(businessId);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Render loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתוני דשבורד...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>שגיאה בטעינת הנתונים</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={refreshData}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className={`${styles.dashboard} ${isMobile ? styles.mobile : styles.desktop}`}>
      {/* Navigation - Sidebar on desktop, bottom nav on mobile */}
      <Navigation 
        isMobile={isMobile}
        activeView={activeView}
        onViewChange={setActiveView}
        businessName={business?.name}
        onLogout={() => navigate('/login')}
      />

      {/* Main Content */}
      <main className={styles.mainContent}>
        {/* Header */}
        <DashboardHeader
          business={business}
          isMobile={isMobile}
          notificationCount={notifications?.unread || 0}
          onNotificationsToggle={() => setShowNotifications(!showNotifications)}
          onRefresh={refreshData}
        />

        {/* Dashboard Content */}
        <div className={styles.dashboardContent}>
          {activeView === 'overview' && (
            <>
              {/* KPI Cards */}
              <section className={styles.kpiSection}>
                <KPICards analytics={analytics} isMobile={isMobile} />
              </section>

              {/* Quick Actions */}
              <section className={styles.actionsSection}>
                <QuickActions 
                  businessId={businessId}
                  isMobile={isMobile}
                />
              </section>

              {/* Analytics Charts */}
              <section className={styles.analyticsSection}>
                <Analytics 
                  data={analytics}
                  isMobile={isMobile}
                />
              </section>

              {/* Recent Activity */}
              <section className={styles.activitySection}>
                <RecentActivity 
                  activities={recentActivity}
                  isMobile={isMobile}
                />
              </section>
            </>
          )}

          {/* Calendar View */}
          {activeView === 'calendar' && (
            <CalendarView businessId={businessId} />
          )}

          {/* Services View */}
          {activeView === 'services' && (
            <ServicesView businessId={businessId} />
          )}

          {/* Customers View - Coming Soon */}
          {activeView === 'customers' && (
            <div className={styles.placeholder}>
              <h2>לקוחות</h2>
              <p>ניהול לקוחות יתווסף בקרוב</p>
            </div>
          )}
        </div>
      </main>

      {/* Notification Panel */}
      {showNotifications && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}