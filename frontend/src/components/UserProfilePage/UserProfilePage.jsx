// src/components/UserProfilePage/UserProfilePage.jsx

import React from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import styles from "./UserProfilePage.module.css";
import HomePage from "../HomePage/HomePage";
import AppointmentsPanel from "./UserDashboard/AppointmentsPanel";
import FavoritesPanel from "./UserDashboard/FavoritesPanel";
import PersonalInfoPanel from "./UserDashboard/PersonalInfoPanel";

export default function UserProfilePage({ user, setUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  // Get which section from the URL:
  let section = "home";
  if (location.pathname.includes("/appointments")) section = "appointments";
  else if (location.pathname.includes("/favorites")) section = "favorites";
  else if (location.pathname.includes("/personal")) section = "personal";

  // Sidebar navigation
  const navMenu = (
    <>
      <button
        className={section === "home" ? styles.active : ""}
        onClick={() => navigate("/profile/home")}
      >
        עמוד ראשי / חיפוש עסקים
      </button>
      <button
        className={section === "appointments" ? styles.active : ""}
        onClick={() => navigate("/profile/appointments")}
      >
        התורים שלי
      </button>
      <button
        className={section === "favorites" ? styles.active : ""}
        onClick={() => navigate("/profile/favorites")}
      >
        עסקים שאהבתי
      </button>
      <button
        className={section === "personal" ? styles.active : ""}
        onClick={() => navigate("/profile/personal")}
      >
        פרטים אישיים
      </button>
      <button
        className={styles.logoutBtn}
        onClick={onLogout}
        style={{ marginTop: 30 }}
      >
        התנתק
      </button>
    </>
  );

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar for desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.profileBox}>
          <img
            src={user.avatarUrl || "/default-avatar.png"}
            alt="profile"
            className={styles.avatar}
          />
          <div className={styles.username}>
            {user.firstName} {user.lastName}
          </div>
        </div>
        <nav className={styles.navButtons}>{navMenu}</nav>
      </aside>

      {/* Main Content - Uses nested routes for navigation */}
      <main className={styles.mainPanel}>
        <Routes>
          {/* Redirect /profile to /profile/home */}
          <Route path="/" element={<Navigate to="home" replace />} />
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
