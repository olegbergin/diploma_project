import { useState } from "react";
import styles from "./BookingModal.module.css";

/**
 * @param dateIso      "YYYY-MM-DD" (היום הנבחר)
 * @param takenSlots   ["HH:MM", ...]  – שעות שכבר תפוסות
 * @param services     [{name, duration}] – רשימת שירותים (מהעסק)
 * @param onSubmit     function({timeStr, serviceName}) – קבלת הערכים להזמנה
 * @param onClose      () => void
 */
export default function BookingModal({
  dateIso,
  takenSlots,
  services = [],
  onSubmit,
  onClose,
}) {
  // כל רבע שעה בין 08:00-20:00
  const all = Array.from({ length: 49 }, (_, i) => {
    const hour = 8 + Math.floor(i / 4);
    const min = (i % 4) * 15;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
  });

  const [picked, setPicked] = useState("");
  const [serviceIdx, setServiceIdx] = useState(services.length ? 0 : -1);

  const handleSave = () => {
    if (!picked || serviceIdx === -1) return;
    onSubmit({
      time: picked,
      service: services[serviceIdx],
    });
    onClose();
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.card}>
        <h3>{new Date(dateIso).toLocaleDateString("he-IL")}</h3>

        {/* בחירת סוג שירות */}
        <div className={styles.selectRow}>
          <label htmlFor="service-select">בחר שירות:</label>
          <select
            id="service-select"
            value={serviceIdx}
            onChange={(e) => setServiceIdx(Number(e.target.value))}
            className={styles.select}
          >
            {services.map((s, i) => (
              <option key={i} value={i}>
                {s.name} ({s.duration} דקות)
              </option>
            ))}
          </select>
        </div>

        {/* בחירת שעת תור */}
        <div className={styles.grid}>
          {all.map((t) => {
            const busy = takenSlots.includes(t);
            return (
              <button
                key={t}
                disabled={busy}
                className={`${styles.slot} ${
                  picked === t ? styles.selected : ""
                } ${busy ? styles.busy : ""}`}
                onClick={() => setPicked(t)}
              >
                {t}
              </button>
            );
          })}
        </div>

        <div className={styles.actions}>
          <button onClick={onClose}>ביטול</button>
          <button disabled={!picked || serviceIdx === -1} onClick={handleSave}>
            בקשת תור
          </button>
        </div>
      </div>
    </div>
  );
}
