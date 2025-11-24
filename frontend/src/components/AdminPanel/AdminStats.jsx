/**
 * Admin Statistics Component
 * Displays system-wide statistics and metrics
 * 
 * @component
 * @param {Function} onNavigate - Callback to navigate to different sections
 * @returns {JSX.Element} Statistics dashboard with key metrics
 */

import React, { useState, useEffect } from "react";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminStats.module.css";

function AdminStats({ onNavigate }) {
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

    loadStats();
  }, []);

  const statsCards = [
    {
      title: "משתמשים חדשים החודש",
      value: stats.monthlyNewUsers || 0,
      emoji: "👥",
      color: "#673ab7",
      bgColor: "#f7eafd",
      subtitle: `השבוע: +${stats.weeklyNewUsers}`,
      navigateTo: "users"
    },
    {
      title: "עסקים חדשים החודש",
      value: stats.monthlyNewBusinesses || 0,
      emoji: "🏢",
      color: "#9c27b0",
      bgColor: "#f3e6fa",
      subtitle: `השבוע: +${stats.weeklyNewBusinesses}`,
      navigateTo: "businesses"
    },
    {
      title: "ביקורות ממתינות למחיקה",
      value: stats.pendingReviewDeletions || 0,
      emoji: "⚠️",
      color: "#f44336",
      bgColor: "#ffebee",
      subtitle: "דורש תשומת לב",
      navigateTo: "complaints"
    },
    {
      title: "ממתינים לאישור",
      value: stats.pendingApprovals,
      emoji: "⏳",
      color: "#f57c00",
      bgColor: "#fff8e1",
      subtitle: "עסקים חדשים",
      navigateTo: "businesses"
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
            onClick={() => onNavigate && onNavigate(card.navigateTo)}
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
    </div>
  );
}

export default AdminStats;