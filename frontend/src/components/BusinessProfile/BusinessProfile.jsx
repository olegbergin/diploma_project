import { useEffect, useState } from "react";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar";
import ScheduleModal from "./sideBar/ScheduleModal";
import AppointmentForm from "./AppointmentForm/AppointmentForm";
import ServicesModal from "./sideBar/ServicesModal";
import RequestsTab from "./sideBar/RequestsTab";
import { fetchAppointments } from "./api/appointments";

export default function BusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const [innerTab, setInnerTab] = useState("calendar");
  const [showEdit, setShowEdit] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [booking, setBooking] = useState(null);
  const [showServices, setShowServices] = useState(false);
  const [services, setServices] = useState([]); // <-- כאן נשמרים השירותים
  const [showRequestsModal, setShowRequestsModal] = useState(false);
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

    // שליפת מספר בקשות "pending" עבור הבאדג'
    fetch(
      `/api/appointments?businessId=${business.business_id}&month=${monthIso}&status=pending`
    )
      .then((r) => r.json())
      .then((requests) => setPendingCount(requests.length));
  }, [business]);

  if (!business) return <p className={styles.loading}>טוען נתוני עסק…</p>;

  return (
    <div className={styles.pageLayout}>
      {/* ----- Sidebar ----- */}
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
        {/* --- בקשות חדשות כמודאל עם באדג' --- */}
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
          onClick={() => setActiveTab("appointments")}
        >
          תורים קיימים
        </button>
      </aside>

      {/* ----- Main Content ----- */}
      <main className={styles.profileContent}>
        <h1 className={styles.title}>{business.name}</h1>
        <p className={styles.category}>{business.category}</p>
        <p className={styles.description}>
          <strong>תיאור:</strong> {business.description}
        </p>

        {/* TabBar ללקוחות */}
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

        {/* טאבים ללקוחות */}
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
            <div className={styles.contactInfo}>
              <p>
                <strong>אימייל:</strong> {business.email}
              </p>
              <p>
                <strong>טלפון:</strong> {business.phone}
              </p>
              <p>
                <strong>כתובת:</strong> {business.address}
              </p>
            </div>
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

        {/* ---- אזורי ניהול לבעל-עסק ---- */}
        {activeTab === "galleryEdit" && (
          <section className={styles.section}>
            <h2>גלריה (עריכה)</h2>
            <p>כאן יופיעו כלי העלאה/מחיקה.</p>
          </section>
        )}
        {activeTab === "appointments" && (
          <section className={styles.section}>
            <h2>תורים קיימים</h2>
            <p>אין תורים להצגה.</p>
          </section>
        )}
      </main>

      {/* ----- מודאל “פרטי העסק” ----- */}
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

      {/* ----- מודאל “לוח זמנים” (בעל-עסק) ----- */}
      {showSchedule && (
        <ScheduleModal
          appointments={appointments}
          onClose={() => setShowSchedule(false)}
        />
      )}

      {/* --- מודאל ניהול שירותים --- */}
      {showServices && (
        <ServicesModal
          services={services}
          onSave={(newList) => {
            setServices(newList);
            setShowServices(false);
            // בעתיד: לשמור גם לשרת
          }}
          onClose={() => setShowServices(false)}
        />
      )}

      {/* ----- מודאל קביעת תור (לקוח) ----- */}
      {booking && (
        <AppointmentForm
          date={booking.dateIso}
          takenSlots={booking.taken}
          services={services} // <<<< ---- הוספנו
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
                  service, // <<-- שלח את השירות גם לשרת
                }),
              });
              // לרענן תורים:
              const monthIso = new Date().toISOString().slice(0, 7);
              const newAppointments = await fetchAppointments(
                business.business_id,
                monthIso
              );
              setAppointments(newAppointments);
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

      {/* ----- מודאל בקשות חדשות ----- */}
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
