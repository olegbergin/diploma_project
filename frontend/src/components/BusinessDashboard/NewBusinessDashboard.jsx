import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./NewBusinessDashboard.module.css";
import axiosInstance from "../../api/axiosInstance";
import ExistingAppointments from "../BusinessProfile/sideBar/ExistingAppointments";
import RequestsTab from "../BusinessProfile/sideBar/RequestsTab";
import ServicesModal from "../BusinessProfile/sideBar/ServicesModal";
import GalleryEdit from "../BusinessProfile/sideBar/GalleryEdit";
import BusinessDetailsForm from "../BusinessProfile/sideBar/BusinessDetailsForm";
import Calendar from "../BusinessProfile/tabs/Calendar/Calendar";
import GalleryView from "../BusinessProfile/tabs/GalleryView/GalleryView";

// ======= מסך בית משולב לבעל העסק =======
export default function BusinessHome({ user }) {
  const navigate = useNavigate();
  const { id: paramsBusinessId } = useParams();

  // מזהה העסק יכול להגיע מ־URL או מ־user
  const businessId = paramsBusinessId || user?.businessId || user?.id;

  // נתונים מהשרת
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI
  const [adminPanel, setAdminPanel] = useState(null); // "profile" | "services" | "galleryEdit" | "appointments" | "requests" | null
  const [showAllToday, setShowAllToday] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);

  // טעינת נתוני הדשבורד
  useEffect(() => {
    if (!businessId) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(
          `/businesses/${businessId}/dashboard`
        );
        setDashboardData(res.data);
        setError(null);
      } catch (err) {
        console.error("Error fetching business dashboard:", err);
        setError("שגיאה בטעינת נתוני הדשבורד");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [businessId]);

  // עזרים
  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("he-IL", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status) => {
    const map = {
      pending: { text: "ממתין לאישור", cls: styles.statusPending },
      confirmed: { text: "אושר", cls: styles.statusConfirmed },
      completed: { text: "הושלם", cls: styles.statusCompleted },
      cancelled_by_user: { text: "בוטל ע״י לקוח", cls: styles.statusCancelled },
      cancelled_by_business: {
        text: "בוטל ע״י עסק",
        cls: styles.statusCancelled,
      },
      not_arrived: { text: "לא הגיע", cls: styles.statusNotArrived },
    };
    const s = map[status] || { text: status, cls: styles.statusDefault };
    return <span className={`${styles.statusBadge} ${s.cls}`}>{s.text}</span>;
  };

  const pendingAppointments = useMemo(
    () =>
      (dashboardData?.recent_appointments || []).filter(
        (a) => a.status === "pending"
      ),
    [dashboardData]
  );

  const todayAppointments = useMemo(
    () => dashboardData?.today_appointments || [],
    [dashboardData]
  );

  // חישוב “סה״כ השבוע” אם השרת לא מחזיר שדה מוכן
  const totalThisWeek = useMemo(() => {
    // אם יש ב־analytics סכימה לשבוע – נשתמש בה
    if (dashboardData?.analytics?.appointments_this_week != null) {
      return dashboardData.analytics.appointments_this_week;
    }
    // אחרת – נחשב מתוך recent_appointments (פחות מומלץ לדיוק, אבל עובד)
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay()); // יום ראשון של השבוע (בהתאם ל־Locale זה עשוי להשתנות)
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return (dashboardData?.recent_appointments || []).filter((a) => {
      const t = new Date(a.appointment_datetime);
      return t >= start && t < end;
    }).length;
  }, [dashboardData]);

  // פעולות על תור
  const updateAppointmentStatus = async (appointmentId, action) => {
    try {
      const status =
        action === "approve"
          ? "confirmed"
          : action === "reject"
          ? "cancelled_by_business"
          : action;
      await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status,
      });
      // ריענון
      const res = await axiosInstance.get(
        `/businesses/${businessId}/dashboard`
      );
      setDashboardData(res.data);
    } catch (err) {
      console.error("Error updating appointment:", err);
      setError("שגיאה בעדכון התור");
    }
  };

  // טיפול בסגירת/שמירת מודאל שירותים
  const handleServiceCreatedOrSaved = async () => {
    try {
      const res = await axiosInstance.get(
        `/businesses/${businessId}/dashboard`
      );
      setDashboardData(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsServiceModalOpen(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתונים...</p>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>{error || "לא נמצאו נתונים"}</p>
      </div>
    );
  }

  const business = dashboardData.business;

  return (
    <div className={styles.pageLayout}>
      {/* ===== Sidebar ===== */}
      <aside className={styles.sidebar}>
        <button
          className={styles.sidebarButton}
          onClick={() => setAdminPanel(null)}
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

      {/* ===== Main ===== */}
      <main className={styles.main}>
        {/* Header + פעולות מהירות */}
        <div className={styles.header}>
          <div className={styles.headerTitles}>
            <h1>שלום, {business?.name}</h1>
            <p>סיכום פעילות העסק שלך</p>
          </div>
          <div className={styles.headerActions}>
            <button
              className={styles.secondaryBtn}
              onClick={() =>
                navigate(`/business-profile/${businessId}?view=public`)
              }
              title="צפייה כ-לקוח"
            >
              👀 צפייה כ-לקוח
            </button>
            <button
              className={styles.primaryBtn}
              onClick={() => setIsServiceModalOpen(true)}
            >
              ➕ שירות חדש
            </button>
          </div>
        </div>

        {/* סטטיסטיקות קצרות */}
        <div className={styles.statsGrid}>
          <div className={styles.statTile}>
            <div className={styles.statNumber}>
              {dashboardData.analytics?.total_appointments ?? 0}
            </div>
            <div className={styles.statLabel}>סה״כ תורים</div>
          </div>
          <div className={styles.statTile}>
            <div className={styles.statNumber}>{totalThisWeek}</div>
            <div className={styles.statLabel}>סה״כ השבוע</div>
          </div>
          <div className={styles.statTile}>
            <div className={styles.statNumber}>
              {dashboardData.analytics?.pending_appointments ??
                pendingAppointments.length}
            </div>
            <div className={styles.statLabel}>ממתינים לאישור</div>
          </div>
          <div className={styles.statTile}>
            <div className={styles.statNumber}>
              {dashboardData.business?.total_services ?? 0}
            </div>
            <div className={styles.statLabel}>שירותים פעילים</div>
          </div>
        </div>

        {/* ממתינים לאישור */}
        {pendingAppointments.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>תורים ממתינים לאישור ({pendingAppointments.length})</h2>
            </div>
            <div className={styles.appointmentsGrid}>
              {pendingAppointments.map((apt) => (
                <div key={apt.appointment_id} className={styles.pendingTile}>
                  <div className={styles.line1}>
                    <span className={styles.time}>
                      {formatDate(apt.appointment_datetime)}
                    </span>
                    <span className={styles.service}>{apt.service_name}</span>
                  </div>
                  <div className={styles.line2}>
                    <span className={styles.customer}>
                      {apt.first_name && apt.last_name
                        ? `${apt.first_name} ${apt.last_name}`
                        : "לקוח"}
                    </span>
                    <div className={styles.actions}>
                      <button
                        className={styles.approveBtn}
                        onClick={() =>
                          updateAppointmentStatus(apt.appointment_id, "approve")
                        }
                      >
                        ✅ אשר
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() =>
                          updateAppointmentStatus(apt.appointment_id, "reject")
                        }
                      >
                        ❌ דחה
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* תורים להיום (תצוגה מהירה) */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>תורים להיום</h2>
            {todayAppointments.length > 3 && (
              <button
                className={styles.linkBtn}
                onClick={() => setShowAllToday((v) => !v)}
              >
                {showAllToday
                  ? "הסתר"
                  : `הצג הכל (${todayAppointments.length})`}
              </button>
            )}
          </div>

          {todayAppointments.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>אין תורים היום</h3>
              <p>לא נקבעו תורים ליום זה</p>
            </div>
          ) : (
            <div className={styles.appointmentsGrid}>
              {(showAllToday
                ? todayAppointments
                : todayAppointments.slice(0, 3)
              ).map((apt) => (
                <div
                  key={apt.appointment_id}
                  className={styles.appointmentTile}
                >
                  <div className={styles.line1}>
                    <span className={styles.time}>
                      {formatDate(apt.appointment_datetime)}
                    </span>
                    <span className={styles.service}>{apt.service_name}</span>
                  </div>
                  <div className={styles.line2}>
                    <span className={styles.customer}>
                      {apt.first_name && apt.last_name
                        ? `${apt.first_name} ${apt.last_name}`
                        : "לקוח"}
                    </span>
                    <div className={styles.trailing}>
                      {apt.price ? (
                        <span className={styles.price}>₪{apt.price}</span>
                      ) : null}
                      {getStatusBadge(apt.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* אזור “תצוגה מצד הלקוח” (Embed קליל) – אופציונלי */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>תצוגה מצד הלקוח (תקציר)</h2>
            <button
              className={styles.linkBtn}
              onClick={() =>
                navigate(`/business-profile/${businessId}?view=public`)
              }
            >
              פתיחה במסך מלא
            </button>
          </div>
          <div className={styles.split}>
            <div className={styles.splitCol}>
              <h3 className={styles.subTitle}>לוח שנה</h3>
              <div className={styles.embedCard}>
                <Calendar
                  appointments={dashboardData.calendar_appointments || []}
                />
              </div>
            </div>
            <div className={styles.splitCol}>
              <h3 className={styles.subTitle}>גלריה</h3>
              <div className={styles.embedCard}>
                <GalleryView gallery={dashboardData.gallery || []} />
              </div>
            </div>
          </div>
        </section>

        {/* פאנל ניהול (מוחלף דינמית) */}
        {adminPanel && (
          <section className={styles.adminPanel}>
            {adminPanel === "profile" && (
              <BusinessDetailsForm
                initialData={business}
                onSave={() => setAdminPanel(null)}
                onClose={() => setAdminPanel(null)}
              />
            )}
            {adminPanel === "services" && (
              <ServicesModal
                services={dashboardData.business?.services || []}
                onSave={handleServiceCreatedOrSaved}
                onClose={() => setAdminPanel(null)}
              />
            )}
            {adminPanel === "galleryEdit" && (
              <GalleryEdit
                gallery={dashboardData.gallery || []}
                onSave={() => setAdminPanel(null)}
                onClose={() => setAdminPanel(null)}
              />
            )}
            {adminPanel === "appointments" && (
              <ExistingAppointments
                appointments={dashboardData.recent_appointments || []}
                onUpdate={() => {}}
                onCancel={() => {}}
              />
            )}
            {adminPanel === "requests" && (
              <RequestsTab businessId={businessId} onAction={() => {}} />
            )}
          </section>
        )}
      </main>

      {/* מודאל יצירת שירות חדש (שימוש מחדש ברכיב קיים) */}
      {isServiceModalOpen && (
        <ServicesModal
          services={dashboardData.business?.services || []}
          onSave={handleServiceCreatedOrSaved}
          onClose={() => setIsServiceModalOpen(false)}
        />
      )}
    </div>
  );
}
