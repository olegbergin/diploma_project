import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // סגנון מובנה
import styles from "./ScheduleModal.module.css";

export default function ScheduleModal({ appointments, onClose }) {
  const [day, setDay] = useState(null);

  /* תורים של היום הנבחר */
  const todaysAppts = appointments.filter(
    (a) => day && a.date === day.toISOString().slice(0, 10)
  );

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.card} onClick={(e) => e.stopPropagation()}>
        <h2>לוח זמנים</h2>

        <Calendar
          locale="he-IL"
          calendarType="hebrew" /* RTL */
          value={day}
          onChange={setDay}
          tileContent={({ date }) => {
            /* נקודה כחולה על ימים עם תורים */
            const iso = date.toISOString().slice(0, 10);
            return appointments.some((a) => a.date === iso) ? (
              <span className={styles.dot} />
            ) : null;
          }}
        />

        <div className={styles.list}>
          <h3>תורים ל-{day ? day.toLocaleDateString("he-IL") : "--"}</h3>
          {day ? (
            todaysAppts.length ? (
              todaysAppts.map((a, i) => (
                <p key={i}>
                  {a.time} — {a.customer}
                </p>
              ))
            ) : (
              <p>אין תורים ביום זה</p>
            )
          ) : (
            <p>בחר יום כדי לראות תורים</p>
          )}
        </div>

        <button className={styles.closeBtn} onClick={onClose}>
          סגור
        </button>
      </div>
    </div>
  );
}
