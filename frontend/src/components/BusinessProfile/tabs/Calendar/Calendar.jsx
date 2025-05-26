import { useState } from "react";
import styles from "./Calendar.module.css";

export default function Calendar({ appointments }) {
  /* ---------- סטייט חודש בסיס ---------- */
  const [current, setCurrent] = useState(() => {
    const d = new Date(); // היום
    d.setDate(1); // אל היום הראשון
    d.setHours(0, 0, 0, 0);
    return d;
  });

  /* ---------- חישובי תאריכים ---------- */
  const monthStart = new Date(current); // 1 בחודש
  const monthEnd = new Date(current);
  monthEnd.setMonth(monthEnd.getMonth() + 1);
  monthEnd.setDate(0); // היום האחרון בחודש

  // מתי לשים “ראשון” ראשון (RTL)
  const firstGridDay = new Date(monthStart);
  firstGridDay.setDate(monthStart.getDate() - monthStart.getDay());

  const days = Array.from({ length: 42 }, (_, i) => {
    const d = new Date(firstGridDay);
    d.setDate(firstGridDay.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    const busy = appointments.some((a) => a.date === iso);
    return { d, iso, busy, inMonth: d.getMonth() === current.getMonth() };
  });

  /* ---------- אירועים ---------- */
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
    const dayAppts = appointments.filter((a) => a.date === iso);
    if (!dayAppts.length) return;
    alert(dayAppts.map((a) => `${a.time} – ${a.customer}`).join("\n"));
  };

  /* ---------- Render ---------- */
  const monthName = current.toLocaleDateString("he-IL", {
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      {/* כותרת חודש + חיצים */}
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
            onClick={() => handleClick(iso)}
            className={`${styles.day} ${busy ? styles.busy : ""} ${
              inMonth ? "" : styles.out
            }`}
          >
            {d.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
}
