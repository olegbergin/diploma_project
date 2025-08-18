// src/components/User/UserDashboard/UserDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./UserDashboard.module.css";
import axiosInstance from "../../../api/axiosInstance";

export default function UserDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [favorites, setFavorites] = useState([]); // עסקים אהובים
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // tabs: 'past' | 'all'  (הסרנו upcoming כי יש פס למעלה)
  const [tab, setTab] = useState("all");

  // Modal state
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  const navigate = useNavigate();
  const userId = user?.user_id ?? user?.id ?? null;

  // ---------- Helpers ----------
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
    const statusMap = {
      pending: { text: "ממתין לאישור", class: "statusPending" },
      approved: { text: "אושר", class: "statusConfirmed" },
      confirmed: { text: "אושר", class: "statusConfirmed" }, // תאימות ישנה
      completed: { text: "הושלם", class: "statusCompleted" },
      cancelled_by_user: { text: "בוטל על ידיך", class: "statusCancelled" },
      cancelled_by_business: {
        text: 'בוטל ע"י העסק',
        class: "statusCancelled",
      },
      cancelled: { text: "בוטל", class: "statusCancelled" },
      not_arrived: { text: "לא הגעת", class: "statusNotArrived" },
      scheduled: { text: "מתוזמן", class: "statusConfirmed" },
    };
    const s = statusMap[status] || { text: status, class: "statusDefault" };
    return (
      <span className={`${styles.statusBadge} ${styles[s.class]}`}>
        {s.text}
      </span>
    );
  };

  const isFuture = (apt) =>
    new Date(apt.date) > new Date() &&
    !String(apt.status).startsWith("cancelled") &&
    apt.status !== "completed";

  // ---------- Data fetching ----------
  const fetchDashboard = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);

      // תורים, משתמש וכו'
      const { data } = await axiosInstance.get(`/users/${userId}/dashboard`);
      setDashboardData(data);

      // פייבוריטס - אם לא מגיעים עם הדשבורד, נביא בנפרד
      if (Array.isArray(data?.favorites)) {
        setFavorites(data.favorites);
      } else {
        try {
          const favRes = await axiosInstance.get(`/users/${userId}/favorites`);
          setFavorites(Array.isArray(favRes.data) ? favRes.data : []);
        } catch {
          setFavorites([]);
        }
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("שגיאה בטעינת נתוני הדשבורד");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ---------- Actions ----------
  const handleCancelRequest = async (apt) => {
    if (!apt?.id) return;
    if (!window.confirm("לבטל את התור? הבקשה תועבר לעסק.")) return;

    try {
      setModalBusy(true);
      setModalMsg("");
      // אם הביטול הוא מיידי אצלך: אפשר /appointments/:id/cancel
      await axiosInstance.post(`/appointments/${apt.id}/cancel-request`);
      setModalMsg("הבקשה לביטול נשלחה בהצלחה.");
      await fetchDashboard();
    } catch (e) {
      console.error(e);
      setModalMsg("שגיאה בשליחת בקשת הביטול.");
    } finally {
      setModalBusy(false);
    }
  };

  const handleReschedule = (apt) => {
    if (apt?.businessId && apt?.serviceId) {
      navigate(
        `/booking/${apt.businessId}/${apt.serviceId}?reschedule=${apt.id}`
      );
    } else {
      navigate(`/search?reschedule=${apt.id}`);
    }
  };

  // ---------- Loading / Error ----------
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתונים...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }
  if (!dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>לא נמצאו נתונים</p>
      </div>
    );
  }

  const uid = user?.user_id ?? user?.id ?? dashboardData?.user?.user_id;

  // ---------- Lists ----------
  const upcoming = (dashboardData?.upcomingAppointments ?? [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const past = (dashboardData?.pastAppointments ?? [])
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const allAppointments = [...upcoming, ...past].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // בקשות ממתינות לאישור מהשרת (כולל כל ההמתנות, לא תלוי LIMIT של "קרובים")
  const pendingFuture = (dashboardData?.pendingAppointments ?? [])
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // רשימות לתצוגה לפי טאב (השארנו past/all בלבד)
  const filtered = tab === "past" ? past : allAppointments;

  // ---------- Render ----------
  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTitles}>
          <h1>שלום, {dashboardData.user.first_name}</h1>
          <p>ברוך/ה הבא/ה — הנה מה שמחכה לך</p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.searchButton}
            onClick={() => navigate(`/user/${uid}/edit-profile`)}
          >
            ⚙️ עריכת פרופיל
          </button>
        </div>
      </div>

      {/* Upcoming strip */}
      <div className={styles.upcomingStrip}>
        <div className={styles.upcomingHeader}>
          <h2>התורים הקרובים שלך</h2>
        </div>

        {upcoming.length === 0 ? (
          <div className={styles.emptyRow}>אין לך תורים קרובים</div>
        ) : (
          <div className={styles.upcomingRow}>
            {upcoming.slice(0, 3).map((apt) => (
              <button
                key={apt.id}
                className={`${styles.upcomingChip} ${styles.clickable}`}
                onClick={() => setSelectedAppointment(apt)}
              >
                <div className={styles.chipLineTop}>
                  <span className={styles.chipDate}>
                    {formatDate(apt.date)}
                  </span>
                  {getStatusBadge(apt.status)}
                </div>
                <div className={styles.chipTitle}>{apt.businessName}</div>
                <div className={styles.chipSub}>{apt.serviceName}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pending approvals */}
      <div className={styles.section}>
        <h2>בקשות תור ממתינות לאישור</h2>
        {pendingFuture.length === 0 ? (
          <div className={styles.emptyRow}>אין בקשות ממתינות</div>
        ) : (
          <div className={styles.allAppointmentsGrid}>
            {pendingFuture.map((apt) => (
              <button
                key={apt.id}
                className={`${styles.appointmentTile} ${styles.clickable}`}
                onClick={() => setSelectedAppointment(apt)}
                title="בהמתנה לאישור העסק"
              >
                <div className={styles.appointmentDate}>
                  {formatDate(apt.date)}
                </div>
                <div className={styles.appointmentBusiness}>
                  {apt.businessName}
                </div>
                <div className={styles.appointmentService}>
                  {apt.serviceName}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: ".5rem",
                  }}
                >
                  {apt.price && (
                    <div className={styles.appointmentPrice}>₪{apt.price}</div>
                  )}
                  {getStatusBadge(apt.status)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Favorites */}
      <div className={styles.section}>
        <h2>העסקים המועדפים שלך</h2>
        {favorites.length === 0 ? (
          <div className={styles.emptyRow}>אין עדיין עסקים מועדפים</div>
        ) : (
          <div className={styles.favoritesGrid}>
            {favorites.map((fav) => {
              const bid = fav.business_id ?? fav.businessId;
              return (
                <div key={bid} className={styles.favoriteCard}>
                  <div className={styles.favoriteTopRow}>
                    <div className={styles.favoriteTitle}>
                      {fav.name ?? fav.business_name}
                    </div>
                    <button
                      className={styles.removeFavBtn}
                      onClick={async () => {
                        try {
                          await axiosInstance.delete(
                            `/users/${userId}/favorites/${bid}`
                          );
                          setFavorites((prev) =>
                            prev.filter(
                              (f) => (f.business_id ?? f.businessId) !== bid
                            )
                          );
                        } catch (e) {
                          console.error(e);
                          alert("לא ניתן להסיר מהמועדפים כרגע.");
                        }
                      }}
                      aria-label="הסר ממועדפים"
                      title="הסר ממועדפים"
                    >
                      ✕
                    </button>
                  </div>
                  {fav.city && (
                    <div className={styles.favoriteMeta}>{fav.city}</div>
                  )}
                  {fav.category && (
                    <div className={styles.favoriteMeta}>{fav.category}</div>
                  )}
                  <div className={styles.favoriteActions}>
                    <button
                      className={styles.primaryBtn}
                      onClick={() => navigate(`/business/${bid}`)}
                    >
                      לעמוד העסק
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      onClick={() => navigate(`/search?businessId=${bid}`)}
                    >
                      קבע/י תור
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tabs (השארנו past/all בלבד) */}
      <div className={styles.quickActions}>
        <button
          className={`${styles.actionBtn} ${
            tab === "past" ? styles.actionBtnActive : ""
          }`}
          onClick={() => setTab("past")}
        >
          🕘 תורים שהיו
        </button>
        <button
          className={`${styles.actionBtn} ${
            tab === "all" ? styles.actionBtnActive : ""
          }`}
          onClick={() => setTab("all")}
        >
          📚 כל התורים
        </button>
      </div>

      {/* Appointments list */}
      <div className={styles.section} id="all-appointments">
        <h2>{tab === "past" ? "תורים שהיו" : "כל התורים"}</h2>

        {filtered.length > 0 ? (
          <div className={styles.allAppointmentsGrid}>
            {filtered.map((appointment) => (
              <button
                key={appointment.id}
                className={`${styles.appointmentTile} ${styles.clickable}`}
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className={styles.appointmentDate}>
                  {formatDate(appointment.date)}
                </div>
                <div className={styles.appointmentBusiness}>
                  {appointment.businessName}
                </div>
                <div className={styles.appointmentService}>
                  {appointment.serviceName}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginTop: ".5rem",
                  }}
                >
                  {appointment.price && (
                    <div className={styles.appointmentPrice}>
                      ₪{appointment.price}
                    </div>
                  )}
                  {getStatusBadge(appointment.status)}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateIcon}>📅</div>
            <h3>אין תורים להצגה</h3>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedAppointment && (
        <>
          <div
            className={styles.modalBackdrop}
            onClick={() => setSelectedAppointment(null)}
          />
          <div className={styles.modalCard} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <h3>פרטי תור</h3>
              <button
                className={styles.modalClose}
                onClick={() => setSelectedAppointment(null)}
              >
                ✕
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>תאריך ושעה:</span>{" "}
                {formatDate(selectedAppointment.date)}
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>עסק:</span>{" "}
                {selectedAppointment.businessName}
              </div>
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>שירות:</span>{" "}
                {selectedAppointment.serviceName}
              </div>
              {selectedAppointment.price && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>מחיר:</span> ₪
                  {selectedAppointment.price}
                </div>
              )}
              {selectedAppointment.duration && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>משך:</span>{" "}
                  {selectedAppointment.duration} דק'
                </div>
              )}
              <div className={styles.modalRow}>
                <span className={styles.modalLabel}>סטטוס:</span>{" "}
                {getStatusBadge(selectedAppointment.status)}
              </div>
              {selectedAppointment.businessAddress && (
                <div className={styles.modalRow}>
                  <span className={styles.modalLabel}>כתובת:</span>{" "}
                  {selectedAppointment.businessAddress}
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              {isFuture(selectedAppointment) ? (
                <>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => handleCancelRequest(selectedAppointment)}
                    disabled={modalBusy}
                  >
                    {modalBusy ? "שולח בקשה..." : "בקשת ביטול תור"}
                  </button>
                  <button
                    className={styles.secondaryBtn}
                    onClick={() => handleReschedule(selectedAppointment)}
                    disabled={modalBusy}
                  >
                    שינוי תור
                  </button>
                </>
              ) : (
                <button
                  className={styles.secondaryBtn}
                  onClick={() => setSelectedAppointment(null)}
                >
                  סגור
                </button>
              )}
              {modalMsg && <div className={styles.modalMsg}>{modalMsg}</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
