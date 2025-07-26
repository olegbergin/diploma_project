import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './UserDashboard.module.css';
import DashboardHeader from './components/DashboardHeader';
import Navigation from './components/Navigation';
import QuickActions from './components/QuickActions';
import KPICards from './components/KPICards';
import RecentActivity from './components/RecentActivity';
import BookingsView from './views/BookingsView';
import FavoritesView from './views/FavoritesView';
import ProfileView from './views/ProfileView';
import PullToRefresh from '../BusinessProfile/components/PullToRefresh';
import { useSwipeGestures } from '../BusinessProfile/hooks/useSwipeGestures';
import { useDashboardData } from './hooks/useDashboardData';

export default function UserDashboard({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // Custom hooks
  const { dashboardData, loading, refreshData } = useDashboardData(user?.id);
  
  // Views configuration
  const views = ['dashboard', 'bookings', 'favorites', 'profile'];
  
  // Swipe gestures for mobile
  const handleSwipeLeft = () => {
    if (isMobile && activeView === 'dashboard') {
      const currentIndex = views.indexOf(activeView);
      const nextIndex = (currentIndex + 1) % views.length;
      setActiveView(views[nextIndex]);
    }
  };
  
  const handleSwipeRight = () => {
    if (isMobile && activeView !== 'dashboard') {
      const currentIndex = views.indexOf(activeView);
      const prevIndex = currentIndex === 0 ? views.length - 1 : currentIndex - 1;
      setActiveView(views[prevIndex]);
    }
  };
  
  const swipeRef = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50
  });
  
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle URL-based view switching
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const view = searchParams.get('view');
    if (view && views.includes(view)) {
      setActiveView(view);
    }
  }, [location]);
  
  // Navigation handler
  const handleViewChange = (view) => {
    setActiveView(view);
    setIsNavOpen(false);
    
    // Update URL without page reload
    const newUrl = view === 'dashboard' 
      ? `/user/${user.id}/dashboard`
      : `/user/${user.id}/dashboard?view=${view}`;
    window.history.pushState({}, '', newUrl);
  };
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    try {
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };
  
  // Quick action handlers
  const handleQuickAction = (action) => {
    switch (action) {
      case 'search':
        navigate('/search');
        break;
      case 'book':
        navigate('/search?intent=book');
        break;
      case 'favorites':
        setActiveView('favorites');
        break;
      case 'profile':
        setActiveView('profile');
        break;
      default:
        break;
    }
  };
  
  // Render view content
  const renderViewContent = () => {
    switch (activeView) {
      case 'bookings':
        return <BookingsView user={user} />;
      case 'favorites':
        return <FavoritesView user={user} />;
      case 'profile':
        return <ProfileView user={user} />;
      default:
        return (
          <div className={styles.dashboardContent}>
            <KPICards data={dashboardData} loading={loading} />
            <QuickActions onAction={handleQuickAction} />
            <RecentActivity data={dashboardData} loading={loading} />
          </div>
        );
    }
  };
  
  if (!user) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p className={styles.loadingText}>טוען נתוני משתמש...</p>
      </div>
    );
  }
  
  const content = (
    <div className={`${styles.dashboardLayout} ${isMobile ? styles.mobileLayout : ''}`}>
      <DashboardHeader 
        user={user}
        isMobile={isMobile}
        isNavOpen={isNavOpen}
        onNavToggle={() => setIsNavOpen(!isNavOpen)}
        activeView={activeView}
      />
      
      <Navigation
        activeView={activeView}
        onViewChange={handleViewChange}
        isMobile={isMobile}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
      
      {/* Mobile overlay */}
      {isMobile && isNavOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setIsNavOpen(false)}
        />
      )}
      
      <main 
        className={styles.mainContent}
        ref={isMobile ? swipeRef : null}
      >
        {renderViewContent()}
      </main>
    </div>
  );
  
  // Wrap with pull-to-refresh on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {content}
    </PullToRefresh>
  ) : content;
}