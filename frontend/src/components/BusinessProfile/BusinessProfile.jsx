// src/components/BusinessProfile/BusinessProfile.jsx

// --- Imports ---
import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom'; // Import useParams to get the ID from the URL
import axiosInstance from "../../api/axiosInstance"; // Import our configured axios instance
import styles from "./BusinessProfile.module.css";
// Import all child components
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar";
import ScheduleModal from "./sideBar/ScheduleModal";
import AppointmentForm from "./AppointmentForm/AppointmentForm";
import ServicesModal from "./sideBar/ServicesModal";
import RequestsTab from "./sideBar/RequestsTab";
import ExistingAppointments from "./sideBar/ExistingAppointments";

export default function BusinessProfile() {
  // --- State Hooks ---
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true); // Added loading state for the main component
  const [error, setError] = useState(null); // Added error state

  // UI State
  const [innerTab, setInnerTab] = useState("calendar");
  const [showEdit, setShowEdit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [booking, setBooking] = useState(null);
  const [showServices, setShowServices] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false);

  // Get the dynamic 'id' from the URL
  const { id: businessId } = useParams();

  // --- Data Fetching Effects ---

  // Effect to fetch initial business data
  useEffect(() => {
    if (!businessId) {
      setError("Business ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    axiosInstance.get(`/businesses/${businessId}`)
      .then(response => {
        setBusiness(response.data);
      })
      .catch(err => {
        console.error("Failed to fetch business data:", err);
        setError("Could not load business information.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [businessId]);

  // Effect to fetch appointments and pending requests count once business data is loaded
  useEffect(() => {
    if (!business) return;

    const monthIso = new Date().toISOString().slice(0, 7);

    // Fetch all appointments for the month
    refreshAppointments();

    // Fetch pending requests to get the count
    axiosInstance.get('/appointments', { params: { businessId: business.business_id, month: monthIso, status: 'pending' } })
      .then(response => {
        setPendingCount(response.data.length);
      })
      .catch(err => console.error("Failed to fetch pending requests count:", err));

  }, [business]); // Depends on `business` object

  // --- Helper Functions ---

  // Function to fetch/refresh appointments for the current month
  const refreshAppointments = async () => {
    if (!business) return;
    try {
      const monthIso = new Date().toISOString().slice(0, 7);
      const response = await axiosInstance.get('/appointments', {
        params: { businessId: business.business_id, month: monthIso }
      });
      setAppointments(response.data);
    } catch (err) {
      console.error("Failed to refresh appointments:", err);
    }
  };

  // --- Handlers for Child Components ---

  const handleUpdateAppointment = async (updatedAppointment) => {
    try {
      await axiosInstance.put(`/appointments/${updatedAppointment.appointment_id}`, updatedAppointment);
      await refreshAppointments();
    } catch (err) {
      console.error("Failed to update appointment:", err);
      alert("שגיאה בעדכון התור"); // Error updating appointment
    }
  };

  const handleCancelAppointment = async (appointment) => {
    try {
      // Assuming the backend has a POST route for cancellation
      await axiosInstance.post(`/appointments/${appointment.appointment_id}/cancel`);
      await refreshAppointments();
    } catch (err) {
      console.error("Failed to cancel appointment:", err);
      alert("שגיאה בביטול תור"); // Error cancelling appointment
    }
  };

  const handleSaveBusinessDetails = async (updatedData) => {
    try {
      await axiosInstance.put(`/businesses/${business.business_id}`, updatedData);
      setBusiness(prev => ({ ...prev, ...updatedData })); // Update local state immediately
      setShowEdit(false);
    } catch (err) {
      console.error("Failed to save business details:", err);
      alert("שמירה נכשלה"); // Save failed
    }
  };

  const handleCreateAppointment = async (newAppointmentData) => {
    try {
      // Add business_id to the appointment data
      const payload = { ...newAppointmentData, business_id: business.business_id };
      await axiosInstance.post("/appointments", payload);
      await refreshAppointments();
      alert("התור נשמר בהצלחה!"); // Appointment saved successfully!
      setBooking(null); // Close the form
    } catch (err) {
      console.error("Failed to create appointment:", err);
      alert("שגיאה בשמירת תור."); // Error saving appointment
    }
  };

  // --- Conditional Renders for Loading/Error States ---
  if (loading) return <p className={styles.loading}>טוען נתוני עסק…</p>;
  if (error) return <p className={styles.loading}>{error}</p>; // Use a dedicated error style later
  if (!business) return <p className={styles.loading}>לא נמצא עסק.</p>; // Business not found

  // --- Main Render ---
  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <img src={business.image_url || "/images/placeholder_business.png"} alt="Business" className={styles.profileImage} />
        <h2 className={styles.sidebarName}>{business.name}</h2>
        <button className={styles.sidebarButton} onClick={() => setShowEdit(true)}>פרטי העסק</button>
        <button className={styles.sidebarButton} onClick={() => setShowSchedule(true)}>לוח זמנים</button>
        <button className={styles.sidebarButton} onClick={() => setShowServices(true)}>ניהול שירותים</button>
        <button className={styles.sidebarButton} onClick={() => setInnerTab("galleryEdit")}>גלריה (עריכה)</button>
        <button className={styles.sidebarButton} onClick={() => setShowRequestsModal(true)} style={{ position: "relative" }}>
          בקשות חדשות
          {pendingCount > 0 && <span className={styles.badge}>{pendingCount}</span>}
        </button>
        <button className={styles.sidebarButton} onClick={() => setShowAppointmentsModal(true)}>תורים קיימים</button>
      </aside>

      <main className={styles.profileContent}>
        <h1 className={styles.title}>{business.name}</h1>
        <p className={styles.category}>{business.category}</p>
        <p className={styles.description}><strong>תיאור:</strong> {business.description}</p>

        <div className={styles.tabBar}>
          <button className={innerTab === "calendar" ? styles.activeTab : ""} onClick={() => setInnerTab("calendar")}>לוח שנה</button>
          <button className={innerTab === "contact" ? styles.activeTab : ""} onClick={() => setInnerTab("contact")}>צור קשר</button>
          <button className={innerTab === "galleryView" ? styles.activeTab : ""} onClick={() => setInnerTab("galleryView")}>גלריה</button>
        </div>

        {/* --- Tab Content --- */}
        {innerTab === "calendar" && (
          <section className={styles.section}>
            <h2>לוח שנה</h2>
            <Calendar
              appointments={appointments.map(a => ({ date: a.date, time: a.time, customer: `#${a.customer_id}` }))}
              onDaySelect={(iso, dayAppts) => setBooking({ dateIso: iso, taken: dayAppts.map(a => a.time) })}
            />
          </section>
        )}
        {innerTab === "contact" && (
          <section className={styles.section}>
            <h2>פרטי יצירת קשר</h2>
            <p><strong>אימייל:</strong> {business.email}</p>
            <p><strong>טלפון:</strong> {business.phone}</p>
            <p><strong>כתובת:</strong> {business.address}</p>
          </section>
        )}
        {innerTab === "galleryView" && (
          <section className={styles.section}>
            <h2>גלריה</h2>
            {/* ... gallery rendering ... */}
          </section>
        )}
      </main>

      {/* --- Modals --- */}
      {showAppointmentsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeModal} onClick={() => setShowAppointmentsModal(false)}>✕</button>
            <ExistingAppointments appointments={appointments} onUpdate={handleUpdateAppointment} onCancel={handleCancelAppointment} />
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

      {showSchedule && <ScheduleModal appointments={appointments} onClose={() => setShowSchedule(false)} />}
      {showServices && <ServicesModal services={services} onSave={setServices} onClose={() => setShowServices(false)} />}

      {booking && (
        <AppointmentForm
          date={booking.dateIso}
          takenSlots={booking.taken}
          services={services}
          onSubmit={handleCreateAppointment}
          onCancel={() => setBooking(null)}
        />
      )}

      {showRequestsModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button className={styles.closeModal} onClick={() => setShowRequestsModal(false)}>✕</button>
            <RequestsTab businessId={business.business_id} onAction={() => setPendingCount(prev => Math.max(0, prev - 1))} />
          </div>
        </div>
      )}
    </div>
  );
}