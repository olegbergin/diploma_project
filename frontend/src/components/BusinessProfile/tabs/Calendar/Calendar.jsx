import { useState } from "react";
import styles from "./Calendar.module.css";

/* מחזיר מערך של כל התאריכים (1-31 וכד’) בחודש הנוכחי */
function generateMonthDays() {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth(); // 0-based
  const days = new Date(y, m + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => i + 1);
}

/**
 * Calendar – לוח חודש בסיסי
 * props:
 *  • appointments = [{ day: 3, time:"10:00", customer:"דנה" }, ...]
 */
export default function Calendar({ appointments = [] }) {
  const [selectedDay, setSelectedDay] = useState(null);
  const days = generateMonthDays();

  return (
    <div className={styles.wrapper}>
      {/* רשת החודש */}
      <div className={styles.grid}>
        {days.map((d) => (
          <button
            key={d}
            className={`${styles.cell} ${
              selectedDay === d ? styles.selected : ""
            }`}
            onClick={() => setSelectedDay(d)}
          >
            {d}
            {appointments.some((a) => a.day === d) && (
              <span className={styles.dot} />
            )}
          </button>
        ))}
      </div>

      {/* רשימת תורים ליום הנבחר */}
      <div className={styles.list}>
        <h3>תורים ל-{selectedDay ?? "--"}</h3>
        {selectedDay ? (
          appointments
            .filter((a) => a.day === selectedDay)
            .map((a, i) => (
              <p key={i}>
                {a.time} — {a.customer}
              </p>
            ))
        ) : (
          <p>בחר יום להצגת תורים</p>
        )}
      </div>
    </div>
  );
}
