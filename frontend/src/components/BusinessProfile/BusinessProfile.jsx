import { useEffect, useState } from "react";
import styles from "./BusinessProfile.module.css";
import BusinessDetailsForm from "./sideBar/BusinessDetailsForm";
import Calendar from "./tabs/Calendar/Calendar"; // לוח-חודש ללקוחות
import ScheduleModal from "./sideBar/ScheduleModal"; // פופ-אפ לוח זמנים

export default function BusinessProfile() {
  const [business, setBusiness] = useState(null);
  const [activeTab, setActiveTab] = useState("info"); // כפתורי הסייד-בר
  const [innerTab, setInnerTab] = useState("calendar"); // הטאבים ללקוחות

  const [showEdit, setShowEdit] = useState(false); // מודאל “פרטי העסק”
  const [showSchedule, setShowSchedule] = useState(false); // מודאל לוח-זמנים

  /* --- טעינת נתוני העסק פעם אחת --- */
  useEffect(() => {
    fetch("http://localhost:3000/api/businesses/1")
      .then((r) => r.json())
      .then(setBusiness)
      .catch(console.error);
  }, []);

  if (!business) return <p className={styles.loading}>טוען נתוני עסק…</p>;

  return (
    <div className={styles.pageLayout}>
      {/* ---------- Sidebar ---------- */}
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

      {/* ---------- תוכן ראשי ---------- */}
      <main className={styles.profileContent}>
        <h1 className={styles.title}>{business.name}</h1>
        <p className={styles.category}>{business.category}</p>
        <p className={styles.description}>
          <strong>תיאור:</strong> {business.description}
        </p>

        {/* === TabBar ללקוחות === */}
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
              appointments={[
                { day: 3, time: "10:00", customer: "מיכל לוי" },
                { day: 3, time: "14:00", customer: "דוד כהן" },
                { day: 7, time: "09:30", customer: "נועה בן-דוד" },
              ]}
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

      {/* ---------- מודאל “פרטי העסק” ---------- */}
      {showEdit && (
        <BusinessDetailsForm
          initialData={business}
          onSave={async (data) => {
            try {
              await fetch(`/api/businesses/${business.id}`, {
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

      {/* ---------- מודאל “לוח זמנים” ---------- */}
      {showSchedule && (
        <ScheduleModal
          appointments={[
            { date: "2025-05-03", time: "10:00", customer: "מיכל לוי" },
            { date: "2025-05-03", time: "14:00", customer: "דוד כהן" },
            { date: "2025-05-07", time: "09:30", customer: "נועה בן-דוד" },
          ]}
          onClose={() => setShowSchedule(false)}
        />
      )}
    </div>
  );
}
