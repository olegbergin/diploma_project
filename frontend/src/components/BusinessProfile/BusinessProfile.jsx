/* src/components/BusinessProfile/BusinessProfile.jsx */
import { useEffect, useState } from "react";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar";
import ScheduleModal from "./sideBar/ScheduleModal";
import { fetchAppointments } from "./api/appointments";

export default function BusinessProfile() {
  /* ───────────── קונטרולרים ───────────── */
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // כפתורי Sidebar
  const [innerTab, setInnerTab] = useState("calendar"); // טאב-בר ללקוחות
  const [showEdit, setShowEdit] = useState(false); // מודאל פרטי-עסק
  const [showSchedule, setShowSchedule] = useState(false); // מודאל לוח-זמנים
  const [appointments, setAppointments] = useState([]); // תורים מה-DB

  /* ───────────── טעינת העסק פעם אחת ───────────── */
  useEffect(() => {
    fetch("/api/businesses/1")
      .then((r) => r.json())
      .then(setBusiness)
      .catch(console.error);
  }, []);

  /* ───────────── טעינת תורים לאחר שהעסק נטען ───────────── */
  useEffect(() => {
    if (!business) return;
    const monthIso = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    fetchAppointments(business.business_id, monthIso)
      .then(setAppointments)
      .catch(console.error);
  }, [business]);

  if (!business) return <p className={styles.loading}>טוען נתוני עסק…</p>;

  /* ───────────── JSX ───────────── */
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
          onClick={() => setActiveTab("galleryEdit")}
        >
          גלריה (עריכה)
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setActiveTab("requests")}
        >
          בקשות חדשות
        </button>
        <button
          className={styles.sidebarButton}
          onClick={() => setActiveTab("appointments")}
        >
          תורים קיימים
        </button>
      </aside>

      {/* ----- תוכן ראשי ----- */}
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

        {/* ---- טאבים ללקוחות ---- */}
        {innerTab === "calendar" && (
          <section className={styles.section}>
            <h2>לוח שנה</h2>
            <Calendar
              appointments={appointments.map((a) => ({
                date: a.date, // 'YYYY-MM-DD'
                time: a.time, // 'HH:MM'
                customer: `#${a.customer_id}`, // או שם הלקוח כשתהיה הטבלה
              }))}
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

        {activeTab === "requests" && (
          <section className={styles.section}>
            <h2>בקשות תור חדשות</h2>
            <p>אין בקשות חדשות.</p>
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
            } catch (err) {
              console.error(err);
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
    </div>
  );
}
