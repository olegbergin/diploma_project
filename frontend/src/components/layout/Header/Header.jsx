// src/components/layout/Header/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLogOut, FiSearch } from 'react-icons/fi';
import styles from './header.module.css';

/**
 * Main application header.
 * Shows role-aware "home" link and search.
 * Profile initials circle was removed per request.
 */
function Header({ user, onLogout }) {
  // יעד "דף בית" לפי תפקיד
  const roleHomePath = (() => {
    if (!user) return '/login';
    const userId = user.user_id ?? user.id;
    const businessId = user.businessId ?? userId;

   if (user.role === "customer") return `/user/${userId}/dashboard`;
   if (user.role === "business") return `/business/${businessId}/dashboard`;
   if (user.role === "admin") return "/admin";

    return '/login';
  })();

  // ללא משתמש: כותרת פשוטה
  if (!user) {
    return (
      <header className={styles.header}>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.homeLink} aria-label="Login">
            <FiHome />
          </Link>
          <Link to="/search" className={styles.searchLink} aria-label="Search businesses">
            <FiSearch />
          </Link>
        </div>
      </header>
    );
  }

  // עם משתמש: בלי עיגול/אווטאר, רק בית+חיפוש+התנתקות
  return (
    <header className={styles.header}>
      {/* מרכז: קישורים */}
      <div className={styles.navLinks}>
        <Link to={roleHomePath} className={styles.homeLink} aria-label="Go to your home">
          <FiHome />
        </Link>
        <Link to="/search" className={styles.searchLink} aria-label="Search businesses">
          <FiSearch />
        </Link>
      </div>

      {/* ימין: התנתקות */}
      <button onClick={onLogout} className={styles.logoutButton} aria-label="Logout">
        <FiLogOut />
      </button>
    </header>
  );
}

export default Header;
