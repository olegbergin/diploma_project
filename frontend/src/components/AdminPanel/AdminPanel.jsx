/**
 * קומפוננטת פאנל אדמין
 * זהו מסך הבקרה המרכזי של מנהל המערכת.
 * המטרה שלה:
 * - להציג ניווט בין אזורי ניהול שונים (סטטיסטיקות / משתמשים / עסקים)
 * - להציג תצוגה מתחלפת לפי הטאב הפעיל
 * - להציג אינדיקציה דחופה אם יש עסקים שממתינים לאישור
 *
 * @component
 * @param {Object} props - מאפייני הקומפוננטה
 * @param {Object} props.user - אובייקט המשתמש הנוכחי (האדמין)
 * @returns {JSX.Element} לוח בקרה אדמין עם אזורי ניהול
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminBusinesses from "./AdminBusinesses";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminPanel.module.css";

function AdminPanel({ user }) {
  // ---------------------------------------------------
  // משתני מצב של הקומפוננטה
  // ---------------------------------------------------

  // מייצג איזה אזור ניהול מוצג כרגע (ברירת מחדל: סטטיסטיקות)
  const [activeSection, setActiveSection] = useState("stats");

  // מייצג כמה עסקים ממתינים לאישור
  // משמש להצגת "בועה" דחופה על טאב העסקים
  const [pendingBusinesses, setPendingBusinesses] = useState(0);

  // ---------------------------------------------------
  // אפקט שרץ פעם אחת בעליית הקומפוננטה
  // טוען מהשרת את מספר העסקים שממתינים לאישור
  // כדי להציג אינדיקציה דחופה לאדמין
  // ---------------------------------------------------
  useEffect(() => {
    // פונקציה לטעינת מספר עסקים ממתינים
    const loadPendingCount = async () => {
      try {
        // קריאת נתוני סטטיסטיקות מהשרת
        const response = await axiosInstance.get("/admin/stats");

        // עדכון מספר העסקים הממתינים
        setPendingBusinesses(response.data.pendingApprovals || 0);
      } catch (error) {
        // במקרה של שגיאה מדפיסים לקונסול
        console.error("Failed to load admin stats:", error);
      }
    };

    loadPendingCount();
  }, []);

  // ---------------------------------------------------
  // רשימת אזורי הניהול (הטאבים)
  // כל אזור כולל:
  // id: מזהה פנימי
  // name: שם תצוגה בעברית
  // emoji: אייקון קטן לטאב
  // urgent: האם יש אינדיקציה דחופה לטאב (רק עסקים)
  // urgentCount: כמה דחופים (כמה עסקים ממתינים)
  // ---------------------------------------------------
  const sections = [
    { id: "stats", name: "סטטיסטיקות", emoji: "📊" },
    { id: "users", name: "משתמשים", emoji: "👥" },
    {
      id: "businesses",
      name: "עסקים",
      emoji: "🏢",
      urgent: pendingBusinesses > 0,
      urgentCount: pendingBusinesses,
    },
  ];

  // ---------------------------------------------------
  // פונקציה שמחליטה איזה קומפוננטה להציג לפי הטאב הפעיל
  // ---------------------------------------------------
  const renderContent = () => {
    switch (activeSection) {
      case "stats":
        return <AdminStats />;
      case "users":
        return <AdminUsers />;
      case "businesses":
        return <AdminBusinesses />;
      default:
        return <AdminStats />;
    }
  };

  // ---------------------------------------------------
  // תצוגת המסך הראשי
  // כוללת:
  // - כותרת וברכת שלום לאדמין
  // - כפתורי ניווט בין אזורים
  // - אזור תוכן שמחליף קומפוננטות לפי בחירה
  // ---------------------------------------------------
  return (
    <div className={styles.adminContainer}>
      {/* כותרת המסך וברכת שלום */}
      <div className={styles.header}>
        <h1 className={styles.title}>לוח בקרה - מנהל מערכת</h1>
        <p className={styles.subtitle}>
          {/* מציגים את שם האדמין אם קיים, אחרת "מנהל" */}
          ברוך הבא {user?.first_name || user?.firstName || "מנהל"}!
        </p>
      </div>

      {/* טאבי ניווט בין אזורי הניהול */}
      <div className={styles.navigationTabs}>
        {sections.map((section) => (
          <button
            key={section.id}
            // קלאסים דינמיים:
            // active -> אם הטאב נבחר
            // urgent -> אם יש אינדיקציה דחופה
            className={`${styles.navTab} ${
              activeSection === section.id ? styles.active : ""
            } ${section.urgent ? styles.urgent : ""}`}
            onClick={() => setActiveSection(section.id)}
          >
            {/* אייקון הטאב */}
            <span className={styles.emoji}>{section.emoji}</span>

            {/* שם הטאב */}
            <span className={styles.tabName}>{section.name}</span>

            {/* בועה דחופה אם יש עסקים ממתינים */}
            {section.urgent && section.urgentCount > 0 && (
              <span className={styles.urgentBadge}>{section.urgentCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* אזור התוכן שמציג את הקומפוננטה הנבחרת */}
      <div className={styles.contentArea}>{renderContent()}</div>
    </div>
  );
}

export default AdminPanel;
