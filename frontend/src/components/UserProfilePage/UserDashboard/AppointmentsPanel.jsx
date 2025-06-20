// ---------------------------------------------------------
// קומפוננטת 'התורים שלי' – מציגה תורים עתידיים, לשעבר, שבוטלו
// AppointmentsPanel – Displays user's upcoming, past, and canceled appointments
// ---------------------------------------------------------

import React, { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./AppointmentsPanel.module.css";

// טאבים לתצוגה
const TABS = [
  { key: "upcoming", label: "תורים עתידיים" },
  { key: "past", label: "תורים שהיו" },
  { key: "canceled", label: "תורים שבוטלו" },
];

export default function AppointmentsPanel({ user }) {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("upcoming");
  const [cancelingId, setCancelingId] = useState(null);

  // שליפת תורים מהשרת לפי סוג
  const fetchAppointments = () => {
    setLoading(true);
    axiosInstance
      .get(`/appointments/user/${user.user_id}?type=${type}`)
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  // רענון כאשר הטאב/משתמש משתנה
  useEffect(() => {
    fetchAppointments();
    // eslint-disable-next-line
  }, [user.user_id, type]);

  // ביטול תור עתידי
  const handleCancel = (id) => {
    if (!window.confirm("האם לבטל את התור?")) return;
    setCancelingId(id);
    axiosInstance
      .post(`/appointments/${id}/cancel`)
      .then(() => fetchAppointments())
      .catch(() => alert("שגיאה בביטול התור."))
      .finally(() => setCancelingId(null));
  };

  return (
    <div className={styles.panelContainer}>
      {/* טאבים לקטגוריות תורים */}
      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`${styles.tabBtn} ${
              type === tab.key ? styles.selected : ""
            }`}
            onClick={() => setType(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* תוכן */}
      {loading ? (
        <div className={styles.statusMsg}>טוען תורים...</div>
      ) : appointments.length === 0 ? (
        <div className={styles.statusMsg}>
          אין {TABS.find((t) => t.key === type)?.label.toLowerCase()}.
        </div>
      ) : (
        <ul className={styles.appointmentList}>
          {appointments.map((app) => (
            <li key={app.appointment_id} className={styles.appointmentItem}>
              <div className={styles.appointmentDetails}>
                <b>{app.business_name}</b> | {app.service_name} |{" "}
                {new Date(app.appointment_datetime).toLocaleString("he-IL")}
              </div>
              {type === "upcoming" && (
                <button
                  onClick={() => handleCancel(app.appointment_id)}
                  disabled={cancelingId === app.appointment_id}
                  className={styles.cancelBtn}
                >
                  {cancelingId === app.appointment_id ? "מבטל..." : "בטל תור"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
