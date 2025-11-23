import React from "react";
// ייבוא רכיבי הגרף מספריית recharts
import {
  BarChart, // גרף עמודות
  Bar, // רכיב העמודות עצמם
  XAxis, // ציר X (אופקי)
  YAxis, // ציר Y (אנכי)
  CartesianGrid, // רשת רקע לגרף
  Tooltip, // חלונית מידע שמופיעה בהובר
  ResponsiveContainer, // עוטף שמאפשר לגרף להיות רספונסיבי
  Cell, // מאפשר להגדיר צבע לכל עמודה בנפרד
} from "recharts";

import styles from "./PerformanceChart.module.css";

// קומפוננטה שמקבלת data ומציגה גרף ביצועים שבועיים
export default function PerformanceChart({ data }) {
  // אם אין נתונים או שהמערך ריק – מציגה מצב ריק עם הודעה
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartCard}>
        <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>
        <div className={styles.emptyState}>
          אין נתונים להצגה (אין תורים שהושלמו בשבוע האחרון)
        </div>
      </div>
    );
  }

  // עיבוד הנתונים לפני שליחה לגרף:
  // המרה למבנה ש-recharts expects + הוספת שדות עזר להצגה
  const processedData = data.map((item) => {
    const dateObj = new Date(item.date);
    return {
      date: item.date, // תאריך במבנה המקורי
      revenue: parseFloat(item.revenue) || 0, // הכנסה מספרית, ואם לא תקין אז 0
      dayMonth: `${dateObj.getDate()}/${dateObj.getMonth() + 1}`, // טקסט קצר לציר X
      fullDate: new Date(item.date).toLocaleDateString("he-IL", {
        // תאריך מלא ל-tooltip
        day: "numeric",
        month: "short",
      }),
    };
  });

  // קומפוננטת Tooltip מותאמת:
  // מציגה תאריך והכנסה כשעומדים על עמודה
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={styles.customTooltip}>
          <p className={styles.tooltipDate}>{payload[0].payload.fullDate}</p>
          <p className={styles.tooltipRevenue}>
            ₪
            {payload[0].value.toLocaleString("he-IL", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
      );
    }
    return null;
  };

  // פונקציה שמעצבת את המספרים בציר Y:
  // אם מעל 1000 → מציגה בקיצור של אלפים (k)
  const formatYAxis = (value) => {
    if (value >= 1000) {
      return `₪${(value / 1000).toFixed(1)}k`;
    }
    return `₪${value}`;
  };

  // חישוב ההכנסה הגבוהה ביותר כדי לדעת איך לצבוע עמודות יחסית אליה
  const maxRevenue = Math.max(...processedData.map((item) => item.revenue));

  // פונקציה שמחזירה צבע לעמודה לפי גובה ההכנסה ביחס למקסימום
  const getBarColor = (revenue) => {
    const percentage = (revenue / maxRevenue) * 100;
    if (percentage >= 80) return "var(--stats-green)";
    if (percentage >= 50) return "var(--stats-cyan)";
    if (percentage >= 30) return "var(--stats-blue)";
    return "var(--stats-orange)";
  };

  // החזרת ה-UI של הגרף
  return (
    <div className={styles.chartCard}>
      <h3 className={styles.cardTitle}>ביצועים שבועיים</h3>

      {/* קונטיינר לגרף כדי לשמור על גובה קבוע ורוחב מלא */}
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={processedData} // הנתונים לאחר עיבוד
            margin={{ top: 10, right: 10, left: 0, bottom: 5 }}
          >
            {/* רשת רקע לגרף */}
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />

            {/* ציר X – מציג יום/חודש */}
            <XAxis
              dataKey="dayMonth"
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border-light)" }}
            />

            {/* ציר Y – מציג הכנסה ומעוצב ע"י formatYAxis */}
            <YAxis
              tickFormatter={formatYAxis}
              tick={{ fill: "var(--text-secondary)", fontSize: 12 }}
              axisLine={{ stroke: "var(--border-light)" }}
            />

            {/* Tooltip מותאם שמופיע בהובר על עמודה */}
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--bg-hover)" }}
            />

            {/* העמודות – כל עמודה מקבלת צבע לפי ההכנסה שלה */}
            <Bar
              dataKey="revenue"
              radius={[6, 6, 0, 0]} // פינות מעוגלות למעלה
              maxBarSize={60} // מגביל רוחב עמודות
            >
              {processedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.revenue)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
