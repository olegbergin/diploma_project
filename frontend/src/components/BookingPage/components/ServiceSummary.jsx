/**
 * Service Summary Component
 * Displays selected service information and booking details
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.business - Business information
 * @param {Object} props.service - Selected service information
 * @param {string} props.selectedDate - Selected appointment date
 * @param {string} props.selectedTime - Selected appointment time
 * @returns {JSX.Element} Service summary card
 */

import React from 'react';
import { FiMapPin, FiClock, FiDollarSign, FiCalendar } from 'react-icons/fi';
import styles from './ServiceSummary.module.css';

export default function ServiceSummary({ business, service, selectedDate, selectedTime }) {
  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  };

  /**
   * Format time for display
   */
  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString;
  };

  return (
    <div className={styles.summaryCard}>
      {/* Business Info */}
      <div className={styles.businessInfo}>
        <div className={styles.businessImage}>
          {business.image_url ? (
            <img 
              src={business.image_url} 
              alt={business.name}
              className={styles.businessImg}
            />
          ) : (
            <div className={styles.businessPlaceholder}>
              {business.name?.charAt(0)}
            </div>
          )}
        </div>
        
        <div className={styles.businessDetails}>
          <h2 className={styles.businessName}>{business.name}</h2>
          {business.address && (
            <div className={styles.businessAddress}>
              <FiMapPin className={styles.icon} />
              <span>{business.address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Service Details */}
      <div className={styles.serviceDetails}>
        <h3 className={styles.serviceName}>{service.name}</h3>
        
        <div className={styles.serviceInfo}>
          <div className={styles.serviceItem}>
            <FiDollarSign className={styles.icon} />
            <span className={styles.servicePrice}>₪{service.price}</span>
          </div>
          
          {service.duration && (
            <div className={styles.serviceItem}>
              <FiClock className={styles.icon} />
              <span className={styles.serviceDuration}>{service.duration} דקות</span>
            </div>
          )}
        </div>

        {service.description && (
          <p className={styles.serviceDescription}>{service.description}</p>
        )}
      </div>

      {/* Selected Date & Time */}
      {(selectedDate || selectedTime) && (
        <div className={styles.appointmentDetails}>
          <h4 className={styles.appointmentTitle}>פרטי התור</h4>
          
          <div className={styles.appointmentInfo}>
            {selectedDate && (
              <div className={styles.appointmentItem}>
                <FiCalendar className={styles.icon} />
                <span className={styles.appointmentDate}>
                  {formatDate(selectedDate)}
                </span>
              </div>
            )}
            
            {selectedTime && (
              <div className={styles.appointmentItem}>
                <FiClock className={styles.icon} />
                <span className={styles.appointmentTime}>
                  {formatTime(selectedTime)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status indicator */}
      <div className={styles.statusIndicator}>
        <div className={`${styles.statusDot} ${selectedDate && selectedTime ? styles.complete : styles.incomplete}`} />
        <span className={styles.statusText}>
          {selectedDate && selectedTime ? 'מוכן לאישור' : 'בתהליך בחירה'}
        </span>
      </div>
    </div>
  );
}