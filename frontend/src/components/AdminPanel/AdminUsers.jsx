/**
 * Admin Users Management Component
 * Allows administrators to view and manage system users
 * 
 * @component
 * @returns {JSX.Element} Users management interface
 */

import React, { useState, useEffect } from "react";
import styles from "./AdminUsers.module.css";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadUsers = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setUsers([
            {
              id: 1,
              firstName: "אברהם",
              lastName: "כהן",
              email: "abraham@email.com",
              role: "customer",
              status: "active",
              createdAt: "2024-01-15",
              lastLogin: "2024-01-20"
            },
            {
              id: 2,
              firstName: "שרה",
              lastName: "לוי",
              email: "sarah@email.com",
              role: "business",
              status: "active",
              createdAt: "2024-01-10",
              lastLogin: "2024-01-19"
            },
            {
              id: 3,
              firstName: "דוד",
              lastName: "שמעון",
              email: "david@email.com",
              role: "customer",
              status: "inactive",
              createdAt: "2024-01-05",
              lastLogin: "2024-01-10"
            },
            {
              id: 4,
              firstName: "רחל",
              lastName: "אברמוביץ",
              email: "rachel@email.com",
              role: "business",
              status: "pending",
              createdAt: "2024-01-18",
              lastLogin: null
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load users:", error);
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === "all" || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prevUsers => 
      prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      )
    );
    // TODO: Add API call to update user status
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
        
        {filteredUsers.map(user => (
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
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className={styles.noResults}>
          <p>לא נמצאו משתמשים התואמים לחיפוש</p>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;