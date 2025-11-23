/**
 * Admin Users Management Component
 * Allows administrators to view and manage system users
 *
 * @component
 * @returns {JSX.Element} Users management interface
 *
 * קומפוננטה לניהול משתמשים עבור אדמין:
 * מאפשרת צפייה בכל המשתמשים, חיפוש, סינון לפי תפקיד/סטטוס,
 * שינוי סטטוס משתמשים, ופאג'ינציה.
 */

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminUsers.module.css";

function AdminUsers() {
  // ---------------------------------------------------
  // משתני מצב (State) של הקומפוננטה
  // ---------------------------------------------------

  // רשימת המשתמשים שמוצגים בטבלה
  const [users, setUsers] = useState([]);

  // מצב טעינה כדי להציג ספינר עד שהתשובה מהשרת מגיעה
  const [loading, setLoading] = useState(true);

  // טקסט חיפוש שהאדמין מקליד
  const [searchTerm, setSearchTerm] = useState("");

  // פילטר לפי תפקיד (all / customer / business / admin)
  const [filterRole, setFilterRole] = useState("all");

  // פילטר לפי סטטוס (all / active / suspended / deleted וכו')
  const [filterStatus, setFilterStatus] = useState("all");

  // אובייקט פאג'ינציה:
  // page = עמוד נוכחי
  // limit = כמות משתמשים בעמוד
  // total = סך כל המשתמשים שתואמים לפילטרים
  // totalPages = כמות העמודים הכוללת
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // ---------------------------------------------------
  // פונקציה לטעינת משתמשים מהשרת לפי הפילטרים והפאג'ינציה
  // ---------------------------------------------------
  const loadUsers = async () => {
    try {
      setLoading(true);

      // הכנת פרמטרים לבקשה לשרת
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        role: filterRole !== "all" ? filterRole : "",
        status: filterStatus !== "all" ? filterStatus : "",
      };

      // קריאה לשרת לקבלת משתמשים
      const response = await axiosInstance.get("/admin/users", { params });

      // Map the API response to match expected frontend format
      // מיפוי התשובה מהשרת לפורמט שצד הלקוח מצפה לו
      const mappedUsers = response.data.users.map((user) => ({
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status || "active",
        createdAt: user.created_at,
        lastLogin: user.last_login,
      }));

      // עדכון רשימת המשתמשים
      setUsers(mappedUsers);

      // עדכון הפאג'ינציה לפי מה שהשרת החזיר
      setPagination(response.data.pagination);
    } catch (error) {
      // טיפול בשגיאה אם הבקשה נכשלה
      console.error("Failed to load users:", error);
    } finally {
      // בכל מצב מסיימים טעינה
      setLoading(false);
    }
  };

  // ---------------------------------------------------
  // אפקט ראשון:
  // בכל שינוי של עמוד או כמות לעמוד - טוענים מחדש משתמשים
  // ---------------------------------------------------
  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit]);

  // ---------------------------------------------------
  // אפקט שני:
  // בכל שינוי של חיפוש/תפקיד/סטטוס:
  // מאפסים לעמוד ראשון וטוענים מחדש עם השהייה קצרה (Debounce)
  // ---------------------------------------------------
  useEffect(() => {
    // Reset to first page when filters change
    // איפוס העמוד ל-1 כאשר פילטר משתנה
    setPagination((prev) => ({ ...prev, page: 1 }));

    // השהייה של 300ms כדי לא לשלוח בקשה על כל אות
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300); // Debounce search

    // ניקוי טיימר אם המשתמש המשיך להקליד/שינה פילטר
    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

  // ---------------------------------------------------
  // פונקציה לשינוי סטטוס משתמש (Active / Inactive / Pending)
  // שולחת בקשה לשרת ומעדכנת מיד גם את ה-UI
  // ---------------------------------------------------
  const handleStatusChange = async (userId, newStatus) => {
    try {
      // עדכון סטטוס בשרת
      await axiosInstance.put(`/admin/users/${userId}/status`, {
        status: newStatus,
      });

      // Update local state to reflect the change immediately
      // עדכון מקומי כדי שהטבלה תשתנה מיד בלי לחכות לטעינה מחדש
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  // ---------------------------------------------------
  // פונקציה לשינוי תפקיד משתמש (Role)
  // כרגע אין כפתורים שמפעילים אותה ב-UI, אבל היא מוכנה לשימוש
  // ---------------------------------------------------
  const handleRoleChange = async (userId, newRole) => {
    try {
      // עדכון תפקיד בשרת
      await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });

      // Update local state to reflect the change immediately
      // עדכון מקומי של התפקיד בטבלה
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  // ---------------------------------------------------
  // שינוי עמוד בפאג'ינציה
  // מפעיל טעינה מחדש דרך האפקט הראשון
  // ---------------------------------------------------
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // ---------------------------------------------------
  // המרת קוד תפקיד לטקסט בעברית לתצוגה בטבלה
  // ---------------------------------------------------
  const getRoleText = (role) => {
    const roleMap = {
      customer: "לקוח",
      business: "עסק",
      admin: "מנהל",
    };
    return roleMap[role] || role;
  };

  // ---------------------------------------------------
  // המרת סטטוס לטקסט בעברית לתצוגה בטבלה
  // ---------------------------------------------------
  const getStatusText = (status) => {
    const statusMap = {
      active: "פעיל",
      inactive: "לא פעיל",
      pending: "ממתין לאישור",
    };
    return statusMap[status] || status;
  };

  // ---------------------------------------------------
  // החזרת צבע בהתאם לסטטוס המשתמש (לצבע התגית)
  // ---------------------------------------------------
  const getStatusColor = (status) => {
    const colorMap = {
      active: "#4caf50",
      inactive: "#9e9e9e",
      pending: "#ff9800",
    };
    return colorMap[status] || "#9e9e9e";
  };

  // ---------------------------------------------------
  // תצוגת טעינה:
  // אם עדיין טוענים נתונים - מציגים ספינר
  // ---------------------------------------------------
  if (loading) {
    return (
      <div className={styles.usersContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען משתמשים...</p>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------
  // תצוגה ראשית של המסך:
  // כוללת חיפוש+פילטרים, טבלה, הודעת אין תוצאות ופאג'ינציה
  // ---------------------------------------------------
  return (
    <div className={styles.usersContainer}>
      <h2 className={styles.sectionTitle}>ניהול משתמשים</h2>

      {/* אזור חיפוש וסינון משתמשים */}
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש משתמשים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {/* פילטר לפי תפקיד וסטטוס */}
        <div className={styles.filterContainer}>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">כל התפקידים</option>
            <option value="customer">לקוחות</option>
            <option value="business">עסקים</option>
            <option value="admin">מנהלים</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="active">פעיל</option>
            <option value="suspended">מושעה</option>
            <option value="deleted">נמחק</option>
          </select>
        </div>
      </div>

      {/* טבלת המשתמשים */}
      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>שם</div>
          <div className={styles.headerCell}>אימייל</div>
          <div className={styles.headerCell}>תפקיד</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>תאריך הצטרפות</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>

        {/* שורות הטבלה - כל משתמש בשורה */}
        {users.map((user) => (
          <div key={user.id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <div className={styles.userInfo}>
                {/* אווטאר עם האות הראשונה של השם והמשפחה */}
                <div className={styles.userAvatar}>
                  {user.firstName.charAt(0)}
                  {user.lastName.charAt(0)}
                </div>
                <div className={styles.userName}>
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>

            {/* אימייל המשתמש */}
            <div className={styles.tableCell}>{user.email}</div>

            {/* תגית תפקיד */}
            <div className={styles.tableCell}>
              <span className={styles.roleTag}>{getRoleText(user.role)}</span>
            </div>

            {/* תגית סטטוס עם צבע */}
            <div className={styles.tableCell}>
              <span
                className={styles.statusTag}
                style={{
                  backgroundColor: getStatusColor(user.status) + "20",
                  color: getStatusColor(user.status),
                }}
              >
                {getStatusText(user.status)}
              </span>
            </div>

            {/* תאריך הצטרפות */}
            <div className={styles.tableCell}>
              {new Date(user.createdAt).toLocaleDateString("he-IL")}
            </div>

            {/* כפתורי פעולה לפי סטטוס */}
            <div className={styles.tableCell}>
              <div className={styles.actions}>
                {user.status === "pending" && (
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleStatusChange(user.id, "active")}
                  >
                    אשר
                  </button>
                )}
                {user.status === "active" && (
                  <button
                    className={styles.deactivateBtn}
                    onClick={() => handleStatusChange(user.id, "inactive")}
                  >
                    השבת
                  </button>
                )}
                {user.status === "inactive" && (
                  <button
                    className={styles.activateBtn}
                    onClick={() => handleStatusChange(user.id, "active")}
                  >
                    הפעל
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* הודעה אם אין משתמשים אחרי סינון */}
      {users.length === 0 && !loading && (
        <div className={styles.noResults}>
          <p>לא נמצאו משתמשים התואמים לחיפוש</p>
        </div>
      )}

      {/* פאג'ינציה - תופיע רק אם יש יותר מעמוד אחד */}
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

export default AdminUsers;
