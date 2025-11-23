import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./NewBusinessDashboard.module.css";
import axiosInstance from "../../api/axiosInstance";

// ייבוא קומפוננטות שמציגות חלקים שונים בדשבורד
import KpiCards from "./KpiCards";
import PerformanceChart from "./PerformanceChart";
import PopularServices from "./PopularServices";

/**
 * דשבורד חדש לבעל עסק
 * מציג נתונים על העסק: הכנסות, תורים, סטטיסטיקות, שירותים מובילים ועוד
 */
export default function NewBusinessDashboard({ user }) {
  // נתוני הדשבורד מהשרת (כולל עסק, תורים, אנליטיקות)
  const [dashboardData, setDashboardData] = useState(null);

  // מצב טעינה ושגיאה
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // מצב שמציין שהעסק עדיין לא מאושר
  const [notApproved, setNotApproved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const navigate = useNavigate();

  /**
   * פונקציה לטעינת נתוני הדשבורד מהשרת
   * משתמשת ב-businessId של המשתמש
   */
  const fetchDashboardData = useCallback(async () => {
    // אם אין מזהה עסק – לא עושים קריאה
    if (!user?.businessId && !user?.id) {
      setLoading(false);
      return;
    }

    const businessId = user?.businessId || user?.id;

    try {
      setLoading(true);
      setNotApproved(false);
      setError(null);

      // קריאה לשרת לקבלת נתוני הדשבורד
      const response = await axiosInstance.get(
        `/businesses/${businessId}/dashboard`
      );

      // שמירת הנתונים שהתקבלו
      setDashboardData(response.data);
      setError(null);
      setNotApproved(false);
    } catch (error) {
      console.error("Error fetching business dashboard data:", error);

      // אם השרת מחזיר 403 → העסק עדיין לא מאושר
      if (error.response?.status === 403) {
        setNotApproved(true);

        // הודעה מהשרת או הודעת ברירת מחדל
        setStatusMessage(
          error.response?.data?.error || "העסק שלך עדיין ממתין לאישור אדמין."
        );

        setDashboardData(null);
        setError(null);
      } else {
        // שגיאה כללית בטעינת נתונים
        setError("שגיאה בטעינת נתוני הדשבורד");
      }
    } finally {
      setLoading(false);
    }
  }, [user?.businessId, user?.id]);

  /**
   * טעינה ראשונית של נתונים כשהדשבורד נפתח
   */
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * פעולה על תור ממתין: אישור או דחייה
   * שולחת סטטוס חדש לשרת ואז מרעננת את הדשבורד
   */
  const handleAppointmentAction = async (appointmentId, action) => {
    try {
      const statusMap = {
        approve: "confirmed",
        reject: "cancelled_by_business",
      };

      const status = statusMap[action];
      if (!status) return;

      // עדכון סטטוס התור בשרת
      await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status,
      });

      // רענון נתוני הדשבורד אחרי פעולה
      fetchDashboardData();
    } catch (error) {
      console.error(`Error ${action}ing appointment:`, error);
      setError("שגיאה בעדכון התור");
    }
  };

  /**
   * פורמט תאריך לתצוגה נוחה בעברית
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /**
   * תרגום סטטוס תור מאנגלית לעברית
   */
  const translateStatus = (status) => {
    const statusMap = {
      pending: "ממתין",
      confirmed: "מאושר",
      completed: "הושלם",
      cancelled_by_user: 'בוטל ע"י לקוח',
      cancelled_by_business: 'בוטל ע"י בית עסק',
      not_arrived: "לא הגיע",
    };
    return statusMap[status] || status;
  };

  /**
   * מצב טעינה – מציג ספינר
   */
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתונים...</p>
      </div>
    );
  }

  /**
   * אם העסק עדיין לא מאושר – מציג מסך מיוחד לבעל העסק
   */
  if (notApproved) {
    const ownerName = user?.firstName || user?.first_name || "";

    return (
      <div className={styles.errorContainer}>
        <div className={styles.card}>
          <h1 className={styles.cardTitle}>
            {ownerName ? `שלום, ${ownerName}` : "שלום בעל עסק"}
          </h1>
          <h2 className={styles.cardTitle}>העסק שלך ממתין לאישור</h2>
          <p className={styles.emptyText}>
            {statusMessage || "מנהל המערכת עדיין לא אישר את בית העסק שלך."}
          </p>
          <p className={styles.emptyText}>
            לאחר שהאדמין יאשר את העסק, תוכלי להתחבר שוב ולראות כאן את הדשבורד,
            התורים והדוחות.
          </p>
          <button className={styles.btn} onClick={() => navigate("/")}>
            חזרה לדף הבית
          </button>
        </div>
      </div>
    );
  }

  /**
   * אם יש שגיאה כללית
   */
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
      </div>
    );
  }

  /**
   * אם אין נתונים כלל מהשרת
   */
  if (!dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>לא נמצאו נתונים</p>
      </div>
    );
  }

  /**
   * תצוגת הדשבורד הראשי לבעל העסק
   */
  return (
    <div className={styles.dashboard}>
      {/* כותרת הדשבורד + כפתורי ניווט */}
      <header className={styles.header}>
        <h1>שלום, {dashboardData.business.name}</h1>

        <div className={styles.headerActions}>
          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => navigate("/reports")}
          >
            📊 דוחות
          </button>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => navigate("/appointments/history")}
          >
            📋 היסטוריית תורים
          </button>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => navigate("/calendar")}
          >
            📅 הצג לוח שנה
          </button>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() => navigate("/services")}
          >
            🔧 ניהול שירותים
          </button>

          <button
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={() =>
              navigate(`/business/${user?.businessId || user?.id}/edit`)
            }
          >
            ✏️ עריכת פרופיל
          </button>
        </div>
      </header>

      {/* אזור KPI – כרטיסי מדדים */}
      <section className={styles.kpis}>
        <KpiCards analytics={dashboardData.analytics} />
      </section>

      <main className={styles.mainContent}>
        {/* צד שמאל – תורים ממתינים + תורים להיום */}
        <div className={styles.leftColumn}>
          {/* תורים שממתינים לאישור */}
          {dashboardData.pending_appointments?.length > 0 && (
            <div className={`${styles.card} ${styles.pendingCard}`}>
              <h3 className={styles.cardTitle}>
                בקשות ממתינות ({dashboardData.pending_appointments.length})
              </h3>

              <ul className={styles.appointmentsList}>
                {dashboardData.pending_appointments.map((apt) => (
                  <li
                    key={apt.appointment_id}
                    className={styles.appointmentItem}
                  >
                    <div className={styles.appointmentDetails}>
                      <span className={styles.appointmentTime}>
                        {formatDate(apt.appointment_datetime)}
                      </span>
                      <span className={styles.customerName}>
                        {apt.first_name} {apt.last_name}
                      </span>
                      <span className={styles.serviceName}>
                        {apt.service_name}
                      </span>
                    </div>

                    {/* כפתורי אישור/דחייה */}
                    <div className={styles.appointmentActions}>
                      <button
                        className={styles.approveButton}
                        onClick={() =>
                          handleAppointmentAction(apt.appointment_id, "approve")
                        }
                      >
                        ✅ אשר
                      </button>

                      <button
                        className={styles.rejectButton}
                        onClick={() =>
                          handleAppointmentAction(apt.appointment_id, "reject")
                        }
                      >
                        ❌ דחה
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* תורים להיום / תורים קרובים */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>
              {dashboardData.debug_info?.using_upcoming_fallback
                ? "תורים קרובים"
                : "תורים להיום"}
            </h3>

            {dashboardData.today_appointments?.length > 0 ? (
              <ul className={styles.appointmentsList}>
                {dashboardData.today_appointments.map((apt) => (
                  <li
                    key={apt.appointment_id}
                    className={styles.appointmentItem}
                  >
                    <div className={styles.appointmentDetails}>
                      <span className={styles.appointmentTime}>
                        {new Date(apt.appointment_datetime).toLocaleDateString(
                          "he-IL",
                          {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>

                      <span className={styles.customerName}>
                        {apt.first_name} {apt.last_name}
                      </span>

                      <span className={styles.serviceName}>
                        {apt.service_name}
                      </span>

                      <span className={styles.price}>₪{apt.price}</span>
                    </div>

                    {/* סטטוס מוצג בצבע קבוע */}
                    <span
                      className={`${styles.status} ${styles.statusConfirmed}`}
                    >
                      {translateStatus(apt.status)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={styles.emptyText}>
                {dashboardData.debug_info?.using_upcoming_fallback
                  ? "אין תורים קרובים."
                  : "אין תורים להיום."}
              </p>
            )}
          </div>
        </div>

        {/* צד ימין – גרפים ושירותים פופולריים */}
        <div className={styles.rightColumn}>
          <PerformanceChart
            data={dashboardData.analytics.dailyRevenueLast7Days}
          />
          <PopularServices
            services={dashboardData.analytics.servicePerformance}
          />
        </div>
      </main>
    </div>
  );
}
