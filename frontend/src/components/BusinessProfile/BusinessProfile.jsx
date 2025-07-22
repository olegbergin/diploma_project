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
// TODO: Add ReviewsTab component for future implementation

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
  
  // Router hooks
  const { id: businessId } = useParams();
  const navigate = useNavigate();

  /**
   * Load business data from API
   * TODO: Replace mock data with actual API call
   */
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

  if (!business) return <div className={styles.loading}>טוען נתוני עסק...</div>;

  return (
    <div className={styles.pageLayout}>
      {/* -------- Sidebar -------- */}
      <aside className={styles.sidebar}>
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
        <button
          className={`${styles.sidebarButton} ${styles.logoutButton}`}
          onClick={() => navigate("/login")}
        >
          יציאה מהמערכת
        </button>
      </aside>

      {/* -------- Main Content -------- */}
      <main className={styles.profileContent}>
        {/* Always show business card */}
        <section className={styles.businessHeader}>
          <img
            src={business?.image_url || "/images/placeholder_business.png"}
            alt="Business"
            className={styles.businessProfileImg}
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

        {/* Show public tabs only if not in admin panel */}
        {!adminPanel && (
          <>
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
            <div className={styles.tabContent}>{renderPublicTab()}</div>
          </>
        )}

        {/* Admin panel replaces tabs */}
        {adminPanel && (
          <div className={styles.adminPanel}>{renderAdminPanel()}</div>
        )}
      </main>
    </div>
  );
}
