/**
 * קומפוננטה לניהול עסקים עבור אדמין
 * הקומפוננטה מאפשרת לאדמין:
 * - לצפות בעסקים לפי סטטוס (ממתין / מאושר / נדחה / הכל)
 * - לחפש עסקים
 * - לאשר או לדחות עסקים
 * - למחוק עסקים
 * - לדפדף בין עמודים בעזרת פאג'ינציה
 */

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminBusinesses.module.css";

function AdminBusinesses() {
  // ---------------------------------------------------
  // משתני מצב (State) של הקומפוננטה
  // ---------------------------------------------------

  // שמירת רשימת העסקים שמוצגים בטבלה
  const [businesses, setBusinesses] = useState([]);

  // משתנה שמייצג האם הנתונים נטענים כרגע (כדי להציג ספינר)
  const [loading, setLoading] = useState(true);

  // הטאב הפעיל כרגע במסך
  // ברירת מחדל "pending" כדי שהאדמין יראה קודם עסקים שממתינים לאישור
  const [activeTab, setActiveTab] = useState("pending");

  // טקסט החיפוש שהאדמין מקליד
  const [searchTerm, setSearchTerm] = useState("");

  // אובייקט פאג'ינציה שמגיע מהשרת:
  // page: מספר העמוד הנוכחי
  // limit: כמה עסקים להציג בכל עמוד
  // total: כמה עסקים סה"כ תואמים לפילטרים
  // totalPages: כמה עמודים יש ביחד
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });

  // ---------------------------------------------------
  // הגדרת הטאבים לפי סטטוס
  // כל טאב כולל:
  // id: מזהה פנימי בטאב
  // label: מה שרואים במסך
  // status: הערך שנשלח לשרת כפילטר
  // urgent: האם הטאב נחשב דחוף (לדוגמה ממתין לאישור)
  // ---------------------------------------------------
  const statusTabs = [
    { id: "pending", label: "ממתינים לאישור", status: "pending", urgent: true },
    { id: "approved", label: "מאושרים", status: "approved" },
    { id: "rejected", label: "נדחו", status: "rejected" },
    { id: "all", label: "הכל", status: "" },
  ];

  // ---------------------------------------------------
  // פונקציה לטעינת עסקים מהשרת
  // נטענים לפי:
  // - עמוד נוכחי וכמות בעמוד
  // - חיפוש
  // - סטטוס לפי הטאב הפעיל
  // ---------------------------------------------------
  const loadBusinesses = async () => {
    try {
      setLoading(true);

      // בניית פרמטרים לבקשה לשרת
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusTabs.find((tab) => tab.id === activeTab)?.status || "",
      };

      // קריאת השרת לקבלת עסקים
      const response = await axiosInstance.get("/admin/businesses", { params });

      // עדכון רשימת העסקים שהתקבלה
      setBusinesses(response.data.businesses || []);

      // עדכון הפאג'ינציה שהוזרה מהשרת
      setPagination(response.data.pagination);
    } catch (error) {
      // במקרה של שגיאה מדפיסים לקונסול
      console.error("Failed to load businesses:", error);
    } finally {
      // בכל מקרה מפסיקים טעינה כדי להסתיר ספינר
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // אפקט ראשון:
  // בכל פעם שהעמוד או הכמות לעמוד משתנים
  // נטען שוב את העסקים מהשרת
  // ---------------------------------------------------
  useEffect(() => {
    loadBusinesses();
  }, [pagination.page, pagination.limit]);

  // ---------------------------------------------------
  // אפקט שני:
  // בכל פעם שהטאב משתנה או החיפוש משתנה:
  // 1) מאפסים לעמוד ראשון
  // 2) מבצעים טעינה אחרי השהייה קצרה (Debounce)
  // כדי לא לשלוח בקשה על כל הקלדה מיידית
  // ---------------------------------------------------
  useEffect(() => {
    // איפוס לעמוד 1 כאשר יש שינוי טאב או חיפוש
    setPagination((prev) => ({ ...prev, page: 1 }));

    // השהייה של 300ms לפני טעינה
    const timeoutId = setTimeout(() => {
      loadBusinesses();
    }, 300);

    // ניקוי הטיימר אם היה שינוי נוסף לפני שחלף הזמן
    return () => clearTimeout(timeoutId);
  }, [activeTab, searchTerm]);

  // ---------------------------------------------------
  // פונקציה לטיפול בפעולות של אדמין על עסק
  // הפעולות האפשריות:
  // approve - אישור העסק
  // reject - דחיית העסק
  // לאחר הצלחה נטען מחדש את הרשימה
  // ---------------------------------------------------
  const handleBusinessAction = async (businessId, action) => {
    try {
      if (action === "approve") {
        await axiosInstance.put(`/admin/businesses/${businessId}/approve`);
      } else if (action === "reject") {
        await axiosInstance.put(`/admin/businesses/${businessId}/reject`);
      }

      // טעינה מחדש כדי לראות את השינויים
      loadBusinesses();
    } catch (error) {
      console.error(`Failed to ${action} business:`, error);
    }
  };

  // ---------------------------------------------------
  // פונקציה למחיקת עסק
  // מציגה הודעת אישור לפני מחיקה
  // אם המשתמש מאשר - שולחת בקשה לשרת
  // ולאחר מכן טוענת מחדש את הרשימה
  // ---------------------------------------------------
  const handleDeleteBusiness = async (businessId) => {
    if (
      window.confirm(
        "האם אתה בטוח שברצונך למחוק עסק זה? פעולה זו אינה ניתנת לביטול."
      )
    ) {
      try {
        await axiosInstance.delete(`/admin/businesses/${businessId}`);
        loadBusinesses();
      } catch (error) {
        console.error("Failed to delete business:", error);
      }
    }
  };

  // ---------------------------------------------------
  // פונקציה לשינוי עמוד בפאג'ינציה
  // ברגע שהעמוד משתנה, האפקט הראשון יטען נתונים מחדש
  // ---------------------------------------------------
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // ---------------------------------------------------
  // פונקציה להמרת סטטוס לטקסט תצוגה בעברית
  // ---------------------------------------------------
  const getStatusText = (status) => {
    const statusMap = {
      pending: "ממתין לאישור",
      approved: "מאושר",
      rejected: "נדחה",
    };
    return statusMap[status] || "לא ידוע";
  };

  // ---------------------------------------------------
  // פונקציה שמחזירה צבע לפי סטטוס העסק
  // משמשת להצגת תגית סטטוס בטבלה
  // ---------------------------------------------------
  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ff9800",
      approved: "#4caf50",
      rejected: "#f44336",
    };
    return colorMap[status] || "#9e9e9e";
  };

  // ---------------------------------------------------
  // תצוגה בזמן טעינה
  // אם loading=true מציגים ספינר והודעה
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className={styles.businessesContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען עסקים...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // תצוגה ראשית של המסך
  // כוללת:
  // - טאבים לפי סטטוס
  // - חיפוש וסטטיסטיקה
  // - טבלת עסקים
  // - הודעת "אין תוצאות"
  // - פאג'ינציה
  // ---------------------------------------------------
  return (
    <div className={styles.businessesContainer}>
      <h2 className={styles.sectionTitle}>ניהול עסקים</h2>

      {/* הצגת טאבים לפי סטטוס */}
      <div className={styles.statusTabs}>
        {statusTabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.statusTab} ${
              activeTab === tab.id ? styles.activeTab : ""
            } ${tab.urgent ? styles.urgentTab : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}

            {/* אם זה טאב דחוף ויש עסקים ממתינים, מציגים בועה עם כמות */}
            {tab.urgent && pagination.total > 0 && (
              <span className={styles.urgentBadge}>{pagination.total}</span>
            )}
          </button>
        ))}
      </div>

      {/* אזור חיפוש ומידע סטטיסטי */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש עסקים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* הצגת מידע רלוונטי לפי טאב */}
        <div className={styles.statsInfo}>
          {activeTab === "pending" && pagination.total > 0 && (
            <span className={styles.urgentInfo}>
              ⚠️ {pagination.total} עסקים הממתינים לאישור
            </span>
          )}
          {activeTab !== "pending" && (
            <span>סה״כ {pagination.total} עסקים</span>
          )}
        </div>
      </div>

      {/* טבלת עסקים */}
      <div className={styles.businessesTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>עסק</div>
          <div className={styles.headerCell}>בעלים</div>
          <div className={styles.headerCell}>קטגוריה</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>תאריך יצירה</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>

        {/* שורות הטבלה - כל שורה מייצגת עסק */}
        {businesses.map((business) => (
          <div key={business.business_id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <div className={styles.businessInfo}>
                <div className={styles.businessName}>{business.name}</div>
                <div className={styles.businessLocation}>
                  {business.location}
                </div>

                {/* אם יש תיאור קצר, מציגים רק את תחילת הטקסט */}
                {business.description && (
                  <div className={styles.businessDescription}>
                    {business.description.substring(0, 60)}...
                  </div>
                )}
              </div>
            </div>

            {/* פרטי בעל העסק */}
            <div className={styles.tableCell}>
              <div className={styles.ownerInfo}>
                <div className={styles.ownerName}>
                  {business.owner_first_name} {business.owner_last_name}
                </div>
                <div className={styles.ownerContact}>
                  {business.owner_email}
                </div>
                {business.owner_phone && (
                  <div className={styles.ownerPhone}>
                    {business.owner_phone}
                  </div>
                )}
              </div>
            </div>

            {/* קטגוריית העסק */}
            <div className={styles.tableCell}>
              <span className={styles.categoryTag}>{business.category}</span>
            </div>

            {/* תגית סטטוס העסק עם צבע */}
            <div className={styles.tableCell}>
              <span
                className={styles.statusTag}
                style={{
                  backgroundColor: getStatusColor(business.status) + "20",
                  color: getStatusColor(business.status),
                  borderColor: getStatusColor(business.status),
                }}
              >
                {getStatusText(business.status)}
              </span>
            </div>

            {/* תאריך היצירה */}
            <div className={styles.tableCell}>
              <div className={styles.dateInfo}>
                {new Date(business.created_at).toLocaleDateString("he-IL")}
              </div>
            </div>

            {/* כפתורי פעולות לפי סטטוס */}
            <div className={styles.tableCell}>
              <div className={styles.actions}>
                {business.status === "pending" && (
                  <>
                    <button
                      className={styles.approveBtn}
                      onClick={() =>
                        handleBusinessAction(business.business_id, "approve")
                      }
                    >
                      אשר
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() =>
                        handleBusinessAction(business.business_id, "reject")
                      }
                    >
                      דחה
                    </button>
                  </>
                )}

                {business.status === "approved" && (
                  <button
                    className={styles.rejectBtn}
                    onClick={() =>
                      handleBusinessAction(business.business_id, "reject")
                    }
                  >
                    דחה
                  </button>
                )}

                {business.status === "rejected" && (
                  <button
                    className={styles.approveBtn}
                    onClick={() =>
                      handleBusinessAction(business.business_id, "approve")
                    }
                  >
                    אשר
                  </button>
                )}

                {/* כפתור מחיקה תמיד מופיע */}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteBusiness(business.business_id)}
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* הודעה כשאין עסקים להצגה */}
      {businesses.length === 0 && !loading && (
        <div className={styles.noResults}>
          <p>
            {activeTab === "pending"
              ? "🎉 אין עסקים הממתינים לאישור"
              : "לא נמצאו עסקים התואמים לחיפוש"}
          </p>
        </div>
      )}

      {/* פאג'ינציה - מוצגת רק אם יש יותר מעמוד אחד */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            הקודם
          </button>

          <span className={styles.paginationInfo}>
            עמוד {pagination.page} מתוך {pagination.totalPages}
          </span>

          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminBusinesses;
