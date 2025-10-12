/**
 * ServiceList Component
 * Displays business services with booking functionality
 * Extracted from BusinessModal for reusability
 * 
 * @component
 * @param {Object} props - Component props
 * @param {number} props.businessId - Business ID for fetching services
 * @param {Array} props.services - Optional pre-loaded services array
 * @param {Function} props.onBookService - Function to handle service booking
 * @param {boolean} props.showBookButton - Whether to show booking buttons
 * @returns {JSX.Element} Services list with optional booking functionality
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import styles from './ServiceList.module.css';

function ServiceList({ 
  businessId, 
  services: propServices, 
  onBookService,
  showBookButton = true 
}) {
  const navigate = useNavigate();
  const [services, setServices] = useState(propServices || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Only fetch if we don't have services provided and have a businessId
    if (!propServices && businessId) {
      const fetchServices = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axiosInstance.get(`/businesses/${businessId}/services`);
          setServices(response.data || []);
        } catch (err) {
          console.log('Services endpoint not available:', err);
          setServices([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchServices();
    }
  }, [businessId, propServices]);

  // Update services if propServices changes
  useEffect(() => {
    if (propServices) {
      setServices(propServices);
    }
  }, [propServices]);

  /**
   * Handles booking navigation with service data
   * @param {Object} service - Selected service object
   */
  const handleBookService = (service) => {
    if (onBookService) {
      onBookService(service);
    } else {
      // Default behavior: navigate to booking page
      navigate(`/booking/${businessId}/${service.serviceId}`, {
        state: {
          businessId,
          service
        }
      });
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>טוען שירותים...</div>;
  }

  if (error) {
    return <div className={styles.error}>שגיאה בטעינת השירותים</div>;
  }

  if (services.length === 0) {
    return <p className={styles.noServices}>אין שירותים זמינים כרגע</p>;
  }

  return (
    <div className={styles.servicesList}>
      {services.map(service => (
        <div key={service.serviceId || service.id} className={styles.serviceItem}>
          <div className={styles.serviceInfo}>
            <div className={styles.serviceName}>
              {service.name || service.service_name}
            </div>
            <div className={styles.serviceDetails}>
              <div className={styles.servicePrice}>
                ₪{service.price}
              </div>
              {(service.duration || service.duration_minutes) && (
                <div className={styles.serviceDuration}>
                  {service.duration || service.duration_minutes} דקות
                </div>
              )}
            </div>
            {service.description && (
              <div className={styles.serviceDescription}>
                {service.description}
              </div>
            )}
          </div>
          {showBookButton && (
            <button 
              className={styles.bookButton}
              onClick={() => handleBookService(service)}
              aria-label={`להזמין ${service.name || service.service_name}`}
            >
              להזמין
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ServiceList;