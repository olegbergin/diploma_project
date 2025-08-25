import React, { useState, useEffect } from 'react';
import styles from './ProfileModal.module.css';
import axiosInstance from '../../../api/axiosInstance';
import ErrorMessage from '../../shared/ErrorMessage/ErrorMessage';
import LoadingSpinner from '../../shared/LoadingSpinner/LoadingSpinner';

export default function ProfileModal({ user, isOpen, onClose, onUpdateSuccess }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setError('');
      setSuccess('');
      setShowPasswordSection(false);
      setIsSubmitted(false);
    }
  }, [isOpen, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    // Basic info validation
    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      return 'שם פרטי חייב להכיל לפחות 2 תווים';
    }
    
    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      return 'שם משפחה חייב להכיל לפחות 2 תווים';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      return 'נא להזין כתובת אימייל תקינה';
    }

    // Phone validation (optional but if provided should be valid)
    if (formData.phone && formData.phone.length < 9) {
      return 'מספר טלפון חייב להכיל לפחות 9 ספרות';
    }

    // Password validation (only if changing password)
    if (showPasswordSection) {
      if (!formData.currentPassword) {
        return 'נא להזין את הסיסמה הנוכחית';
      }
      
      if (formData.newPassword) {
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
        if (!passwordRegex.test(formData.newPassword)) {
          return 'סיסמה חדשה חייבת להכיל 3-8 תווים עם לפחות אות אחת ומספר אחד';
        }
        
        if (formData.newPassword !== formData.confirmPassword) {
          return 'הסיסמאות לא תואמות';
        }
      }
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setIsSubmitted(true);

    try {
      // Update profile data
      const profileData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };

      await axiosInstance.put(`/users/${user.userId}`, profileData);

      // Update password if requested
      if (showPasswordSection && formData.newPassword) {
        const passwordData = {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword
        };
        
        await axiosInstance.post(`/users/${user.userId}/change-password`, passwordData);
      }
      
      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim()
      };
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
      
      const successMessage = showPasswordSection && formData.newPassword 
        ? 'הפרופיל והסיסמה עודכנו בהצלחה!'
        : 'הפרופיל עודכן בהצלחה!';
      
      setSuccess(successMessage);
      
      // Call success callback
      if (onUpdateSuccess) {
        onUpdateSuccess(updatedUser);
      }
      
      // Close modal after success with longer delay to show success message
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response?.data?.errors) {
        // Handle field-specific errors from backend
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).join(', ');
        setError(errorMessages);
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('שגיאה בעדכון הפרופיל. נסה שוב.');
      }
    } finally {
      setLoading(false);
      // Don't reset isSubmitted here to prevent flickering
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>עריכת פרופיל</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <ErrorMessage 
              error={error} 
              onClose={() => setError('')}
              className={styles.errorMessage}
            />
          )}
          
          {success && (
            <ErrorMessage 
              error={success}
              type="success"
              onClose={() => setSuccess('')}
              className={styles.successMessage}
            />
          )}

          <div className={styles.formSection}>
            <h3>פרטים אישיים</h3>
            
            <div className={styles.inputGroup}>
              <label htmlFor="firstName">שם פרטי</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastName">שם משפחה</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email">אימייל</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="phone">טלפון</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={styles.input}
                disabled={loading}
              />
            </div>
          </div>

          <div className={styles.formSection}>
            <div className={styles.passwordToggle}>
              <button
                type="button"
                className={styles.toggleButton}
                onClick={() => setShowPasswordSection(!showPasswordSection)}
                disabled={loading}
              >
                {showPasswordSection ? 'ביטול שינוי סיסמה' : 'שינוי סיסמה'}
              </button>
            </div>

            {showPasswordSection && (
              <>
                <h3>שינוי סיסמה</h3>
                
                <div className={styles.inputGroup}>
                  <label htmlFor="currentPassword">סיסמה נוכחית</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                    disabled={loading}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="newPassword">סיסמה חדשה</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                    disabled={loading}
                    placeholder="3-8 תווים עם אות ומספר"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="confirmPassword">אימות סיסמה חדשה</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={styles.input}
                    disabled={loading}
                  />
                </div>
              </>
            )}
          </div>

          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={handleClose}
              disabled={loading}
            >
              ביטול
            </button>
            
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading && <LoadingSpinner size="small" color="white" className={styles.buttonSpinner} />}
              {loading ? 'שומר שינויים...' : 'שמור שינויים'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}