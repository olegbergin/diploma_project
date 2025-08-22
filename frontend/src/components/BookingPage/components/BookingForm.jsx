/**
 * Booking Form Component
 * Form for collecting customer information and booking details
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.business - Business information
 * @param {Object} props.service - Service information
 * @param {string} props.selectedDate - Selected date
 * @param {string} props.selectedTime - Selected time
 * @param {Function} props.onSubmit - Callback when form is submitted
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Booking form component
 */

import React, { useState, useEffect } from 'react';
import { FiUser, FiPhone, FiMail, FiMessageSquare, FiAlertCircle } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import styles from './BookingForm.module.css';

export default function BookingForm({ 
  business, 
  service, 
  selectedDate, 
  selectedTime, 
  onSubmit, 
  initialData = {},
  isLoading = false 
}) {
  const [formData, setFormData] = useState({
    firstName: initialData.firstName || '',
    lastName: initialData.lastName || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    notes: initialData.notes || ''
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);

  // Load user data from server if user is logged in
  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = localStorage.getItem('userInfo');
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          if (user.id || user.user_id) {
            setIsLoadingUserData(true);
            const userId = user.id || user.user_id;
            
            // Fetch fresh user data from server
            const response = await axiosInstance.get(`/users/${userId}`);
            const userData = response.data;
            
            setFormData(prev => ({
              ...prev,
              firstName: userData.first_name || '',
              lastName: userData.last_name || '',
              phone: userData.phone || '',
              email: userData.email || ''
            }));
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          // Fallback to localStorage data
          const user = JSON.parse(userInfo);
          setFormData(prev => ({
            ...prev,
            firstName: user.firstName || user.first_name || '',
            lastName: user.lastName || user.last_name || '',
            phone: user.phone || '',
            email: user.email || ''
          }));
        } finally {
          setIsLoadingUserData(false);
        }
      }
    };

    fetchUserData();
  }, []);

  /**
   * Validate form field
   */
  const validateField = (name, value) => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'שם פרטי נדרש';
        if (value.trim().length < 2) return 'שם פרטי חייב להכיל לפחות 2 תווים';
        return '';
      
      case 'lastName':
        if (!value.trim()) return 'שם משפחה נדרש';
        if (value.trim().length < 2) return 'שם משפחה חייב להכיל לפחות 2 תווים';
        return '';
      
      case 'phone': {
        if (!value.trim()) return 'מספר טלפון נדרש';
        const phoneRegex = /^0[2-9]\d{7,8}$/;
        if (!phoneRegex.test(value.replace(/[-\s]/g, ''))) {
          return 'מספר טלפון לא תקין';
        }
        return '';
      }
      
      case 'email': {
        if (!value.trim()) return 'כתובת אימייל נדרשת';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'כתובת אימייל לא תקינה';
        return '';
      }
      
      case 'notes':
        if (value.length > 500) return 'הערות לא יכולות להכיל יותר מ-500 תווים';
        return '';
      
      default:
        return '';
    }
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Handle input blur
   */
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Validate entire form
   */
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    
    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare booking data
    const bookingData = {
      businessId: business?.businessId,
      serviceId: service?.serviceId,
      date: selectedDate,
      time: selectedTime,
      customerInfo: {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.replace(/[-\s]/g, ''),
        email: formData.email.trim(),
        notes: formData.notes.trim()
      },
      serviceName: service?.name || '',
      servicePrice: service?.price || 0,
      serviceDuration: service?.duration || 0
    };

    onSubmit(bookingData);
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format phone number while typing
   */
  const formatPhoneNumber = (value) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }
    return value;
  };

  const isFormValid = Object.keys(errors).every(key => !errors[key]) && 
                     Object.keys(formData).every(key => formData[key].trim() !== '' || key === 'notes');

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>פרטי הזמנה</h2>
        
        {/* Booking Summary */}
        <div className={styles.bookingSummary}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>שירות:</span>
            <span className={styles.summaryValue}>{service?.service_name || 'לא נבחר שירות'}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>תאריך:</span>
            <span className={styles.summaryValue}>{formatDate(selectedDate)}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>שעה:</span>
            <span className={styles.summaryValue}>{selectedTime}</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>משך:</span>
            <span className={styles.summaryValue}>{service?.duration || 0} דקות</span>
          </div>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>מחיר:</span>
            <span className={styles.summaryValue}>₪{service?.price || 0}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Personal Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiUser className={styles.sectionIcon} />
            פרטים אישיים
          </h3>
          
          {isLoadingUserData && (
            <div className={styles.loadingMessage}>
              טוען את הפרטים שלך מהמערכת...
            </div>
          )}
          
          {!isLoadingUserData && formData.firstName && (
            <div className={styles.infoMessage}>
              הפרטים שלך נטענו אוטומטית מהמערכת. ניתן לעדכן אותם לפי הצורך.
            </div>
          )}

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.label}>
                שם פרטי *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${errors.firstName && touched.firstName ? styles.inputError : ''}`}
                placeholder="הכנס שם פרטי"
                disabled={isLoading || isLoadingUserData}
              />
              {errors.firstName && touched.firstName && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.firstName}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.label}>
                שם משפחה *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${errors.lastName && touched.lastName ? styles.inputError : ''}`}
                placeholder="הכנס שם משפחה"
                disabled={isLoading || isLoadingUserData}
              />
              {errors.lastName && touched.lastName && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.lastName}
                </span>
              )}
            </div>
          </div>

          <div className={styles.inputRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="phone" className={styles.label}>
                <FiPhone className={styles.labelIcon} />
                מספר טלפון *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={(e) => {
                  const formatted = formatPhoneNumber(e.target.value);
                  setFormData(prev => ({ ...prev, phone: formatted }));
                }}
                onBlur={handleBlur}
                className={`${styles.input} ${errors.phone && touched.phone ? styles.inputError : ''}`}
                placeholder="050-123-4567"
                disabled={isLoading || isLoadingUserData}
              />
              {errors.phone && touched.phone && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.phone}
                </span>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                <FiMail className={styles.labelIcon} />
                כתובת אימייל *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`${styles.input} ${errors.email && touched.email ? styles.inputError : ''}`}
                placeholder="example@email.com"
                disabled={isLoading || isLoadingUserData}
              />
              {errors.email && touched.email && (
                <span className={styles.errorMessage}>
                  <FiAlertCircle className={styles.errorIcon} />
                  {errors.email}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            <FiMessageSquare className={styles.sectionIcon} />
            הערות נוספות
          </h3>

          <div className={styles.inputGroup}>
            <label htmlFor="notes" className={styles.label}>
              הערות (אופציונלי)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`${styles.textarea} ${errors.notes && touched.notes ? styles.inputError : ''}`}
              placeholder="הוסף הערות או דרישות מיוחדות..."
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <div className={styles.characterCount}>
              {formData.notes.length}/500 תווים
            </div>
            {errors.notes && touched.notes && (
              <span className={styles.errorMessage}>
                <FiAlertCircle className={styles.errorIcon} />
                {errors.notes}
              </span>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className={styles.submitSection}>
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className={`${styles.submitButton} ${!isFormValid ? styles.submitButtonDisabled : ''}`}
          >
            {isLoading ? (
              <>
                <div className={styles.loadingSpinner} />
                <span>שולח...</span>
              </>
            ) : (
              <span>אשר הזמנה</span>
            )}
          </button>
          
          <p className={styles.disclaimer}>
            לחיצה על "אשר הזמנה" מהווה הסכמה לתנאי השירות
          </p>
        </div>
      </form>
    </div>
  );
}