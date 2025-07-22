/**
 * Home Page Component
 * Main landing page with user welcome section and business profile routing
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current logged-in user object
 * @returns {JSX.Element} Home page with welcome content and nested routing
 */

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
          onClick={() => navigate('/profile/personal')}
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
