// src/components/Header/Header.jsx

import React from 'react';
import { Link } from 'react-router-dom';
import { FiHome, FiLogOut } from 'react-icons/fi'; // Import the icons we need
import styles from './Header.module.css';

/**
 * The main application header.
 * It displays navigation controls based on the user's authentication status.
 * @param {object} props
 * @param {object} props.user - The current user object. Should contain firstName, lastName.
 * @param {function} props.onLogout - The function to call when the logout button is clicked.
 */
function Header({ user, onLogout }) {

  // If there is no user, we don't need to show the complex header.
  // We can return null or a simplified version. For now, we'll return null.
  if (!user) {
    return null; 
  }

  // Get the user's initials for the profile icon fallback.
  // The '?' is optional chaining: it prevents errors if firstName or lastName are missing.
  const userInitials = `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`;

  return (
    <header className={styles.header}>
      {/* Left Side: Profile Link */}
      <Link to="/profile" className={styles.profileLink} aria-label="Go to your profile">
        {/* We can add logic here later to show a real avatar image if one exists */}
        <span className={styles.profileInitials}>{userInitials}</span>
      </Link>

      {/* Middle: Home Link */}
      <Link to="/home" className={styles.homeLink} aria-label="Go to home page">
        <FiHome />
      </Link>

      {/* Right Side: Logout Button */}
      <button onClick={onLogout} className={styles.logoutButton} aria-label="Logout">
        <FiLogOut />
      </button>
    </header>
  );
}

export default Header;