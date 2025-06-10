import { useState } from "react";
import styles from "./ExistingAppointments.module.css";

export default function ExistingAppointments({
  appointments,
  onUpdate,
  onCancel,
}) {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [searchTerm, setSearchTerm] = useState("");
  const [editing, setEditing] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const now = new Date();

  const categorized = appointments.map((a) => {
    const dateTime = new Date(a.appointment_datetime);
    const status =
      a.status === "cancelled"
        ? "cancelled"
        : dateTime < now
        ? "past"
        : "upcoming";
    return { ...a, dateTime, status };
  });

  const filtered = categorized
    .filter((a) => a.status === activeTab)
    .filter((a) => a.notes?.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.dateTime - b.dateTime);

  const formatForMySQL = (dateStr, timeStr) => {
    return `${dateStr} ${timeStr}:00`; // YYYY-MM-DD HH:MM:SS
  };

  const handleSave = () => {
    if (!newDate || !newTime) {
      alert("נא למלא תאריך ושעה");
      return;
    }

    const updated = {
      ...editing,
      appointment_datetime: formatForMySQL(newDate, newTime),
    };

    onUpdate?.(updated);
    setEditing(null);
  };

  return (
    <div className={styles.wrapper}>
      {/* טאבים */}
      <div className={styles.tabs}>
        <button
          onClick={() => setActiveTab("upcoming")}
          className={activeTab === "upcoming" ? styles.active : ""}
        >
          תורים עתידיים
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={activeTab === "past" ? styles.active : ""}
        >
          תורים שעברו
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={activeTab === "cancelled" ? styles.active : ""}
        >
          תורים שבוטלו
        </button>
      </div>

      {/* חיפוש */}
      <input
        type="text"
        placeholder="חיפוש לפי שם או הערה"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={styles.search}
      />

      {/* רשימת תורים */}
      <ul className={styles.list}>
        {filtered.map((a) => (
          <li key={a.appointment_id}>
            <div>
              <strong>{a.notes}</strong> <br />
              {a.dateTime.toLocaleString()}
            </div>
            {activeTab === "upcoming" && (
              <button
                onClick={() => {
                  setEditing(a);
                  const iso = a.dateTime.toISOString();
                  setNewDate(iso.slice(0, 10)); // YYYY-MM-DD
                  setNewTime(iso.slice(11, 16)); // HH:MM
                }}
              >
                ערוך
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* פופ-אפ עריכה */}
      {editing && (
        <div className={styles.popup}>
          <h3>עריכת תור</h3>
          <p>{editing.notes}</p>

          <label>
            תאריך:
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </label>

          <label>
            שעה:
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
            />
          </label>

          <div className={styles.popupButtons}>
            <button onClick={handleSave}>שמור</button>
            <button onClick={() => onCancel?.(editing)}>בטל תור</button>
            <button onClick={() => setEditing(null)}>סגור</button>
          </div>
        </div>
      )}
    </div>
  );
}
