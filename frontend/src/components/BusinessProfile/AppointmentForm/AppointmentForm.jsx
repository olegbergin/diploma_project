import { useState } from "react";
import styles from "./AppointmentForm.module.css";

export default function AppointmentForm({
  date,
  takenSlots = [],
  services = [],
  onSubmit,
  onCancel,
}) {
  const [time, setTime] = useState("");
  const [service, setService] = useState(""); // חדש!
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit({ date, time, name, phone, email, service });
    setLoading(false);
  };

  // שעות אפשריות (9:00 עד 19:00)
  const hours = [];
  for (let h = 9; h <= 19; h++) {
    const hour = h.toString().padStart(2, "0") + ":00";
    hours.push(hour);
  }
  const freeHours = hours.filter((h) => !takenSlots.includes(h));

  return (
    <div className={styles.formBackdrop}>
      <form className={styles.form} onSubmit={handleSubmit} dir="rtl">
        <h3 className={styles.formTitle}>קביעת תור ל-{date}</h3>
        {/* בחירת שירות */}
        {services.length > 0 && (
          <label>
            שירות:
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              required
              className={styles.select}
            >
              <option value="">בחר שירות</option>
              {services.map((srv, idx) => (
                <option key={idx} value={srv.name}>
                  {srv.name} {srv.duration ? `(${srv.duration} דקות)` : ""}
                </option>
              ))}
            </select>
          </label>
        )}
        <label>
          שעה:
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
            className={styles.select}
          >
            <option value="">בחר שעה</option>
            {freeHours.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
        </label>
        <label>
          שם:
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label>
          טלפון:
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <label>
          אימייל:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />
        </label>
        <div className={styles.buttonRow}>
          <button type="button" onClick={onCancel} className={styles.cancelBtn}>
            ביטול
          </button>
          <button type="submit" disabled={loading} className={styles.saveBtn}>
            שמור
          </button>
        </div>
      </form>
    </div>
  );
}
