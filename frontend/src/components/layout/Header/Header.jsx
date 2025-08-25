// src/components/Header/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiLogOut, FiSearch } from 'react-icons/fi'; // Import the icons we need
import styles from './header.module.css';

/**
 * The main application header.
 * It displays navigation controls based on the user's authentication status.
 * @param {object} props
 * @param {object} props.user - The current user object. Should contain firstName, lastName.
 * @param {function} props.onLogout - The function to call when the logout button is clicked.
 */
function Header({ user, onLogout }) {

  // If there is no user, show a simplified header with just search
  if (!user) {
    return (
      <header className={styles.header}>
        {/* Simple navigation for non-authenticated users */}
        <div className={styles.navLinks}>
          <Link to="/search" className={styles.searchLink} aria-label="Search businesses">
            <FiSearch />
          </Link>
        </div>
      </header>
    );
  }

  // Get the user's initials for the profile icon fallback.
  // The '?' is optional chaining: it prevents errors if firstName or lastName are missing.
  const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;

  return (
    <header className={styles.header}>
      {/* Left Side: Profile Link */}
      <Link 
        to={
          user?.role === "customer" ? "/profile" : 
          user?.role === "business" ? `/business/${user.businessId || user.id}` : 
          user?.role === "admin" ? "/admin" :
          "/profile"
        } 
        className={styles.profileLink} 
        aria-label="Go to your profile"
      >
        {/* We can add logic here later to show a real avatar image if one exists */}
        <span className={styles.profileInitials}>{userInitials}</span>
      </Link>

      {/* Middle: Navigation Links */}
      <div className={styles.navLinks}>
        <Link to="/search" className={styles.searchLink} aria-label="Search businesses">
          <FiSearch />
        </Link>
      </div>

      {/* Right Side: Logout Button */}
      <button onClick={onLogout} className={styles.logoutButton} aria-label="Logout">
        <FiLogOut />
      </button>
    </header>
  );
}

export default Header;