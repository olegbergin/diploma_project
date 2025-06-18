/* eslint-disable react-hooks/exhaustive-deps */
// src/components/BusinessProfile/BusinessProfile.jsx
// --- פרופיל ניהול עסקי (רק לבעל העסק) ---
// אין פה AppointmentForm, אין קביעת תור! לקוח קובע תור רק בפרופיל הציבורי.

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar";
import ScheduleModal from "./sideBar/ScheduleModal";
import ServicesModal from "./sideBar/ServicesModal";
import RequestsTab from "./sideBar/RequestsTab";
import ExistingAppointments from "./sideBar/ExistingAppointments";

export default function BusinessProfile() {
  // --- States ---
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI State
  const [innerTab, setInnerTab] = useState("calendar");
  const [showEdit, setShowEdit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [showServices, setShowServices] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  // קבלת id של העסק מה-URL
  const { id: businessId } = useParams();

  // --- אפקט לשליפת עסק ---
  useEffect(() => {
    if (!businessId) {
      setError("Business ID is missing.");
      setLoading(false);
      return;
    }
    setLoading(true);
    axiosInstance
      .get(`/businesses/${businessId}`)
      .then((response) => {
        setBusiness(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch business data:", err);
        setError("Could not load business information.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [businessId]);

  // --- אפקט לשליפת תורים וספירת בקשות ממתינות ---
  useEffect(() => {
    if (!business) return;

    const monthIso = new Date().toISOString().slice(0, 7);
    refreshAppointments();
    axiosInstance
      .get("/appointments", {
        params: {
          businessId: business.business_id,
          month: monthIso,
          status: "pending",
        },
      })
      .then((response) => {
        setPendingCount(response.data.length);
      })
      .catch((err) =>
        console.error("Failed to fetch pending requests count:", err)
      );
  }, [business]);

  // --- פונקציה לרענון התורים ---
  const refreshAppointments = async () => {
    if (!business) return;
    try {
      const monthIso = new Date().toISOString().slice(0, 7);
      const response = await axiosInstance.get("/appointments", {
        params: { businessId: business.business_id, month: monthIso },
      });
      setAppointments(response.data);
    } catch (err) {
      console.error("Failed to refresh appointments:", err);
    }
  };

  // --- פעולות ניהוליות בלבד! ---
  const handleUpdateAppointment = async (updatedAppointment) => {
    try {
      await axiosInstance.put(
        `/appointments/${updatedAppointment.appointment_id}`,
        updatedAppointment
      );
      await refreshAppointments();
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("שגיאה בעדכון התור");
    }
  };

  const handleCancelAppointment = async (appointment) => {
    try {
      await axiosInstance.post(
        `/appointments/${appointment.appointment_id}/cancel`
      );
      await refreshAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("שגיאה בביטול תור");
    }
  };

  const handleSaveBusinessDetails = async (updatedData) => {
    try {
      await axiosInstance.put(
        `/businesses/${business.business_id}`,
        updatedData
      );
      setBusiness((prev) => ({ ...prev, ...updatedData }));
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to save business details:", err);
      alert("שמירה נכשלה");
    }
  };

  // --- הצגת טעינה/שגיאה ---
  if (loading) return <p className={styles.loading}>טוען נתוני עסק…</p>;
  if (error) return <p className={styles.loading}>{error}</p>;
  if (!business) return <p className={styles.loading}>לא נמצא עסק.</p>;

  // --- תצוגה עיקרית ---
  return (
    <div className={styles.pageLayout}>
      {/* Sidebar ניהול בלבד */}
      <aside className={styles.sidebar}>
        <img
          src={business.image_url || "/images/placeholder_business.png"}
          alt="Business"
          className={styles.profileImage}
        />
        <h2 className={styles.sidebarName}>{business.name}</h2>
        <button
          className={styles.sidebarButton}
          onClick={() => setShowEdit(true)}
        >
          פרטי העסק
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setShowSchedule(true)}
        >
          לוח זמנים
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setShowServices(true)}
        >
          ניהול שירותים
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setInnerTab("galleryEdit")}
        >
          גלריה (עריכה)
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setShowRequestsModal(true)}
          style={{ position: "relative" }}
        >
          בקשות חדשות
          {pendingCount > 0 && (
            <span className={styles.badge}>{pendingCount}</span>
          )}
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setShowAppointmentsModal(true)}
        >
          תורים קיימים
        </button>
      </aside>

      <main className={styles.profileContent}>
        <h1 className={styles.title}>{business.name}</h1>
        <p className={styles.category}>{business.category}</p>
        <p className={styles.description}>
          <strong>תיאור:</strong> {business.description}
        </p>

        <div className={styles.tabBar}>
          <button
            className={innerTab === "calendar" ? styles.activeTab : ""}
            onClick={() => setInnerTab("calendar")}
          >
            לוח שנה
          </button>
          <button
            className={innerTab === "contact" ? styles.activeTab : ""}
            onClick={() => setInnerTab("contact")}
          >
            צור קשר
          </button>
          <button
            className={innerTab === "galleryView" ? styles.activeTab : ""}
            onClick={() => setInnerTab("galleryView")}
          >
            גלריה
          </button>
        </div>

        {/* --- Tab Content --- */}
        {innerTab === "calendar" && (
          <section className={styles.section}>
            <h2>לוח שנה</h2>
            <Calendar
              appointments={appointments.map((a) => ({
                date: a.date,
                time: a.time,
                customer: `#${a.customer_id}`,
              }))}
              // אין פה קביעת תור!
            />
          </section>
        )}
        {innerTab === "contact" && (
          <section className={styles.section}>
            <h2>פרטי יצירת קשר</h2>
            <p>
              <strong>אימייל:</strong> {business.email}
            </p>
            <p>
              <strong>טלפון:</strong> {business.phone}
            </p>
            <p>
              <strong>כתובת:</strong> {business.address}
            </p>
          </section>
        )}
        {innerTab === "galleryView" && (
          <section className={styles.section}>
            <h2>גלריה</h2>
            {/* ... gallery rendering ... */}
          </section>
        )}
      </main>

      {/* --- Modals ניהוליים בלבד --- */}
      {showAppointmentsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setShowAppointmentsModal(false)}
            >
              ✕
            </button>
            <ExistingAppointments
              appointments={appointments}
              onUpdate={handleUpdateAppointment}
              onCancel={handleCancelAppointment}
            />
          </div>
        </div>
      )}

      {showEdit && (
        <BusinessDetailsForm
          initialData={business}
          onSave={handleSaveBusinessDetails}
          onClose={() => setShowEdit(false)}
        />
      )}

      {showSchedule && (
        <ScheduleModal
          appointments={appointments}
          onClose={() => setShowSchedule(false)}
        />
      )}
      {showServices && (
        <ServicesModal
          services={services}
          onSave={setServices}
          onClose={() => setShowServices(false)}
        />
      )}

      {showRequestsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              className={styles.closeModal}
              onClick={() => setShowRequestsModal(false)}
            >
              ✕
            </button>
            <RequestsTab
              businessId={business.business_id}
              onAction={() => setPendingCount((prev) => Math.max(0, prev - 1))}
            />
          </div>
        </div>
      )}
    </div>
  );
}
