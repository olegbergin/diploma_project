import { useState } from "react";
import styles from "./Calendar.module.css";

// נוספה ברירת מחדל ל־appointments
export default function Calendar({ appointments = [], onDaySelect }) {
  const [current, setCurrent] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthStart = new Date(current);
  const monthEnd = new Date(current);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0);

  const firstGridDay = new Date(monthStart);
  firstGridDay.setDate(monthStart.getDate() - monthStart.getDay());

  // נקודת זמן נוכחית בלי שניות
  const todayIso = new Date().toISOString().slice(0, 10);

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(firstGridDay);
    d.setDate(firstGridDay.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const busy = appointments.some((a) => a.date === iso); // עכשיו בטוח!
    return { d, iso, busy, inMonth: d.getMonth() === current.getMonth() };
  });

  const prevMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() - 1);
    setCurrent(d);
  };
  const nextMonth = () => {
    const d = new Date(current);
    d.setMonth(d.getMonth() + 1);
    setCurrent(d);
  };

  const handleClick = (iso) => {
    // לא לאפשר לבחור תאריך מהעבר
    if (iso < todayIso) return;
    const dayAppts = appointments.filter((a) => a.date === iso);
    if (onDaySelect) {
      onDaySelect(iso, dayAppts);
    }
  };

  const monthName = current.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className={styles.headerBar}>
        <button onClick={prevMonth}>◀</button>
        <span>{monthName}</span>
        <button onClick={nextMonth}>▶</button>
      </div>

      <div className={styles.calendar}>
        {["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"].map((h) => (
          <div key={h} className={styles.weekday}>
            {h}
          </div>
        ))}

        {days.map(({ d, iso, busy, inMonth }) => (
          <button
            key={iso}
            onClick={() => handleClick(iso, d)}
            className={`${styles.day} ${busy ? styles.busy : ""} ${
              inMonth ? "" : styles.out
            }`}
            disabled={iso < todayIso}
          >
            {d.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
