import { useEffect, useState } from "react";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar";
import ScheduleModal from "./sideBar/ScheduleModal";
import AppointmentForm from "./AppointmentForm/AppointmentForm";
import ServicesModal from "./sideBar/ServicesModal";
import RequestsTab from "./sideBar/RequestsTab";
import ExistingAppointments from "./sideBar/ExistingAppointments";
import { fetchAppointments } from "./api/appointments";

export default function BusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [innerTab, setInnerTab] = useState("calendar");
  const [showEdit, setShowEdit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [booking, setBooking] = useState(null);
  const [showServices, setShowServices] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [showAppointmentsModal, setShowAppointmentsModal] = useState(false); // ✅ חדש
  const [services, setServices] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/businesses/1")
      .then((r) => r.json())
      .then(setBusiness)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!business) return;
    const monthIso = new Date().toISOString().slice(0, 7);
    fetchAppointments(business.business_id, monthIso)
      .then(setAppointments)
      .catch(console.error);

    fetch(
      `/api/appointments?businessId=${business.business_id}&month=${monthIso}&status=pending`
    )
      .then((r) => r.json())
      .then((requests) => setPendingCount(requests.length));
  }, [business]);

  const refreshAppointments = async () => {
    const monthIso = new Date().toISOString().slice(0, 7);
    const refreshed = await fetchAppointments(business.business_id, monthIso);
    setAppointments(refreshed);
  };

  const handleUpdateAppointment = async (updated) => {
    try {
      const res = await fetch(`/api/appointments/${updated.appointment_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) {
        const { message } = await res.json();
        alert("שגיאה: " + message);
        return;
      }

      await refreshAppointments();
    } catch (err) {
      console.error(err);
      alert("קרתה שגיאה בעת שמירת התור");
    }
  };

  const handleCancelAppointment = async (appt) => {
    try {
      await fetch(`/api/appointments/${appt.appointment_id}/cancel`, {
        method: "POST",
      });
      await refreshAppointments();
    } catch (err) {
      console.error(err);
      alert("שגיאה בביטול תור");
    }
  };

  if (!business) return <p className={styles.loading}>טוען נתוני עסק…</p>;

  return (
    <div className={styles.pageLayout}>
      <aside className={styles.sidebar}>
        <img
          src={business.image_url || "https://via.placeholder.com/150"}
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
          onClick={() => setActiveTab("galleryEdit")}
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

        {innerTab === "calendar" && (
          <section className={styles.section}>
            <h2>לוח שנה</h2>
            <Calendar
              appointments={appointments.map((a) => ({
                date: a.date,
                time: a.time,
                customer: `#${a.customer_id}`,
              }))}
              onDaySelect={(iso, dayAppts) => {
                const taken = dayAppts.map((a) => a.time);
                setBooking({ dateIso: iso, taken });
              }}
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
            {business.gallery?.length ? (
              <div className={styles.gallery}>
                {business.gallery.map((src, i) => (
                  <img key={i} src={src} alt={`img-${i}`} />
                ))}
              </div>
            ) : (
              <p>אין עדיין תמונות להצגה.</p>
            )}
          </section>
        )}
      </main>

      {/* מודאל “תורים קיימים” */}
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

      {/* שאר המודאלים */}
      {showEdit && (
        <BusinessDetailsForm
          initialData={business}
          onSave={async (data) => {
            try {
              await fetch(`/api/businesses/${business.business_id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
              });
              setBusiness(data);
            } catch {
              alert("שמירה נכשלה");
            } finally {
              setShowEdit(false);
            }
          }}
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
          onSave={(newList) => {
            setServices(newList);
            setShowServices(false);
          }}
          onClose={() => setShowServices(false)}
        />
      )}

      {booking && (
        <AppointmentForm
          date={booking.dateIso}
          takenSlots={booking.taken}
          services={services}
          onSubmit={async ({ date, time, name, phone, email, service }) => {
            try {
              await fetch("/api/appointments", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  business_id: business.business_id,
                  date,
                  time,
                  name,
                  phone,
                  email,
                  service,
                }),
              });
              await refreshAppointments();
              alert("התור נשמר בהצלחה!");
            } catch {
              alert("שגיאה בשמירת תור.");
            } finally {
              setBooking(null);
            }
          }}
          onCancel={() => setBooking(null)}
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
