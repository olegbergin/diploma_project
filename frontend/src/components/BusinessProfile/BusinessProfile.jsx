import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import ServicesModal from "./sideBar/ServicesModal";
import GalleryEdit from "./sideBar/GalleryEdit";
import ExistingAppointments from "./sideBar/ExistingAppointments";
import RequestsTab from "./sideBar/RequestsTab";
import Calendar from "./tabs/Calendar/Calendar";
import GalleryView from "./tabs/GalleryView/GalleryView";
import MobileNavigation from "./components/MobileNavigation";
import FloatingActionButton from "./components/FloatingActionButton";
import PullToRefresh from "./components/PullToRefresh";
import LazyImage from "./components/LazyImage";
import { useSwipeGestures } from "./hooks/useSwipeGestures";

/**
 * Business Profile Component - Main dashboard for business owners
 * Provides interface for managing business details, services, appointments, and gallery
 * 
 * @component
 * @returns {JSX.Element} Business profile management interface
 */
export default function BusinessProfile() {
  // Business data state
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [gallery, setGallery] = useState([]);
  
  // UI state management
  const [adminPanel, setAdminPanel] = useState(null); // Current admin panel: profile, services, galleryEdit, appointments, requests
  const [activeTab, setActiveTab] = useState("calendar"); // Active public tab: calendar, gallery, reviews
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Tab management with swipe gestures
  const tabs = ["calendar", "gallery", "reviews"];
  
  const handleSwipeLeft = () => {
    if (!adminPanel && isMobile) {
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = (currentIndex + 1) % tabs.length;
      setActiveTab(tabs[nextIndex]);
    }
  };
  
  const handleSwipeRight = () => {
    if (!adminPanel && isMobile) {
      const currentIndex = tabs.indexOf(activeTab);
      const prevIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
      setActiveTab(tabs[prevIndex]);
    }
  };
  
  // Swipe gesture hook
  const swipeRef = useSwipeGestures({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    threshold: 50
  });
  
  // Router hooks
  const { id: businessId } = useParams();
  const navigate = useNavigate();

  /**
   * Load business data from API
   * TODO: Replace mock data with actual API call
   */
  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadBusinessData = async () => {
      try {
        // TODO: Implement actual API call
        // const response = await fetch(`/api/businesses/${businessId}`);
        // const businessData = await response.json();
        
        // Mock data for development - remove when API is ready
        setTimeout(() => {
          setBusiness({
            business_id: businessId,
            name: "מאפיית איילה",
            category: "מאפיה",
            description: "המאפיה של איילה - חלה לשבת!",
            phone: "054-1112223",
            address: "הנרייטה סולד 7, חיפה",
            email: "ayala.bakery@gmail.com",
            image_url: "",
            hours: "א-ה 07:00-20:00, ו׳ 07:00-13:30",
          });
          setAppointments([]);
          setGallery([]);
        }, 200);
      } catch (error) {
        console.error('Failed to load business data:', error);
        // TODO: Add error handling UI
      }
    };
    
    if (businessId) {
      loadBusinessData();
    }
  }, [businessId]);
  
  // Pull to refresh handler
  const handleRefresh = async () => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reload business data
      if (businessId) {
        // In real implementation, this would be an actual API call
        setBusiness(prev => ({ ...prev, lastUpdated: Date.now() }));
      }
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  /**
   * Renders the active public tab content
   * @returns {JSX.Element|null} Tab content component
   */
  const renderPublicTab = () => {
    switch (activeTab) {
      case "calendar":
        return <Calendar appointments={appointments} />;
      case "gallery":
        return <GalleryView gallery={gallery} />;
      case "reviews":
        return (
          <div className={styles.placeholderContent}>
            ביקורות כאן (בעתיד)
          </div>
        );
      default:
        return null;
    }
  };

  /**
   * Renders the active admin panel content
   * @returns {JSX.Element|null} Admin panel component
   */
  const renderAdminPanel = () => {
    const handleClosePanel = () => setAdminPanel(null);
    
    const handleBusinessUpdate = (updatedData) => {
      setBusiness((prev) => ({ ...prev, ...updatedData }));
    };
    
    const handleServicesUpdate = (servicesList) => {
      setBusiness((prev) => ({ ...prev, services: servicesList }));
    };
    
    const handleGalleryUpdate = (images) => {
      setGallery(images);
    };
    
    // TODO: Implement proper appointment and request handlers
    const handleAppointmentUpdate = () => {
      console.log('Appointment update - to be implemented');
    };
    
    const handleAppointmentCancel = () => {
      console.log('Appointment cancel - to be implemented');
    };
    
    const handleRequestAction = () => {
      console.log('Request action - to be implemented');
    };
    
    switch (adminPanel) {
      case "profile":
        return (
          <BusinessDetailsForm
            initialData={business}
            onSave={handleBusinessUpdate}
            onClose={handleClosePanel}
          />
        );
      case "services":
        return (
          <ServicesModal
            services={business?.services || []}
            onSave={handleServicesUpdate}
            onClose={handleClosePanel}
          />
        );
      case "galleryEdit":
        return (
          <GalleryEdit 
            gallery={gallery} 
            onSave={handleGalleryUpdate}
            onClose={handleClosePanel}
          />
        );
      case "appointments":
        return (
          <ExistingAppointments
            appointments={appointments}
            onUpdate={handleAppointmentUpdate}
            onCancel={handleAppointmentCancel}
          />
        );
      case "requests":
        return (
          <RequestsTab 
            businessId={businessId} 
            onAction={handleRequestAction}
          />
        );
      default:
        return null;
    }
  };

  if (!business) return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingSpinner}></div>
      <p className={styles.loadingText}>טוען נתוני עסק...</p>
    </div>
  );

  const content = (
    <div className={`${styles.pageLayout} ${isMobile ? styles.mobileLayout : ''}`}>
      {/* Mobile Header */}
      {isMobile && (
        <header className={styles.mobileHeader}>
          <button 
            className={styles.menuToggle}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="תפריט ראשי"
          >
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
            <span className={styles.hamburger}></span>
          </button>
          <h1 className={styles.mobileTitle}>{business?.name}</h1>
          <div className={styles.mobileActions}>
            <button 
              className={styles.mobileActionBtn}
              onClick={() => navigate("/login")}
              aria-label="יציאה"
            >
              ⏻
            </button>
          </div>
        </header>
      )}

      {/* -------- Sidebar -------- */}
      <aside className={`${styles.sidebar} ${isMobile && isMobileMenuOpen ? styles.sidebarOpen : ''} ${isMobile && !isMobileMenuOpen ? styles.sidebarClosed : ''}`}>
        <button
          className={styles.sidebarButton}
          onClick={() => {
            setAdminPanel(null);
            setActiveTab("calendar");
          }}
        >
          דף הבית
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel("profile")}
        >
          פרטי עסק
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel("services")}
        >
          ניהול שירותים
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel("galleryEdit")}
        >
          העלאת תמונות
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel("appointments")}
        >
          תורים קיימים
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel("requests")}
        >
          בקשות חדשות
        </button>
        {!isMobile && (
          <button
            className={`${styles.sidebarButton} ${styles.logoutButton}`}
            onClick={() => navigate("/login")}
          >
            יציאה מהמערכת
          </button>
        )}
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className={styles.mobileOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* -------- Main Content -------- */}
      <main className={styles.profileContent}>
        {/* Business Card */}
        <section className={styles.businessCard}>
          <LazyImage
            src={business?.image_url}
            alt={business?.name || "Business"}
            className={styles.businessProfileImg}
            placeholder="/images/placeholder_business.png"
          />
          <div className={styles.businessInfo}>
            <div className={styles.businessName}>{business?.name}</div>
            <div className={styles.businessCategory}>{business?.category}</div>
            <div className={styles.businessDesc}>{business?.description}</div>
            <div className={styles.businessContact}>
              <span>{business?.phone}</span> | <span>{business?.address}</span>
            </div>
            <div className={styles.businessHours}>{business?.hours}</div>
          </div>
        </section>

        {/* Navigation Tabs */}
        {!adminPanel && (
          <>
            {isMobile ? (
              <MobileNavigation 
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            ) : (
              <div className={styles.tabBar}>
              <button
                className={activeTab === "calendar" ? styles.activeTab : ""}
                onClick={() => setActiveTab("calendar")}
              >
                לוח שנה
              </button>
              <button
                className={activeTab === "gallery" ? styles.activeTab : ""}
                onClick={() => setActiveTab("gallery")}
              >
                גלריה
              </button>
              <button
                className={activeTab === "reviews" ? styles.activeTab : ""}
                onClick={() => setActiveTab("reviews")}
              >
                ביקורות
              </button>
              </div>
            )}
            <div 
              className={styles.tabContent}
              ref={isMobile ? swipeRef : null}
            >
              {renderPublicTab()}
            </div>
          </>
        )}

        {/* Admin panel */}
        {adminPanel && (
          <div className={styles.adminPanel}>{renderAdminPanel()}</div>
        )}
      </main>

      {/* Floating Action Button for Mobile */}
      {isMobile && !adminPanel && (
        <FloatingActionButton
          onQuickAction={(action) => setAdminPanel(action)}
        />
      )}
    </div>
  );
  
  // Wrap with pull-to-refresh on mobile
  return isMobile ? (
    <PullToRefresh onRefresh={handleRefresh}>
      {content}
    </PullToRefresh>
  ) : content;
}
