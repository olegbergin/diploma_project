/**
 * Booking Page Component
 * Main page for booking appointments with step-by-step process
 * 
 * @component
 * @returns {JSX.Element} Booking page with service selection, calendar, and form
 */

import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';
import ServiceSummary from './components/ServiceSummary';
import CalendarPicker from './components/CalendarPicker';
import TimeSlotPicker from './components/TimeSlotPicker';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import styles from './BookingPage.module.css';

const BOOKING_STEPS = {
  SUMMARY: 'summary',
  CALENDAR: 'calendar',
  TIME: 'time',
  FORM: 'form',
  CONFIRMATION: 'confirmation'
};

export default function BookingPage() {
  const { businessId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // State from navigation or fetch from API
  const [business, setBusiness] = useState(location.state?.business || null);
  const [service, setService] = useState(location.state?.service || null);
  
  // Booking process state
  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SUMMARY);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerData, setCustomerData] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Fetch business and service data if not provided via navigation
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!business || !service) {
        setIsLoading(true);
        try {
          // Fetch business data
          if (!business) {
            const businessResponse = await axiosInstance.get(`/businesses/${businessId}`);
            setBusiness(businessResponse.data);
          }
          
          // Fetch service data  
          if (!service) {
            const servicesResponse = await axiosInstance.get(`/businesses/${businessId}/services`);
            const foundService = servicesResponse.data.find(s => s.service_id === parseInt(serviceId));
            if (foundService) {
              setService(foundService);
            } else {
              setError('Service not found');
            }
          }
        } catch (err) {
          console.error('Failed to fetch booking data:', err);
          setError('Failed to load booking information');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (businessId && serviceId) {
      fetchData();
    }
  }, [businessId, serviceId, business, service]);

  /**
   * Fetch available time slots for selected date
   */
  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/availability?date=${date}&serviceId=${serviceId}`
      );
      setAvailableSlots(response.data.availableSlots || []);
    } catch (err) {
      console.error('Failed to fetch availability:', err);
      // Fallback to default slots
      setAvailableSlots(['09:00', '10:00', '11:00', '14:00', '15:00', '16:00']);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle date selection
   */
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
    fetchAvailableSlots(date);
    setCurrentStep(BOOKING_STEPS.TIME);
  };

  /**
   * Handle time slot selection
   */
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(BOOKING_STEPS.FORM);
  };

  /**
   * Handle customer form submission
   */
  const handleFormSubmit = (formData) => {
    setCustomerData(formData);
    setCurrentStep(BOOKING_STEPS.CONFIRMATION);
  };

  /**
   * Handle final booking confirmation
   */
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      const bookingData = {
        businessId: parseInt(businessId),
        serviceId: parseInt(serviceId),
        date: selectedDate,
        time: selectedTime,
        ...customerData
      };

      const response = await axiosInstance.post('/appointments', bookingData);
      
      // Success - redirect to user dashboard with success message
      const currentUser = JSON.parse(localStorage.getItem("userInfo"));
      if (currentUser) {
        navigate(`/user/${currentUser.id}/dashboard`, {
          state: { 
            message: 'הזמנה נוצרה בהצלחה!', 
            appointmentId: response.data.appointmentId 
          }
        });
      } else {
        navigate('/home', {
          state: { 
            message: 'הזמנה נוצרה בהצלחה!' 
          }
        });
      }
    } catch (err) {
      console.error('Failed to create appointment:', err);
      setError('שגיאה ביצירת התור. אנא נסה שוב.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to previous step
   */
  const handlePreviousStep = () => {
    switch (currentStep) {
      case BOOKING_STEPS.TIME:
        setCurrentStep(BOOKING_STEPS.CALENDAR);
        break;
      case BOOKING_STEPS.FORM:
        setCurrentStep(BOOKING_STEPS.TIME);
        break;
      case BOOKING_STEPS.CONFIRMATION:
        setCurrentStep(BOOKING_STEPS.FORM);
        break;
      default:
        navigate(-1); // Go back to previous page
    }
  };

  // Progress calculation
  const stepOrder = Object.values(BOOKING_STEPS);
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  if (isLoading && !business) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>טוען נתוני הזמנה...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>{error}</div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          חזור
        </button>
      </div>
    );
  }

  if (!business || !service) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.error}>לא נמצאו נתוני העסק או השירות</div>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          חזור
        </button>
      </div>
    );
  }

  return (
    <div className={styles.bookingContainer} dir="rtl">
      {/* Header with progress */}
      <div className={styles.header}>
        <button onClick={handlePreviousStep} className={styles.backButton}>
          <FiArrowRight />
          <span>חזור</span>
        </button>
        <h1 className={styles.title}>הזמנת תור</h1>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Service Summary - Always visible */}
      <ServiceSummary 
        business={business}
        service={service}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      {/* Step Content */}
      <div className={styles.stepContent}>
        {currentStep === BOOKING_STEPS.SUMMARY && (
          <div className={styles.summaryStep}>
            <h2>בחרת את השירות</h2>
            <p>לחץ 'המשך' כדי לבחור תאריך ושעה</p>
            <button 
              onClick={() => setCurrentStep(BOOKING_STEPS.CALENDAR)}
              className={styles.continueButton}
            >
              המשך
            </button>
          </div>
        )}

        {currentStep === BOOKING_STEPS.CALENDAR && (
          <CalendarPicker 
            businessId={businessId}
            serviceId={serviceId}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
          />
        )}

        {currentStep === BOOKING_STEPS.TIME && selectedDate && (
          <TimeSlotPicker
            date={selectedDate}
            availableSlots={availableSlots}
            onTimeSelect={handleTimeSelect}
            selectedTime={selectedTime}
            serviceDuration={service.duration}
            isLoading={isLoading}
          />
        )}

        {currentStep === BOOKING_STEPS.FORM && (
          <BookingForm
            business={business}
            service={service}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSubmit={handleFormSubmit}
            initialData={customerData}
            isLoading={isLoading}
          />
        )}

        {currentStep === BOOKING_STEPS.CONFIRMATION && (
          <BookingConfirmation
            business={business}
            service={service}
            date={selectedDate}
            time={selectedTime}
            customerData={customerData}
            onConfirm={handleConfirmBooking}
            onEdit={() => setCurrentStep(BOOKING_STEPS.FORM)}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}