/**
 * Admin Users Management Component
 * Allows administrators to view and manage system users
 * 
 * @component
 * @returns {JSX.Element} Users management interface
 */

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminUsers.module.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        role: filterRole !== 'all' ? filterRole : '',
        status: filterStatus !== 'all' ? filterStatus : ''
      };

      const response = await axiosInstance.get('/admin/users', { params });

      // Map the API response to match expected frontend format
      const mappedUsers = response.data.users.map(user => ({
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status || 'active',
        createdAt: user.created_at,
        lastLogin: user.last_login
      }));

      setUsers(mappedUsers);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, page: 1 }));
    const timeoutId = setTimeout(() => {
      loadUsers();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterRole, filterStatus]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/status`, { status: newStatus });

      // Update local state to reflect the change immediately
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await axiosInstance.put(`/admin/users/${userId}/role`, { role: newRole });

      // Update local state to reflect the change immediately
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (error) {
      console.error("Failed to update user role:", error);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`האם אתה בטוח שברצונך למחוק את המשתמש ${userName}?`)) {
      return;
    }

    try {
      await axiosInstance.delete(`/admin/users/${userId}`);

      // Remove user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setPagination(prev => ({ ...prev, total: prev.total - 1 }));
    } catch (error) {
      console.error("Failed to delete user:", error);
      alert('שגיאה במחיקת המשתמש');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getRoleText = (role) => {
    const roleMap = {
      customer: "לקוח",
      business: "עסק",
      admin: "מנהל"
    };
    return roleMap[role] || role;
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: "פעיל",
      inactive: "לא פעיל",
      pending: "ממתין לאישור"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "#4caf50",
      inactive: "#9e9e9e",
      pending: "#ff9800"
    };
    return colorMap[status] || "#9e9e9e";
  };

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

  return (
    <div className={styles.usersContainer}>
      <h2 className={styles.sectionTitle}>ניהול משתמשים</h2>

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

      <div className={styles.usersTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>שם</div>
          <div className={styles.headerCell}>אימייל</div>
          <div className={styles.headerCell}>תפקיד</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>תאריך הצטרפות</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>

        {users.map(user => (
          <div key={user.id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
                <div className={styles.userName}>
                  {user.firstName} {user.lastName}
                </div>
              </div>
            </div>
            <div className={styles.tableCell}>{user.email}</div>
            <div className={styles.tableCell}>
              <span className={styles.roleTag}>
                {getRoleText(user.role)}
              </span>
            </div>
            <div className={styles.tableCell}>
              <span
                className={styles.statusTag}
                style={{
                  backgroundColor: getStatusColor(user.status) + "20",
                  color: getStatusColor(user.status)
                }}
              >
                {getStatusText(user.status)}
              </span>
            </div>
            <div className={styles.tableCell}>
              {new Date(user.createdAt).toLocaleDateString('he-IL')}
            </div>
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
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteUser(user.id, `${user.firstName} ${user.lastName}`)}
                >
                  🗑️ מחק
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className={styles.noResults}>
          <p>לא נמצאו משתמשים התואמים לחיפוש</p>
        </div>
      )}

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