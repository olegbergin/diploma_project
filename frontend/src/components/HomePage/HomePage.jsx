// src/components/HomePage/HomePage.jsx

import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import BusinessPublicProfile from "../BusinessPublicProfile/BusinessPublicProfile.jsx";
import styles from "./HomePage.module.css";

function HomePage({ user }) {
  const navigate = useNavigate();

  // --- Simple Home Page ---
  const DefaultHomeContent = () => (
    <div className={styles.welcomeSection}>
      <h1 className={styles.welcomeTitle}>
        ברוכים הבאים למערכת ניהול תורים
      </h1>
      <p className={styles.welcomeSubtitle}>
        שלום {user?.first_name || user?.firstName || 'משתמש'}! 
      </p>
      
      <div className={styles.actionButtons}>
        <button 
          className={styles.actionButton}
          onClick={() => navigate('/profile')}
        >
          👤 פרופיל אישי
        </button>
        <button 
          className={styles.actionButton}
          onClick={() => navigate('/search')}
        >
          🔍 חיפוש עסקים
        </button>
      </div>
    </div>
  );

  // --- Main Render: Nested routes for business profile ---
  return (
    <div className={styles.homePageContainer}>
      <Routes>
        <Route path="/" element={<DefaultHomeContent />} />
        <Route path="business/:id" element={<BusinessPublicProfile />} />
      </Routes>
    </div>
  );
}

export default HomePage;
