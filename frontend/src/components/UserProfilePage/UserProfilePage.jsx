// src/components/UserProfilePage/UserProfilePage.jsx

// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEdit, FiSave, FiXCircle, FiKey, FiCalendar, FiHeart, FiLogOut } from 'react-icons/fi';
import formStyles from '../Forms/Form.module.css';
import pageStyles from './UserProfilePage.module.css';
import axiosInstance from '../../api/axiosInstance'; // Import axios

function UserProfilePage({ user, onLogout }) {
  // --- State Hooks (no changes) ---
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });

  // --- Effect to fetch fresh user data ---
  useEffect(() => {
    // --- DEBUGGING STEP: Let's log the user object ---
    // This will show us in the browser console exactly what properties the user object has.
    // We are looking for 'user_id'.
    console.log("User object received by profile page:", user);

    if (user?.user_id) {
      setIsLoading(true);
      axiosInstance.get(`/users/${user.user_id}`)
        .then(response => {
          const freshUserData = response.data;
          setFormData({
            firstName: freshUserData.first_name || '',
            lastName: freshUserData.last_name || '',
            phone: freshUserData.phone || '',
          });
        })
        .catch(err => {
          // This is where your error is being caught
          console.error("Failed to fetch user profile:", err);
          setError("Could not load profile information.");
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      // If we get here, it means user.user_id is missing.
      setError("Cannot load profile: User ID is missing.");
      setIsLoading(false);
    }
  }, [user]); // We change the dependency to `user` to re-run if the whole object changes.

  // --- Event Handlers (No changes needed) ---
  const handleEditToggle = () => { /* ... your existing code ... */ };
  const handleInputChange = (event) => { /* ... your existing code ... */ };
  const handleSaveChanges = (event) => { /* ... your existing code ... */ };

  // --- Conditional Renders ---
  // If the page is loading, show a loading message
  if (isLoading) {
    return <div className={pageStyles.loading}>Loading user profile...</div>;
  }
  // If there was an error, show an error message
  if (error) {
    return <div className={pageStyles.error}>{error}</div>;
  }
  // If there's no user object at all (e.g., user logged out), show nothing.
  if (!user) {
    return null;
  }

  // --- JSX for Rendering (No changes needed here) ---
  return (
    <div className={pageStyles.profilePage} >
      <div className={pageStyles.profileCard} dir="rtl">
        {/* --- Profile Header --- */}
        <div className={pageStyles.profileHeader}>
          <div className={pageStyles.avatar}>
            <span>{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
          </div>
          <h2>{user.firstName} {user.lastName}</h2>
          <p className={pageStyles.email}>{user.email}</p>
        </div>

        {/* --- Profile Details Form --- */}
        <form onSubmit={handleSaveChanges} className={pageStyles.detailsForm}>
          <h3>פרטים אישיים</h3>

          <div className={pageStyles.fieldGroup}>
            <label>שם פרטי</label>
            <input
              type="text"
              name="firstName"
              className={formStyles.inputField}
              value={formData.firstName} // This value is now guaranteed to be a string
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className={pageStyles.fieldGroup}>
            <label>שם משפחה</label>
            <input
              type="text"
              name="lastName"
              className={formStyles.inputField}
              value={formData.lastName} // This value is now guaranteed to be a string
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          <div className={pageStyles.fieldGroup}>
            <label>מספר טלפון</label>
            <input
              type="tel"
              name="phone"
              className={formStyles.inputField}
              value={formData.phone} // This value is now guaranteed to be a string
              onChange={handleInputChange}
              disabled={!isEditing}
            />
          </div>

          {/* --- Action Buttons for Editing --- */}
          <div className={pageStyles.editActions}>
            {!isEditing ? (
              <button type="button" className={formStyles.submitButton} onClick={handleEditToggle}>
                <FiEdit /> עריכת פרופיל
              </button>
            ) : (
              <div className={pageStyles.saveCancelGroup}>
                <button type="submit" className={formStyles.submitButton}>
                  <FiSave /> שמור שינויים
                </button>
                <button type="button" className={`${formStyles.submitButton} ${pageStyles.cancelButton}`} onClick={handleEditToggle}>
                  <FiXCircle /> ביטול
                </button>
              </div>
            )}
          </div>
        </form>

        {/* --- Account Actions Section --- */}
        <div className={pageStyles.actionsSection}>
          <h3>פעולות בחשבון</h3>
          <Link to="/my-appointments" className={pageStyles.actionLink}>
            <FiCalendar />
            <span>ההזמנות שלי</span>
          </Link>
          <Link to="/my-favorites" className={pageStyles.actionLink}>
            <FiHeart />
            <span>העסקים שאהבתי</span>
          </Link>
          <Link to="/change-password" className={pageStyles.actionLink}>
            <FiKey />
            <span>שנה סיסמה</span>
          </Link>
          <button onClick={onLogout} className={`${pageStyles.actionLink} ${pageStyles.logoutButton}`}>
            <FiLogOut />
            <span>התנתק</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserProfilePage;