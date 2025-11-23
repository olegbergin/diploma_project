import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AppointmentHistory.module.css";

// קומפוננטת היסטוריית תורים לבית עסק
// מציגה תורים עתידיים ותורים קודמים, כולל חיפוש, סינון ופאג'ינציה
export default function AppointmentHistory({ user }) {
  // ---------------------------------------------------
  // משתני מצב (State)
  // ---------------------------------------------------

  // רשימת כל התורים של בית העסק
  const [appointments, setAppointments] = useState([]);

  // רשימת השירותים של בית העסק (לצורך פילטר שירות)
  const [services, setServices] = useState([]);

  // מצב טעינה להצגת ספינר בזמן שליפת נתונים
  const [loading, setLoading] = useState(true);

  // שגיאה כללית אם הטעינה מהשרת נכשלת
  const [error, setError] = useState(null);

  // ניווט בין דפים (חזרה לדשבורד וכו')
  const navigate = useNavigate();

  // Tab state - 'future' or 'past'
  // מצב הטאב הנבחר: תורים עתידיים או תורים קודמים
  const [activeTab, setActiveTab] = useState("future");

  // Search filters
  // ---------------------------------------------------
  // פילטרים לחיפוש וסינון
  // ---------------------------------------------------

  // חיפוש חופשי לפי שם לקוח / מספר תור / מחיר
  const [searchTerm, setSearchTerm] = useState("");

  // פילטר תאריך (טקסט dd/mm/yyyy)
  const [dateFilter, setDateFilter] = useState("");

  // פילטר סטטוס (all / pending / confirmed / ...)
  const [statusFilter, setStatusFilter] = useState("all");

  // פילטר שירות (all או שם שירות ספציפי)
  const [serviceFilter, setServiceFilter] = useState("all");

  // Pagination
  // ---------------------------------------------------
  // פאג'ינציה
  // ---------------------------------------------------

  // העמוד הנוכחי בתצוגה
  const [currentPage, setCurrentPage] = useState(1);

  // כמה תורים להציג בעמוד
  const itemsPerPage = 15;

  // ---------------------------------------------------
  // אפקט שרץ כשמשתנה המשתמש המחובר
  // טוען את כל התורים ואת השירותים של העסק
  // ---------------------------------------------------
  useEffect(() => {
    fetchAllAppointments();
    fetchBusinessServices();
  }, [user]);

  // ---------------------------------------------------
  // שליפת כל התורים של העסק מהשרת
  // ---------------------------------------------------
  const fetchAllAppointments = async () => {
    // אם אין מזהה עסק/משתמש, לא שולחים בקשה
    if (!user?.businessId && !user?.id) return;
    const businessId = user?.businessId || user?.id;

    try {
      setLoading(true);

      // קריאה לשרת לקבלת תורים של העסק
      const response = await axiosInstance.get(
        `/businesses/${businessId}/appointments`
      );
      setAppointments(response.data || []);
      setError(null);
    } catch (error) {
      // במקרה של כשל - מציגים שגיאה
      setError("שגיאה בטעינת היסטוריית תורים");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // שליפת רשימת השירותים של העסק מהשרת
  // משמשת לפילטר שירות
  // ---------------------------------------------------
  const fetchBusinessServices = async () => {
    if (!user?.businessId && !user?.id) return;
    const businessId = user?.businessId || user?.id;

    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/services`
      );
      setServices(response.data || []);
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  };

  // ---------------------------------------------------
  // תרגום סטטוס מהשרת לטקסט בעברית לתצוגה
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // פורמט תאריך לתצוגה ברשימה (כולל שעה)
  // ---------------------------------------------------
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ---------------------------------------------------
  // פורמט תאריך לצורך התאמה לפילטר תאריך
  // (מוציא תאריך בצורה dd/mm/yyyy)
  // ---------------------------------------------------
  const formatDateInput = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Split appointments into past and future
  // ---------------------------------------------------
  // חלוקת תורים לעתידיים וקודמים לפי הזמן הנוכחי
  // וגם מיון שלהם:
  // - קודמים: מהחדש לישן
  // - עתידיים: מהקרוב לרחוק
  // ---------------------------------------------------
  const { pastAppointments, futureAppointments } = useMemo(() => {
    const now = new Date();
    const past = [];
    const future = [];

    appointments.forEach((apt) => {
      const aptDate = new Date(apt.appointment_datetime);
      if (aptDate < now) {
        past.push(apt);
      } else {
        future.push(apt);
      }
    });

    // Sort: past descending (newest first), future ascending (nearest first)
    past.sort(
      (a, b) =>
        new Date(b.appointment_datetime) - new Date(a.appointment_datetime)
    );
    future.sort(
      (a, b) =>
        new Date(a.appointment_datetime) - new Date(b.appointment_datetime)
    );

    return { pastAppointments: past, futureAppointments: future };
  }, [appointments]);

  // ---------------------------------------------------
  // בחירת רשימת התורים לפי הטאב הפעיל
  // ---------------------------------------------------
  const currentTabAppointments =
    activeTab === "past" ? pastAppointments : futureAppointments;

  // Apply filters to current tab
  // ---------------------------------------------------
  // סינון התורים בטאב הנוכחי לפי כל הפילטרים:
  // חיפוש, תאריך, סטטוס, ושירות
  // ---------------------------------------------------
  const filteredAppointments = useMemo(() => {
    return currentTabAppointments.filter((apt) => {
      // Search by name, appointment number, or price
      // חיפוש לפי שם לקוח / מספר תור / מחיר
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        `${apt.first_name} ${apt.last_name}`
          .toLowerCase()
          .includes(searchLower) ||
        apt.appointment_id?.toString().includes(searchTerm) ||
        apt.price?.toString().includes(searchTerm);

      // Date filter
      // סינון לפי תאריך (אם הוזן פילטר)
      const matchesDate =
        !dateFilter ||
        formatDateInput(apt.appointment_datetime).includes(dateFilter);

      // Status filter
      // סינון לפי סטטוס
      const matchesStatus =
        statusFilter === "all" || apt.status === statusFilter;

      // Service filter
      // סינון לפי שם שירות
      const matchesService =
        serviceFilter === "all" || apt.service_name === serviceFilter;

      return matchesSearch && matchesDate && matchesStatus && matchesService;
    });
  }, [
    currentTabAppointments,
    searchTerm,
    dateFilter,
    statusFilter,
    serviceFilter,
  ]);

  // Pagination
  // ---------------------------------------------------
  // חישוב עמודים ופיצול הרשימה לעמוד הנוכחי
  // ---------------------------------------------------
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAppointments.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAppointments, currentPage]);

  // Reset to page 1 when filters or tab changes
  // ---------------------------------------------------
  // איפוס לעמוד ראשון בכל שינוי פילטר/טאב
  // ---------------------------------------------------
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter, statusFilter, serviceFilter, activeTab]);

  // ---------------------------------------------------
  // ניקוי כל הפילטרים
  // ---------------------------------------------------
  const handleClearFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setStatusFilter("all");
    setServiceFilter("all");
    setCurrentPage(1);
  };

  // ---------------------------------------------------
  // התאמת מחלקת עיצוב לפי סטטוס
  // (צבעים שונים לסטטוסים שונים)
  // ---------------------------------------------------
  const getStatusColor = (status) => {
    const colors = {
      completed: styles.statusCompleted,
      confirmed: styles.statusConfirmed,
      pending: styles.statusPending,
      cancelled_by_user: styles.statusCancelled,
      cancelled_by_business: styles.statusCancelled,
      not_arrived: styles.statusCancelled,
    };
    return colors[status] || styles.statusDefault;
  };

  // ---------------------------------------------------
  // תצוגת טעינה
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען היסטוריית תורים...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // תצוגת שגיאה עם אפשרות לנסות שוב
  // ---------------------------------------------------
  if (error) {
    return (
      <div className={styles.dashboard}>
        <div className={styles.errorContainer}>
          <p>{error}</p>
          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={fetchAllAppointments}
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // תצוגה ראשית של ההיסטוריה
  // ---------------------------------------------------
  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>היסטוריית תורים</h1>

        {/* כפתור חזרה לדשבורד העסק */}
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() =>
            navigate(`/business/${user?.businessId || user?.id}/dashboard`)
          }
        >
          חזרה לדשבורד
        </button>
      </header>

      {/* Tabs */}
      {/* טאבים מעבר בין תורים עתידיים לקודמים, כולל ספירת תורים */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "future" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("future")}
        >
          תורים עתידיים ({futureAppointments.length})
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "past" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("past")}
        >
          תורים קודמים ({pastAppointments.length})
        </button>
      </div>

      {/* Filters Card */}
      {/* כרטיס סינון וחיפוש */}
      <div className={styles.card}>
        <div className={styles.filtersGrid}>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="חיפוש לפי שם, מספר תור או מחיר..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <input
            type="text"
            className={styles.dateInput}
            placeholder="תאריך (dd/mm/yyyy)"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          {/* פילטר שירות לפי רשימת השירותים */}
          <select
            className={styles.serviceSelect}
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
          >
            <option value="all">כל השירותים</option>
            {services.map((service) => (
              <option key={service.service_id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>

          {/* פילטר סטטוס */}
          <select
            className={styles.statusSelect}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתין</option>
            <option value="confirmed">מאושר</option>
            <option value="completed">הושלם</option>
            <option value="cancelled_by_user">בוטל ע"י לקוח</option>
            <option value="cancelled_by_business">בוטל ע"י בית עסק</option>
            <option value="not_arrived">לא הגיע</option>
          </select>

          {/* כפתור ניקוי פילטרים */}
          <button
            className={styles.clearButton}
            onClick={handleClearFilters}
            disabled={
              !searchTerm &&
              !dateFilter &&
              statusFilter === "all" &&
              serviceFilter === "all"
            }
          >
            נקה
          </button>
        </div>
      </div>

      {/* Appointments List */}
      {/* רשימת התורים לאחר סינון ופאג'ינציה */}
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>
          {activeTab === "future" ? "תורים עתידיים" : "תורים קודמים"}
          <span className={styles.resultCount}>
            ({filteredAppointments.length} תוצאות)
          </span>
        </h3>

        {/* אם אין תורים להצגה */}
        {paginatedAppointments.length === 0 ? (
          <div className={styles.emptyText}>
            {filteredAppointments.length === 0 &&
            (searchTerm || dateFilter || statusFilter !== "all")
              ? "לא נמצאו תורים התואמים לסינון"
              : `אין ${
                  activeTab === "future" ? "תורים עתידיים" : "תורים קודמים"
                }`}
          </div>
        ) : (
          <>
            <ul className={styles.appointmentsList}>
              {paginatedAppointments.map((apt) => (
                <li key={apt.appointment_id} className={styles.appointmentItem}>
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
                    <span className={styles.price}>₪{apt.price}</span>
                    <span
                      className={`${styles.status} ${getStatusColor(
                        apt.status
                      )}`}
                    >
                      {translateStatus(apt.status)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>

            {/* פאג'ינציה */}
            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                >
                  הקודם
                </button>

                <span className={styles.pageInfo}>
                  עמוד {currentPage} מתוך {totalPages}
                </span>

                <button
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  הבא
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
