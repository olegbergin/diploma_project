/**
 * Admin Statistics Component
 * Displays system-wide statistics and metrics
 * 
 * @component
 * @returns {JSX.Element} Statistics dashboard with key metrics
 */

import React, { useState, useEffect } from "react";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import styles from "./AdminStats.module.css";

function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    loading: true
  });

  useEffect(() => {
    // TODO: Implement admin API endpoints
    const loadStats = async () => {
      try {
        // No admin API endpoints implemented yet
        setStats({
          totalUsers: 0,
          totalBusinesses: 0,
          totalAppointments: 0,
          todayAppointments: 0,
          loading: false
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    loadStats();
  }, []);

  const statsCards = [
    {
      title: "סה״כ משתמשים",
      value: stats.totalUsers,
      emoji: "👥",
      color: "#673ab7",
      bgColor: "#f7eafd"
    },
    {
      title: "סה״כ עסקים",
      value: stats.totalBusinesses,
      emoji: "🏢",
      color: "#9c27b0",
      bgColor: "#f3e6fa"
    },
    {
      title: "סה״כ תורים",
      value: stats.totalAppointments,
      emoji: "📅",
      color: "#7b1fa2",
      bgColor: "#f8f4ff"
    },
    {
      title: "תורים היום",
      value: stats.todayAppointments,
      emoji: "⭐",
      color: "#8e24aa",
      bgColor: "#f4eafd"
    }
  ];

  if (stats.loading) {
    return (
      <div className={styles.statsContainer}>
        <LoadingSpinner size="large" message="טוען סטטיסטיקות..." />
      </div>
    );
  }

  return (
    <div className={styles.statsContainer}>
      <h2 className={styles.sectionTitle}>סטטיסטיקות המערכת</h2>
      
      <div className={styles.statsGrid}>
        {statsCards.map((card, index) => (
          <div 
            key={index} 
            className={styles.statCard}
            style={{ 
              backgroundColor: card.bgColor,
              borderColor: card.color + "40"
            }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.cardEmoji}>{card.emoji}</span>
              <h3 
                className={styles.cardTitle}
                style={{ color: card.color }}
              >
                {card.title}
              </h3>
            </div>
            <div 
              className={styles.cardValue}
              style={{ color: card.color }}
            >
              {card.value.toLocaleString()}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.additionalInfo}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>פעילות אחרונה</h3>
          <div className={styles.activityList}>
            <div className={styles.emptyState}>
              <p>נתוני פעילות יוצגו כאן לאחר הטמעת API מנהל</p>
            </div>
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>סטטוס המערכת</h3>
          <div className={styles.systemStatus}>
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator + " " + styles.online}></div>
              <span>שרת פעיל</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator + " " + styles.online}></div>
              <span>בסיס נתונים פעיל</span>
            </div>
            <div className={styles.statusItem}>
              <div className={styles.statusIndicator + " " + styles.warning}></div>
              <span>שירות התראות - איטי</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;