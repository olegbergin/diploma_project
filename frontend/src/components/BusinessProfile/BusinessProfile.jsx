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
// import ReviewsTab from "./tabs/ReviewsTab"; // להוסיף בעתיד

export default function BusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [adminPanel, setAdminPanel] = useState(null); // panels: profile, services, galleryEdit, appointments, requests
  const [activeTab, setActiveTab] = useState("calendar"); // calendar | gallery | reviews
  const { id: businessId } = useParams();
  const navigate = useNavigate();

  // Load business data
  useEffect(() => {
    // כאן לשלוף API
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
  }, [businessId]);

  // --- CLIENT TABS BELOW PROFILE ---
  function renderPublicTab() {
    switch (activeTab) {
      case "calendar":
        return <Calendar appointments={appointments} />;
      case "gallery":
        return <GalleryView gallery={gallery} />;
      case "reviews":
        return <div style={{ color: "#999" }}>ביקורות כאן (בעתיד)</div>;
      default:
        return null;
    }
  }

  // --- ADMIN PANELS ---
  function renderAdminPanel() {
    switch (adminPanel) {
      case "profile":
        return (
          <BusinessDetailsForm
            initialData={business}
            onSave={(updated) =>
              setBusiness((prev) => ({ ...prev, ...updated }))
            }
            onClose={() => setAdminPanel(null)}
          />
        );
      case "services":
        return (
          <ServicesModal
            services={business?.services || []}
            onSave={(list) =>
              setBusiness((prev) => ({ ...prev, services: list }))
            }
            onClose={() => setAdminPanel(null)}
          />
        );
      case "galleryEdit":
        return (
          <GalleryEdit gallery={gallery} onSave={(imgs) => setGallery(imgs)} />
        );
      case "appointments":
        return (
          <ExistingAppointments
            appointments={appointments}
            onUpdate={() => {}} // implement if needed
            onCancel={() => {}}
          />
        );
      case "requests":
        return <RequestsTab businessId={businessId} onAction={() => {}} />;
      default:
        return null;
    }
  }

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
          className={styles.sidebarButton}
          style={{ background: "#fff1f1", color: "#be2a1d", marginTop: "auto" }}
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
