/**
 * Admin Statistics Component
 * Displays system-wide statistics and metrics
 * 
 * @component
 * @returns {JSX.Element} Statistics dashboard with key metrics
 */

import React, { useState, useEffect } from "react";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminStats.module.css";

function AdminStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalBusinesses: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    pendingApprovals: 0,
    weeklyNewUsers: 0,
    weeklyNewBusinesses: 0,
    systemStatus: 'operational',
    loading: true
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await axiosInstance.get('/admin/stats');
        setStats({
          ...response.data,
          loading: false
        });
      } catch (error) {
        console.error("Failed to load stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    const loadRecentActivity = async () => {
      try {
        const response = await axiosInstance.get('/admin/activity?limit=5');
        setRecentActivity(response.data);
      } catch (error) {
        console.error("Failed to load recent activity:", error);
      } finally {
        setActivityLoading(false);
      }
    };

    loadStats();
    loadRecentActivity();
  }, []);

  const statsCards = [
    {
      title: "משתמשים חדשים החודש",
      value: stats.monthlyNewUsers || 0,
      emoji: "👥",
      color: "#673ab7",
      bgColor: "#f7eafd",
      subtitle: `השבוע: +${stats.weeklyNewUsers}`
    },
    {
      title: "עסקים חדשים החודש",
      value: stats.monthlyNewBusinesses || 0,
      emoji: "🏢",
      color: "#9c27b0",
      bgColor: "#f3e6fa",
      subtitle: `השבוע: +${stats.weeklyNewBusinesses}`
    },
    {
      title: "ביקורות ממתינות למחיקה",
      value: stats.pendingReviewDeletions || 0,
      emoji: "⚠️",
      color: "#f44336",
      bgColor: "#ffebee",
      subtitle: "דורש תשומת לב"
    },
    {
      title: "ממתינים לאישור",
      value: stats.pendingApprovals,
      emoji: "⏳",
      color: "#f57c00",
      bgColor: "#fff8e1",
      subtitle: "עסקים חדשים"
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
            {card.subtitle && (
              <div className={styles.cardSubtitle}>
                {card.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>


      <div className={styles.additionalInfo}>
        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>פעילות אחרונה</h3>
          <div className={styles.activityList}>
            {activityLoading ? (
              <div className={styles.emptyState}>
                <p>טוען פעילות...</p>
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className={styles.activityItem}>
                  <div className={styles.activityIcon}>
                    {activity.type === 'user_registration' && '👤'}
                    {activity.type === 'business_registration' && '🏢'}
                    {activity.type === 'new_appointment' && '📅'}
                  </div>
                  <div className={styles.activityContent}>
                    <p className={styles.activityMessage}>{activity.message}</p>
                    <span className={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleString('he-IL')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.emptyState}>
                <p>אין פעילות אחרונה</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.infoCard}>
          <h3 className={styles.infoTitle}>סטטוס המערכת</h3>
          <div className={styles.systemStatus}>
            <div className={styles.statusItem}>
              <div className={`${styles.statusIndicator} ${styles.online}`}></div>
              <span>שרת פעיל</span>
            </div>
            <div className={styles.statusItem}>
              <div className={`${styles.statusIndicator} ${styles.online}`}></div>
              <span>בסיס נתונים פעיל</span>
            </div>
            <div className={styles.statusItem}>
              <div className={`${styles.statusIndicator} ${
                stats.systemStatus === 'operational' ? styles.online : 
                stats.systemStatus === 'degraded' ? styles.warning : styles.offline
              }`}></div>
              <span>
                {stats.systemStatus === 'operational' ? 'מערכת תקינה' :
                 stats.systemStatus === 'degraded' ? 'מערכת איטית' : 'מערכת לא פעילה'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminStats;