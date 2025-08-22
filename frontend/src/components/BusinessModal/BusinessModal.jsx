/**
 * Business Modal Component
 * Displays business services with booking functionality
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.business - Business information object
 * @param {boolean} props.isOpen - Whether modal is open
 * @param {Function} props.onClose - Function to close modal
 * @returns {JSX.Element|null} Business modal with services and booking buttons
 */

import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './BusinessModal.module.css';

function BusinessModal({ business, isOpen, onClose }) {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Try to fetch services - if endpoint doesn't exist, we'll show basic info
        const response = await axiosInstance.get(`/businesses/${business.businessId}/services`);
        setServices(response.data || []);
      } catch (err) {
        console.log('Services endpoint not available:', err);
        setServices([]); // No services available
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && business?.businessId) {
      fetchServices();
    }
  }, [isOpen, business?.businessId]);

  if (!isOpen || !business) return null;

  const handleBackdropClick = (e) => {
    // Only close if clicking directly on the backdrop, not on child elements
    if (e.target.classList.contains(styles.modalBackdrop)) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    // Prevent event bubbling to backdrop
    e.stopPropagation();
  };

  /**
   * Handles booking navigation with service and business data
   * @param {Object} service - Selected service object
   */
  const handleBookService = (service) => {
    // Navigate to booking page with business and service data
    navigate(`/booking/${business.businessId}/${service.serviceId}`, {
      state: {
        business,
        service
      }
    });
    onClose(); // Close modal after navigation
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent} dir="rtl" onClick={handleModalContentClick}>
        <div className={styles.modalHeader}>
          <h2>{business.name || business.business_name}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <FiX />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Services Section Only */}
          <div className={styles.servicesSection}>
            {isLoading ? (
              <div className={styles.loading}>טוען שירותים...</div>
            ) : error ? (
              <div className={styles.error}>שגיאה בטעינת השירותים</div>
            ) : services.length > 0 ? (
              <div className={styles.servicesList}>
                {services.map(service => (
                  <div key={service.serviceId} className={styles.serviceItem}>
                    <div className={styles.serviceInfo}>
                      <div className={styles.serviceName}>{service.name}</div>
                      <div className={styles.serviceDetails}>
                        <div className={styles.servicePrice}>₪{service.price}</div>
                        {service.duration && (
                          <div className={styles.serviceDuration}>{service.duration} דקות</div>
                        )}
                      </div>
                      {service.description && (
                        <div className={styles.serviceDescription}>{service.description}</div>
                      )}
                    </div>
                    <button 
                      className={styles.bookButton}
                      onClick={() => handleBookService(service)}
                      aria-label={`להזמין ${service.name}`}
                    >
                      להזמין
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className={styles.noServices}>אין שירותים זמינים כרגע</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default BusinessModal;