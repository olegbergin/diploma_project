/**
 * Business Registration Component
 * Form for registering new businesses similar to AuthPage
 * 
 * @component
 * @param {Function} onRegistrationSuccess - Callback when registration succeeds
 * @returns {JSX.Element} Business registration form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import useErrorHandler from '../../hooks/useErrorHandler';
import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';
import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';
import styles from '../Forms/Form.module.css';

function BusinessRegistration({ onRegistrationSuccess }) {
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { error, isLoading, handleError, clearError, executeWithErrorHandling } = useErrorHandler();

  // Form data state
  const [formData, setFormData] = useState({
    // Owner details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // Business details
    businessName: '',
    category: '',
    description: '',
    businessPhone: '',
    businessEmail: '',
    address: '',
    openingHours: ''
  });

  // Available business categories
  const businessCategories = [
    'בריאות ורפואה',
    'יופי וטיפוח',
    'חינוך והדרכה',
    'שירותים מקצועיים',
    'ספורט וכושר',
    'מזון ומשקאות',
    'אחר'
  ];

  // Validation function
  const validateInput = () => {
    clearError();

    // Owner details validation
    // Email validation 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(formData.email)) {
      handleError("נא להזין כתובת אימייל תקינה.");
      return false;
    }

    // Password validation (3-8 characters, alphanumeric with at least one letter and one number)
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{3,8}$/;
    if (!passwordRegex.test(formData.password)) {
      handleError("הסיסמה חייבת להכיל 3-8 תווים עם לפחות אות אחת וספרה אחת.");
      return false;
    }

    // First name validation (minimum 2 letters only)
    if (formData.firstName.length < 2 || !/^[A-Za-zא-ת]+$/.test(formData.firstName)) {
      handleError("השם הפרטי חייב להכיל רק אותיות ולהיות באורך מינימום של 2 תווים.");
      return false;
    }

    // Last name validation (minimum 2 letters only)
    if (formData.lastName.length < 2 || !/^[A-Za-zא-ת]+$/.test(formData.lastName)) {
      handleError("שם המשפחה חייב להכיל רק אותיות ולהיות באורך מינימום של 2 תווים.");
      return false;
    }

    // Phone validation
    const phoneRegex = /^[0-9+\-\s()]{10,}$/;
    if (!phoneRegex.test(formData.phone)) {
      handleError("נא להזין מספר טלפון תקין.");
      return false;
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      handleError("הסיסמאות אינן תואמות.");
      return false;
    }

    // Business details validation
    if (formData.businessName.length < 2) {
      handleError("שם העסק חייב להכיל לפחות 2 תווים.");
      return false;
    }

    if (!formData.category) {
      handleError("נא לבחור קטגוריה לעסק.");
      return false;
    }

    if (formData.description.length < 10) {
      handleError("תיאור העסק חייב להכיל לפחות 10 תווים.");
      return false;
    }

    if (formData.businessPhone && !phoneRegex.test(formData.businessPhone)) {
      handleError("נא להזין מספר טלפון עסק תקין.");
      return false;
    }

    if (formData.businessEmail && !emailRegex.test(formData.businessEmail)) {
      handleError("נא להזין כתובת אימייל עסק תקינה.");
      return false;
    }

    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) {
      clearError();
    }
  };

  const handleQuickFill = (businessType) => {
    if (businessType === 'yoga') {
      setFormData(prev => ({
        ...prev,
        // Owner details
        firstName: 'שרה',
        lastName: 'לוי',
        email: 'sarah.levy@zenflow.co.il',
        phone: '052-1234567',
        password: 'yoga123',
        confirmPassword: 'yoga123',
        // Business details
        businessName: 'זן פלו יוגה סטודיו',
        category: 'ספורט וכושר',
        description: 'סטודיו יוגה מודרני המציע שיעורי ויניאסה, האטה יוגה ומדיטציה בסביבה רגועה ומזמינה.',
        businessPhone: '03-6677889',
        businessEmail: 'info@zenflow.co.il',
        address: 'רחוב דיזנגוף 145, תל אביב',
        openingHours: 'ראשון-חמישי 7:00-21:00, שישי 7:00-15:00, שבת 9:00-18:00'
      }));
    } else if (businessType === 'cafe') {
      setFormData(prev => ({
        ...prev,
        // Owner details
        firstName: 'דני',
        lastName: 'כהן',
        email: 'danny.cohen@cornercafe.co.il',
        phone: '054-9876543',
        password: 'cafe456',
        confirmPassword: 'cafe456',
        // Business details
        businessName: 'קורנר קפה',
        category: 'מזון ומשקאות',
        description: 'בית קפה אינטימי עם קפה טרי, מאפים ביתיים וארוחות בוקר מפנקות. אווירה נעימה במרכז העיר.',
        businessPhone: '09-7788990',
        businessEmail: 'hello@cornercafe.co.il',
        address: 'רחוב הרצל 28, רמת גן',
        openingHours: 'ראשון-חמישי 7:00-20:00, שישי 7:00-16:00, שבת 8:00-15:00'
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateInput()) {
      return;
    }

    const registrationOperation = async () => {
      clearError();
      setSuccess('');

      const businessData = {
        // Owner details
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: "business",
        // Business details
        businessName: formData.businessName,
        category: formData.category,
        description: formData.description,
        businessPhone: formData.businessPhone || formData.phone,
        businessEmail: formData.businessEmail || formData.email,
        address: formData.address,
        openingHours: formData.openingHours
      };

      const response = await axiosInstance.post('/auth/register-business', businessData);
      setSuccess('רישום העסק הושלם בהצלחה! מעבר לעמוד ההתחברות בעוד');
      setCountdown(3);
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        category: '',
        description: '',
        businessPhone: '',
        businessEmail: '',
        address: '',
        openingHours: ''
      });

      // Call success callback if provided
      if (onRegistrationSuccess) {
        onRegistrationSuccess(response.data);
      }

      return response.data;
    };

    try {
      await executeWithErrorHandling(registrationOperation);
    } catch (err) {
      console.error('Business registration failed:', err);
    }
  };

  return (
    <div className={styles.formContainer}>
      <h1 className={styles.title}>רישום עסק חדש</h1>
      <p className={styles.subtitle}>
        מלא את הפרטים שלך ושל העסק ליצירת חשבון בעל עסק
      </p>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          error={error} 
          onClose={clearError}
          className={styles.errorMessage}
        />
      )}
      
      <form onSubmit={handleSubmit}>
        {/* Quick Fill Buttons */}
        <div className={styles.quickLoginContainer}>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={() => handleQuickFill('yoga')}
            disabled={isLoading}
          >
            🧘 יוגה סטודיו
          </button>
          <button
            type="button"
            className={styles.quickLoginButton}
            onClick={() => handleQuickFill('cafe')}
            disabled={isLoading}
          >
            ☕ בית קפה
          </button>
        </div>

        {/* Owner Details Section */}
        <div className={styles.sectionHeader}>
          <h2>פרטי בעל העסק</h2>
        </div>
        
        <div className={styles.inputGrid}>
          <input
            type="text"
            name="firstName"
            placeholder="שם פרטי"
            className={styles.inputField}
            value={formData.firstName}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <input
            type="text"
            name="lastName"
            placeholder="שם משפחה"
            className={styles.inputField}
            value={formData.lastName}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <input
            type="email"
            name="email"
            placeholder="אימייל אישי"
            className={styles.inputField}
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            autoComplete="email"
          />
          <input
            type="tel"
            name="phone"
            placeholder="מספר טלפון אישי"
            className={styles.inputField}
            value={formData.phone}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="סיסמה"
            className={styles.inputField}
            value={formData.password}
            onChange={handleInputChange}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="אימות סיסמה"
            className={styles.inputField}
            value={formData.confirmPassword}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
        </div>

        {/* Business Details Section */}
        <div className={styles.sectionHeader}>
          <h2>פרטי העסק</h2>
        </div>

        <div className={styles.inputGrid}>
          <input
            type="text"
            name="businessName"
            placeholder="שם העסק"
            className={styles.inputField}
            value={formData.businessName}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          />
          
          <select
            name="category"
            className={styles.inputField}
            value={formData.category}
            onChange={handleInputChange}
            required
            disabled={isLoading}
          >
            <option value="">בחר קטגוריה</option>
            {businessCategories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          
          <input
            type="tel"
            name="businessPhone"
            placeholder="טלפון העסק (אופציונלי)"
            className={styles.inputField}
            value={formData.businessPhone}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          
          <input
            type="email"
            name="businessEmail"
            placeholder="אימייל העסק (אופציונלי)"
            className={styles.inputField}
            value={formData.businessEmail}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          
          <input
            type="text"
            name="address"
            placeholder="כתובת העסק"
            className={styles.inputField}
            value={formData.address}
            onChange={handleInputChange}
            disabled={isLoading}
          />
          
          <input
            type="text"
            name="openingHours"
            placeholder="שעות פעילות (לדוגמה: ראשון-חמישי 9:00-17:00)"
            className={styles.inputField}
            value={formData.openingHours}
            onChange={handleInputChange}
            disabled={isLoading}
          />
        </div>

        <textarea
          name="description"
          placeholder="תיאור העסק (מינימום 10 תווים)"
          className={`${styles.inputField} ${styles.textareaField}`}
          value={formData.description}
          onChange={handleInputChange}
          required
          disabled={isLoading}
          rows={4}
        />

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading && <LoadingSpinner size="small" color="white" className={styles.buttonSpinner} />}
          {isLoading ? 'רושם עסק...' : 'רשום עסק'}
        </button>

        {/* Success Display */}
        {success && (
          <ErrorMessage 
            error={countdown > 0 ? `${success} ${countdown} שניות` : success}
            type="success"
            onClose={() => {
              setSuccess('');
              setCountdown(0);
            }}
            className={styles.successMessage}
          />
        )}

        {/* Login Link */}
        <button
          type="button"
          className={styles.switchLink}
          onClick={() => navigate('/login')}
          disabled={isLoading}
        >
          כבר יש לך חשבון? התחבר כאן
        </button>
      </form>
    </div>
  );
}

export default BusinessRegistration;