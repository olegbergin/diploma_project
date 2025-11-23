/**
 * Admin Appointments Management Component
 * Allows administrators to view and manage system appointments
 *
 * קומפוננטה לניהול תורים עבור אדמין:
 * מציגה את כל התורים במערכת ומאפשרת חיפוש, סינון, ושינוי סטטוס.
 *
 * @component
 * @returns {JSX.Element} Appointments management interface
 */

import React, { useState, useEffect } from "react";
import styles from "./AdminAppointments.module.css";

function AdminAppointments() {
  // ---------------------------
  // STATE - משתני מצב של הקומפוננטה
  // ---------------------------

  // רשימת התורים שנציג בטבלה
  const [appointments, setAppointments] = useState([]);

  // מצב טעינה (spinner) עד שהנתונים נטענים
  const [loading, setLoading] = useState(true);

  // טקסט החיפוש שהאדמין כותב בשדה החיפוש
  const [searchTerm, setSearchTerm] = useState("");

  // פילטר סטטוס (all / pending / confirmed / completed / cancelled)
  const [filterStatus, setFilterStatus] = useState("all");

  // פילטר לפי תאריך ספציפי (YYYY-MM-DD)
  const [filterDate, setFilterDate] = useState("");

  // ---------------------------
  // useEffect - רץ פעם אחת כשהקומפוננטה נטענת
  // כאן נטען את התורים מהשרת (כרגע MOCK)
  // ---------------------------
  useEffect(() => {
    // TODO: Replace with actual API call (axiosInstance.get למשל)
    const loadAppointments = async () => {
      try {
        // כרגע יש נתונים "מזויפים" לצורך בדיקה/עיצוב UI
        setTimeout(() => {
          setAppointments([
            {
              id: 1,
              customerName: "אברהם כהן",
              customerEmail: "abraham@email.com",
              businessName: "מאפיית איילה",
              serviceName: "עוגת יום הולדת",
              date: "2024-01-25",
              time: "10:00",
              duration: 60,
              status: "confirmed",
              price: 250,
              notes: "עוגה בטעם שוקולד עם כיתוב מיוחד",
            },
            {
              id: 2,
              customerName: "שרה לוי",
              customerEmail: "sarah@email.com",
              businessName: "סלון יופי רחל",
              serviceName: "תספורת ועיצוב",
              date: "2024-01-25",
              time: "14:30",
              duration: 90,
              status: "pending",
              price: 180,
              notes: "לקוחה חדשה, להכין ייעוץ צבעים",
            },
            {
              id: 3,
              customerName: "דוד שמעון",
              customerEmail: "david@email.com",
              businessName: "מוסך דוד",
              serviceName: "החלפת שמן",
              date: "2024-01-24",
              time: "09:00",
              duration: 30,
              status: "completed",
              price: 120,
              notes: "רכב טויוטה קורולה 2018",
            },
            {
              id: 4,
              customerName: "רחל אברמוביץ",
              customerEmail: "rachel@email.com",
              businessName: 'מרפאת שיניים ד"ר כהן',
              serviceName: "בדיקה כללית",
              date: "2024-01-26",
              time: "16:00",
              duration: 45,
              status: "cancelled",
              price: 200,
              notes: "בדיקה שנתית + ניקוי אבנית",
            },
            {
              id: 5,
              customerName: "משה גרין",
              customerEmail: "moshe@email.com",
              businessName: "מאפיית איילה",
              serviceName: "לחמניות לשבת",
              date: "2024-01-26",
              time: "07:00",
              duration: 15,
              status: "confirmed",
              price: 35,
              notes: "12 לחמניות רגילות",
            },
          ]);

          // סיום טעינה -> spinner נעלם
          setLoading(false);
        }, 1000);
      } catch (error) {
        // טיפול בשגיאה במקרה שהטעינה נכשלה
        console.error("Failed to load appointments:", error);
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  // ---------------------------
  // FILTERING - סינון התורים לפי חיפוש/סטטוס/תאריך
  // ---------------------------
  const filteredAppointments = appointments.filter((appointment) => {
    // בדיקה אם החיפוש מתאים לשם לקוח / עסק / שירות
    const matchesSearch =
      appointment.customerName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.businessName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    // בדיקה אם הסטטוס מתאים לפילטר שנבחר
    const matchesStatus =
      filterStatus === "all" || appointment.status === filterStatus;

    // בדיקה אם התאריך מתאים (אם נבחר תאריך)
    const matchesDate = !filterDate || appointment.date === filterDate;

    // רק אם כל התנאים נכונים -> התור נשאר ברשימה
    return matchesSearch && matchesStatus && matchesDate;
  });

  // ---------------------------
  // שינוי סטטוס תור (כרגע רק ב-UI)
  // בעתיד נצטרך API שמעדכן ב-DB
  // ---------------------------
  const handleStatusChange = (appointmentId, newStatus) => {
    // עדכון ה-state כדי שהטבלה תשתנה מיד
    setAppointments((prevAppointments) =>
      prevAppointments.map((appointment) =>
        appointment.id === appointmentId
          ? { ...appointment, status: newStatus }
          : appointment
      )
    );

    // TODO: Add API call to update appointment status
    // דוגמה עתידית:
    // await axiosInstance.put(`/admin/appointments/${appointmentId}/status`, { status: newStatus })
  };

  // ---------------------------
  // המרה של סטטוס לקצת טקסט בעברית
  // ---------------------------
  const getStatusText = (status) => {
    const statusMap = {
      pending: "ממתין",
      confirmed: "מאושר",
      completed: "הושלם",
      cancelled: "בוטל",
    };
    return statusMap[status] || status;
  };

  // ---------------------------
  // צבעים שונים לכל סטטוס
  // משמש לתגית הסטטוס בטבלה
  // ---------------------------
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ff9800",
      confirmed: "#4caf50",
      completed: "#2196f3",
      cancelled: "#f44336",
    };
    return colorMap[status] || "#9e9e9e";
  };

  // ---------------------------
  // פורמט שעה (כרגע מחזיר כמו שהוא)
  // אם תרצי אפשר לשפר לפורמט 24/12 וכו'
  // ---------------------------
  const formatTime = (time) => {
    return time;
  };

  // ---------------------------
  // פורמט תאריך להצגה בעברית
  // ---------------------------
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("he-IL");
  };

  // ---------------------------
  // אם עדיין טוען נתונים -> מציג Spinner
  // ---------------------------
  if (loading) {
    return (
      <div className={styles.appointmentsContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען תורים...</p>
        </div>
      </div>
    );
  }

  // ---------------------------
  // RENDER - תצוגת מסך ניהול התורים
  // ---------------------------
  return (
    <div className={styles.appointmentsContainer}>
      <h2 className={styles.sectionTitle}>ניהול תורים</h2>

      {/* אזור שליטה: חיפוש + פילטר סטטוס + פילטר תאריך */}
      <div className={styles.controls}>
        {/* שדה חיפוש */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש תורים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* בחירת סטטוס לסינון */}
        <div className={styles.filterContainer}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתין</option>
            <option value="confirmed">מאושר</option>
            <option value="completed">הושלם</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>

        {/* בחירת תאריך לסינון */}
        <div className={styles.dateContainer}>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      {/* טבלת תורים */}
      <div className={styles.appointmentsTable}>
        {/* כותרת טבלה */}
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>לקוח</div>
          <div className={styles.headerCell}>עסק</div>
          <div className={styles.headerCell}>שירות</div>
          <div className={styles.headerCell}>תאריך ושעה</div>
          <div className={styles.headerCell}>מחיר</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>

        {/* שורות טבלה - לפי התורים המסוננים */}
        {filteredAppointments.map((appointment) => (
          <div key={appointment.id} className={styles.tableRow}>
            {/* לקוח */}
            <div className={styles.tableCell}>
              <div className={styles.customerInfo}>
                <div className={styles.customerName}>
                  {appointment.customerName}
                </div>
                <div className={styles.customerEmail}>
                  {appointment.customerEmail}
                </div>
              </div>
            </div>

            {/* עסק */}
            <div className={styles.tableCell}>
              <div className={styles.businessName}>
                {appointment.businessName}
              </div>
            </div>

            {/* שירות */}
            <div className={styles.tableCell}>
              <div className={styles.serviceInfo}>
                <div className={styles.serviceName}>
                  {appointment.serviceName}
                </div>
                <div className={styles.serviceDuration}>
                  {appointment.duration} דקות
                </div>
              </div>
            </div>

            {/* תאריך ושעה */}
            <div className={styles.tableCell}>
              <div className={styles.dateTimeInfo}>
                <div className={styles.appointmentDate}>
                  {formatDate(appointment.date)}
                </div>
                <div className={styles.appointmentTime}>
                  {formatTime(appointment.time)}
                </div>
              </div>
            </div>

            {/* מחיר */}
            <div className={styles.tableCell}>
              <div className={styles.price}>₪{appointment.price}</div>
            </div>

            {/* תגית סטטוס עם צבע */}
            <div className={styles.tableCell}>
              <span
                className={styles.statusTag}
                style={{
                  backgroundColor: getStatusColor(appointment.status) + "20",
                  color: getStatusColor(appointment.status),
                }}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>

            {/* פעולות */}
            <div className={styles.tableCell}>
              <div className={styles.actions}>
                {/* אם התור ממתין -> אפשר לאשר/לבטל */}
                {appointment.status === "pending" && (
                  <>
                    <button
                      className={styles.confirmBtn}
                      onClick={() =>
                        handleStatusChange(appointment.id, "confirmed")
                      }
                    >
                      אשר
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() =>
                        handleStatusChange(appointment.id, "cancelled")
                      }
                    >
                      בטל
                    </button>
                  </>
                )}

                {/* אם התור מאושר -> אפשר לסמן כהושלם */}
                {appointment.status === "confirmed" && (
                  <button
                    className={styles.completeBtn}
                    onClick={() =>
                      handleStatusChange(appointment.id, "completed")
                    }
                  >
                    סמן כהושלם
                  </button>
                )}

                {/* כפתור פרטים (כרגע לא עושה כלום) */}
                <button className={styles.viewBtn}>פרטים</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* אם אחרי סינון אין תוצאות -> הודעה */}
      {filteredAppointments.length === 0 && (
        <div className={styles.noResults}>
          <p>לא נמצאו תורים התואמים לחיפוש</p>
        </div>
      )}
    </div>
  );
}

export default AdminAppointments;
