/**
 * User Profile Page Component
 * Provides routing for user dashboard panels including personal info, appointments, and favorites
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Function} props.setUser - Function to update user state
 * @param {Function} props.onLogout - Logout handler function
 * @returns {JSX.Element} User profile page with nested routing
 */

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import styles from "./UserProfilePage.module.css";
import HomePage from "../HomePage/HomePage";
import AppointmentsPanel from "./UserDashboard/AppointmentsPanel";
import FavoritesPanel from "./UserDashboard/FavoritesPanel";
import PersonalInfoPanel from "./UserDashboard/PersonalInfoPanel";

export default function UserProfilePage({ user, setUser, onLogout }) {
  return (
    <div className={styles.dashboardContainer}>
      {/* Main Content - Full width layout */}
      <main className={styles.mainPanel}>
        <Routes>
          {/* Default redirect to personal info */}
          <Route path="/" element={<Navigate to="personal" replace />} />
          
          {/* HomePage with nested business profile routing */}
          <Route path="home/*" element={<HomePage user={user} />} />
          
          {/* User dashboard panels */}
          <Route
            path="appointments"
            element={<AppointmentsPanel user={user} />}
          />
          <Route
            path="favorites"
            element={<FavoritesPanel userId={user.user_id} />}
          />
          <Route
            path="personal"
            element={<PersonalInfoPanel user={user} setUser={setUser} />}
          />
        </Routes>
      </main>
    </div>
  );
}
