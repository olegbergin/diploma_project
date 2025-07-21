// src/components/UserProfilePage/UserProfilePage.jsx

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
      {/* Sidebar components moved to UserProfileSidebar.jsx backup component */}
      
      {/* Main Content - Full width without sidebar */}
      <main className={styles.mainPanel}>
        <Routes>
          {/* Redirect /profile to /profile/personal (direct to personal info) */}
          <Route path="/" element={<Navigate to="personal" replace />} />
          {/* HomePage with nested business profile routing */}
          <Route path="home/*" element={<HomePage user={user} />} />
          {/* Panels */}
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
