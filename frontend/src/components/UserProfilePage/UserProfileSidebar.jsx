// src/components/UserProfilePage/UserProfileSidebar.jsx
// Backup component for sidebar and mobile drawer - not currently used

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./UserProfilePage.module.css";

export default function UserProfileSidebar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Get which section from the URL:
  let section = "home";
  if (location.pathname.includes("/appointments")) section = "appointments";
  else if (location.pathname.includes("/favorites")) section = "favorites";
  else if (location.pathname.includes("/personal")) section = "personal";

  // Navigation handler that closes drawer on mobile
  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
  };

  // Sidebar navigation
  const navMenu = (
    <>
      <button
        className={section === "home" ? styles.active : ""}
        onClick={() => handleNavigation("/profile/home")}
      >
        עמוד ראשי / חיפוש עסקים
      </button>
      <button
        className={section === "appointments" ? styles.active : ""}
        onClick={() => handleNavigation("/profile/appointments")}
      >
        התורים שלי
      </button>
      <button
        className={section === "favorites" ? styles.active : ""}
        onClick={() => handleNavigation("/profile/favorites")}
      >
        עסקים שאהבתי
      </button>
      <button
        className={section === "personal" ? styles.active : ""}
        onClick={() => handleNavigation("/profile/personal")}
      >
        פרטים אישיים
      </button>
      <button
        className={styles.logoutBtn}
        onClick={() => {
          onLogout();
          setDrawerOpen(false);
        }}
        style={{ marginTop: 30 }}
      >
        התנתק
      </button>
    </>
  );

  return (
    <>
      {/* Mobile hamburger button */}
      <button 
        className={styles.moreBtn} 
        onClick={() => setDrawerOpen(true)}
      >
        ☰
      </button>

      {/* Sidebar for desktop */}
      <aside className={styles.sidebar}>
        <div className={styles.profileBox}>
          <img
            src={user.avatarUrl || "/default-avatar.png"}
            alt="profile"
            className={styles.avatar}
          />
          <div className={styles.username}>
            {user.first_name || user.firstName} {user.last_name || user.lastName}
          </div>
        </div>
        <nav className={styles.navButtons}>{navMenu}</nav>
      </aside>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <>
          <div 
            className={styles.drawerOverlay} 
            onClick={() => setDrawerOpen(false)}
          />
          <aside className={styles.mobileDrawer}>
            <div className={styles.profileBox}>
              <img
                src={user.avatarUrl || "/default-avatar.png"}
                alt="profile"
                className={styles.avatar}
              />
              <div className={styles.username}>
                {user.first_name || user.firstName} {user.last_name || user.lastName}
              </div>
            </div>
            <nav className={styles.navButtons}>{navMenu}</nav>
          </aside>
        </>
      )}
    </>
  );
}