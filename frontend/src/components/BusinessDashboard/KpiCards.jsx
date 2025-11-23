import React from "react";
import styles from "./KpiCards.module.css";

/**
 * קומפוננטה המציגה כרטיס KPI בודד (מדד ביצועים)
 * הכרטיס כולל: אייקון, כותרת, ערך וצבע ייחודי בחלק העליון
 */
const KpiCard = ({ title, value, icon, color }) => (
  <div
    className={styles.kpiCard}
    // פס עליון בצבע מותאם לכל KPI
    style={{ borderTop: `4px solid ${color}` }}
  >
    {/* רקע עם צבע חלש סביב האייקון */}
    <div
      className={styles.iconWrapper}
      style={{ backgroundColor: `${color}20` }}
    >
      {icon}
    </div>

    {/* טקסט של הערך והכותרת */}
    <div className={styles.textWrapper}>
      <div className={styles.value}>{value}</div>
      <div className={styles.title}>{title}</div>
    </div>
  </div>
);

/**
 * קומפוננטה ראשית שמציגה את כל כרטיסי ה-KPI יחד
 * הנתונים מתקבלים מ־analytics ומוצגים בצורה ויזואלית
 */
export default function KpiCards({ analytics }) {
  // אם אין נתונים עדיין — לא מציג כלום כדי למנוע שגיאות
  if (!analytics) return null;

  /**
   * ברירת מחדל למקרה שנגיע נתונים חסרים מהשרת
   * זה מונע קריסה או undefined על המסך
   */
  const monthlyRevenue = analytics.monthlyRevenue || 0;
  const weeklyRevenue = analytics.weeklyRevenue || 0;
  const pendingAppointments = analytics.pendingAppointments || 0;
  const newClientsThisMonth = analytics.newClientsThisMonth || 0;

  return (
    <div className={styles.kpiGrid}>
      {/* כרטיס KPI - הכנסה חודשית */}
      <KpiCard
        title="הכנסה החודש"
        value={`₪${monthlyRevenue.toLocaleString()}`}
        icon="💰"
        color="var(--success-green)"
      />

      {/* כרטיס KPI - הכנסה שבועית */}
      <KpiCard
        title="הכנסה השבוע"
        value={`₪${weeklyRevenue.toLocaleString()}`}
        icon="💸"
        color="var(--primary-blue)"
      />

      {/* כרטיס KPI - כמה תורים ממתינים */}
      <KpiCard
        title="תורים ממתינים"
        value={pendingAppointments}
        icon="⏳"
        color="var(--warning-orange)"
      />

      {/* כרטיס KPI - לקוחות חדשים החודש */}
      <KpiCard
        title="לקוחות חדשים (חודש)"
        value={newClientsThisMonth}
        icon="👥"
        color="var(--business-purple)"
      />
    </div>
  );
}
