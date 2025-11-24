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
import AdminReviewComplaints from "./AdminReviewComplaints";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminPanel.module.css";

function AdminPanel({ user }) {
  const [activeSection, setActiveSection] = useState("stats");
  const [pendingBusinesses, setPendingBusinesses] = useState(0);
  const [pendingComplaints, setPendingComplaints] = useState(0);

  useEffect(() => {
    // Load pending businesses count and complaints count for urgent indicators
    const loadPendingCounts = async () => {
      try {
        const [statsResponse, complaintsResponse] = await Promise.all([
          axiosInstance.get('/admin/stats'),
          axiosInstance.get('/admin/reviews/complaints', { params: { status: 'pending', limit: 1 } })
        ]);

        setPendingBusinesses(statsResponse.data.pendingApprovals || 0);
        setPendingComplaints(complaintsResponse.data.total || 0);
      } catch (error) {
        console.error("Failed to load admin stats:", error);
      }
    };

    loadPendingCounts();
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
    },
    {
      id: "complaints",
      name: "תלונות על ביקורות",
      emoji: "⚠️",
      urgent: pendingComplaints > 0,
      urgentCount: pendingComplaints
    }
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "stats":
        return <AdminStats onNavigate={setActiveSection} />;
      case "users":
        return <AdminUsers />;
      case "businesses":
        return <AdminBusinesses />;
      case "complaints":
        return <AdminReviewComplaints />;
      default:
        return <AdminStats onNavigate={setActiveSection} />;
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
            className={`${styles.navTab} ${activeSection === section.id ? styles.active : ""
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