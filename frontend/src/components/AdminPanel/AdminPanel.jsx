/**
 * Admin Panel Component
 * Central dashboard for system administrators
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current admin user object
 * @returns {JSX.Element} Admin panel with management sections
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminStats from "./AdminStats";
import AdminUsers from "./AdminUsers";
import AdminBusinesses from "./AdminBusinesses";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminPanel.module.css";

function AdminPanel({ user }) {
  const [activeSection, setActiveSection] = useState("stats");
  const [pendingBusinesses, setPendingBusinesses] = useState(0);

  useEffect(() => {
    // Load pending businesses count for urgent indicator
    const loadPendingCount = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setPendingBusinesses(response.data.pendingApprovals || 0);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };

    loadPendingCount();
  }, []);

  const sections = [
    { id: "stats", name: "סטטיסטיקות", emoji: "📊" },
    { id: "users", name: "משתמשים", emoji: "👥" },
    { 
      id: "businesses", 
      name: "עסקים", 
      emoji: "🏢", 
      urgent: pendingBusinesses > 0,
      urgentCount: pendingBusinesses
    }
  ];

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

  return (
    <div className={styles.adminContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>לוח בקרה - מנהל מערכת</h1>
        <p className={styles.subtitle}>
          ברוך הבא {user?.first_name || user?.firstName || 'מנהל'}! 
        </p>
      </div>

      <div className={styles.navigationTabs}>
        {sections.map((section) => (
          <button
            key={section.id}
            className={`${styles.navTab} ${
              activeSection === section.id ? styles.active : ""
            } ${section.urgent ? styles.urgent : ""}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className={styles.emoji}>{section.emoji}</span>
            <span className={styles.tabName}>{section.name}</span>
            {section.urgent && section.urgentCount > 0 && (
              <span className={styles.urgentBadge}>{section.urgentCount}</span>
            )}
          </button>
        ))}
      </div>

      <div className={styles.contentArea}>
        {renderContent()}
      </div>
    </div>
  );
}

export default AdminPanel;