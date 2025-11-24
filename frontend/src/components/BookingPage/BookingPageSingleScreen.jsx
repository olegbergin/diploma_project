/**
 * Single-Screen Booking Page Component
 * Modern UX with all booking steps on one page using progressive disclosure
 * All date handling uses local timezone to avoid weekday mismatch issues
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { FiCalendar, FiClock, FiUser, FiCheck, FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import axiosInstance from '../../api/axiosInstance';
import {
  getLocalDateString,
  parseLocalDate,
  formatHebrewDate,
  formatDateTime,
  getTodayString,
  isPastDate,
  isToday,
  getMonthString,
  addDays,
  getDayOfWeek
} from '../../utils/dateUtils';
import styles from './BookingPageSingleScreen.module.css';

export default function BookingPageSingleScreen() {
  const { businessId, serviceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Business and service data
  const [business, setBusiness] = useState(location.state?.business || null);
  const [service, setService] = useState(location.state?.service || null);

  // Booking selections
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerData, setCustomerData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    notes: ''
  });

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [availability, setAvailability] = useState({});
  const [timeSlots, setTimeSlots] = useState([]);

  // UI state
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Hebrew month and day names
  const monthNames = ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'];
  // Start week with Sunday (א)
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  // Load business and service data
  useEffect(() => {
    const loadData = async () => {
      try {
        if (!business) {
          const bizResponse = await axiosInstance.get(`/businesses/${businessId}`);
          setBusiness(bizResponse.data);
        }

        if (!service) {
          const serviceResponse = await axiosInstance.get(`/businesses/${businessId}/services/${serviceId}`);
          setService(serviceResponse.data);
        }

        // Load user data from database if logged in
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo);
            const userId = user.id || user.userId;

            if (userId) {
              // Fetch fresh user data from database
              const userResponse = await axiosInstance.get(`/users/${userId}`);
              const userData = userResponse.data;

              setCustomerData(prev => ({
                ...prev,
                firstName: userData.firstName || '',
                lastName: userData.lastName || '',
                phone: userData.phone || '',
                email: userData.email || ''
              }));
            }
          } catch (userErr) {
            console.error('Error loading user data:', userErr);
            // If API fails, don't show error, just leave form empty
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('שגיאה בטעינת הנתונים');
      }
    };

    loadData();
  }, [businessId, serviceId, business, service]);

  // Load calendar availability for current month
  useEffect(() => {
    const loadAvailability = async () => {
      setIsLoadingCalendar(true);
      try {
        const monthStr = getMonthString(currentMonth);
        const response = await axiosInstance.get(
          `/businesses/${businessId}/calendar?month=${monthStr}&serviceId=${serviceId}`
        );

        // Convert array to object keyed by date
        const availabilityMap = {};
        response.data.availableDates?.forEach(item => {
          availabilityMap[item.date] = {
            available: item.available,
            slots: item.availableSlots || 0
          };
        });

        setAvailability(availabilityMap);
      } catch (err) {
        console.error('Error loading availability:', err);
      } finally {
        setIsLoadingCalendar(false);
      }
    };

    if (businessId && serviceId) {
      loadAvailability();
    }
  }, [businessId, serviceId, currentMonth]);

  // Load time slots when date is selected
  useEffect(() => {
    if (!selectedDate) {
      setTimeSlots([]);
      return;
    }

    const loadTimeSlots = async () => {
      setIsLoadingSlots(true);
      try {
        const response = await axiosInstance.get(
          `/businesses/${businessId}/availability?date=${selectedDate}&serviceId=${serviceId}`
        );

        if (response.data.isClosed) {
          setTimeSlots([]);
          setError(response.data.message || 'העסק סגור ביום זה');
        } else {
          setTimeSlots(response.data.availableSlots || []);
          setError('');
        }
      } catch (err) {
        console.error('Error loading time slots:', err);
        setError('שגיאה בטעינת זמנים פנויים');
        setTimeSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    loadTimeSlots();
  }, [selectedDate, businessId, serviceId]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Start from the last Sunday of previous month
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    // dayOfWeek: 0=Sunday, 1=Monday, etc.
    // If first day is Sunday (0), start from it; otherwise go back to previous Sunday
    const daysToSubtract = dayOfWeek;
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    const days = [];
    const todayStr = getTodayString();

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dateStr = getLocalDateString(date);
      const isCurrentMonth = date.getMonth() === month;
      const isPast = isPastDate(dateStr);
      const isTodayDate = isToday(dateStr);
      const isSelected = dateStr === selectedDate;

      const dayAvailability = availability[dateStr];
      const slotsCount = dayAvailability?.slots || 0;

      // Determine availability level for color coding
      let availabilityLevel = 'none';
      if (dayAvailability) {
        if (dayAvailability.available === false) {
          // Day off or exception (business closed)
          availabilityLevel = 'closed';
        } else if (dayAvailability.available === true) {
          if (slotsCount === 0) {
            availabilityLevel = 'closed';
          } else if (slotsCount <= 3) {
            availabilityLevel = 'low';
          } else if (slotsCount <= 8) {
            availabilityLevel = 'medium';
          } else {
            availabilityLevel = 'high';
          }
        }
      }

      days.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday: isTodayDate,
        isSelected,
        isAvailable: dayAvailability?.available || false,
        slotsCount,
        availabilityLevel
      });
    }

    return days;
  }, [currentMonth, availability, selectedDate]);

  // Group time slots by period
  const groupedTimeSlots = useMemo(() => {
    const groups = {
      morning: [],
      afternoon: [],
      evening: []
    };

    timeSlots.forEach(time => {
      const hour = parseInt(time.split(':')[0]);
      if (hour < 12) groups.morning.push(time);
      else if (hour < 17) groups.afternoon.push(time);
      else groups.evening.push(time);
    });

    return groups;
  }, [timeSlots]);

  // Handlers
  const handlePrevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleDateSelect = (dateStr, isAvailable) => {
    if (!isAvailable || isPastDate(dateStr)) return;

    setSelectedDate(dateStr);
    setSelectedTime(null); // Reset time when date changes
    setError('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleInputChange = (field, value) => {
    setCustomerData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!customerData.firstName.trim()) {
      errors.firstName = 'שם פרטי הוא שדה חובה';
    }

    if (!customerData.lastName.trim()) {
      errors.lastName = 'שם משפחה הוא שדה חובה';
    }

    if (!customerData.phone.trim()) {
      errors.phone = 'טלפון הוא שדה חובה';
    } else if (!/^0\d{1,2}-?\d{7}$/.test(customerData.phone.replace(/\s/g, ''))) {
      errors.phone = 'מספר טלפון לא תקין';
    }

    if (customerData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.email = 'כתובת אימייל לא תקינה';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setError('נא לבחור תאריך ושעה');
      return;
    }

    if (!validateForm()) {
      setError('נא למלא את כל השדות החובה');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const appointmentData = {
        businessId,
        serviceId,
        date: selectedDate,
        time: selectedTime,
        ...customerData,
        serviceName: service.service_name,
        servicePrice: service.price,
        serviceDuration: service.duration
      };

      await axiosInstance.post('/appointments', appointmentData);

      // Get user ID for redirection
      const userInfo = localStorage.getItem('userInfo');
      let userId;
      if (userInfo) {
        const user = JSON.parse(userInfo);
        userId = user.id || user.userId;
      }

      // Navigate to success page or dashboard
      if (userId) {
        navigate(`/user/${userId}/dashboard`, {
          state: {
            successMessage: 'התור נקבע בהצלחה!',
            appointment: {
              business: business.business_name,
              service: service.service_name,
              dateTime: formatDateTime(selectedDate, selectedTime)
            }
          }
        });
      } else {
        // Fallback if no user ID found (shouldn't happen for logged in users)
        navigate('/');
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      setError(err.response?.data?.message || 'שגיאה ביצירת התור. נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!business || !service) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>טוען...</div>
      </div>
    );
  }

  const canShowTimeSlots = selectedDate !== null;
  const canShowForm = selectedDate && selectedTime;
  const canSubmit = selectedDate && selectedTime &&
    customerData.firstName && customerData.lastName && customerData.phone;

  return (
    <div className={styles.container}>
      {/* Sticky Header with Service Info */}
      <div className={styles.stickyHeader}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <FiChevronRight /> חזור
        </button>
        <div className={styles.serviceInfo}>
          <h1>{service.service_name}</h1>
          <div className={styles.serviceMeta}>
            <span>{business.business_name}</span>
            <span>•</span>
            <span>₪{service.price}</span>
            <span>•</span>
            <span>{service.duration} דקות</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {error && (
          <div className={styles.errorBanner}>
            <FiX />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Calendar + Time Slots */}
        <div className={styles.section}>
          <div className={styles.gridLayout}>
            {/* Calendar */}
            <div className={styles.calendarContainer}>
              <div className={styles.sectionHeader}>
                <FiCalendar />
                <h2>בחר תאריך</h2>
                {selectedDate && (
                  <span className={styles.badge}>
                    <FiCheck /> {formatHebrewDate(selectedDate, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>

              <div className={styles.calendar}>
                {/* Month Navigation */}
                <div className={styles.calendarHeader}>
                  <button onClick={handlePrevMonth} className={styles.monthNav}>
                    <FiChevronRight />
                  </button>
                  <h3>
                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                  </h3>
                  <button onClick={handleNextMonth} className={styles.monthNav}>
                    <FiChevronLeft />
                  </button>
                </div>

                {/* Day Names */}
                <div className={styles.dayNames}>
                  {dayNames.map(day => (
                    <div key={day} className={styles.dayName}>{day}</div>
                  ))}
                </div>

                {/* Calendar Grid */}
                {isLoadingCalendar ? (
                  <div className={styles.calendarLoading}>טוען...</div>
                ) : (
                  <div className={styles.calendarGrid}>
                    {calendarDays.map(day => {
                      // Determine if day should be clickable
                      const isClickable = day.isCurrentMonth && !day.isPast &&
                        day.isAvailable && day.availabilityLevel !== 'closed';

                      return (
                        <button
                          key={day.dateStr}
                          onClick={() => isClickable && handleDateSelect(day.dateStr, day.isAvailable)}
                          disabled={!isClickable}
                          className={`
                            ${styles.calendarDay}
                            ${!day.isCurrentMonth ? styles.otherMonth : ''}
                            ${day.isPast ? styles.pastDay : ''}
                            ${day.isToday ? styles.today : ''}
                            ${day.isSelected ? styles.selected : ''}
                            ${day.availabilityLevel === 'closed' ? styles.closed : ''}
                            ${day.availabilityLevel === 'low' ? styles.lowAvailability : ''}
                            ${day.availabilityLevel === 'medium' ? styles.mediumAvailability : ''}
                            ${day.availabilityLevel === 'high' ? styles.highAvailability : ''}
                          `}
                        >
                          <span className={styles.dayNumber}>{day.day}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Time Slots */}
            <div className={`${styles.timeSlotsContainer} ${!canShowTimeSlots ? styles.disabled : ''}`}>
              <div className={styles.sectionHeader}>
                <FiClock />
                <h2>בחר שעה</h2>
                {selectedTime && (
                  <span className={styles.badge}>
                    <FiCheck /> {selectedTime}
                  </span>
                )}
              </div>

              {!canShowTimeSlots ? (
                <div className={styles.placeholder}>
                  <FiCalendar size={48} />
                  <p>בחר תאריך כדי לראות שעות פנויות</p>
                </div>
              ) : isLoadingSlots ? (
                <div className={styles.slotsLoading}>טוען זמנים פנויים...</div>
              ) : timeSlots.length === 0 ? (
                <div className={styles.noSlots}>
                  <FiX size={48} />
                  <p>אין זמנים פנויים בתאריך זה</p>
                  <p className={styles.hint}>נסה לבחור תאריך אחר</p>
                </div>
              ) : (
                <div className={styles.timeSlots}>
                  {Object.entries(groupedTimeSlots).map(([period, slots]) => {
                    if (slots.length === 0) return null;

                    const periodLabels = {
                      morning: '🌅 בוקר',
                      afternoon: '☀️ צהריים',
                      evening: '🌙 ערב'
                    };

                    return (
                      <div key={period} className={styles.timePeriod}>
                        <h4>{periodLabels[period]}</h4>
                        <div className={styles.timeGrid}>
                          {slots.map(time => (
                            <button
                              key={time}
                              onClick={() => handleTimeSelect(time)}
                              className={`
                                ${styles.timeSlot}
                                ${selectedTime === time ? styles.selected : ''}
                              `}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Customer Information */}
        {canShowForm && (
          <div className={`${styles.section} ${styles.formSection}`}>
            <div className={styles.sectionHeader}>
              <FiUser />
              <h2>פרטים אישיים</h2>
            </div>

            <div className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>שם פרטי *</label>
                  <input
                    type="text"
                    value={customerData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={formErrors.firstName ? styles.error : ''}
                  />
                  {formErrors.firstName && (
                    <span className={styles.fieldError}>{formErrors.firstName}</span>
                  )}
                </div>

                <div className={styles.formField}>
                  <label>שם משפחה *</label>
                  <input
                    type="text"
                    value={customerData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={formErrors.lastName ? styles.error : ''}
                  />
                  {formErrors.lastName && (
                    <span className={styles.fieldError}>{formErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formField}>
                  <label>טלפון *</label>
                  <input
                    type="tel"
                    value={customerData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="050-1234567"
                    className={formErrors.phone ? styles.error : ''}
                  />
                  {formErrors.phone && (
                    <span className={styles.fieldError}>{formErrors.phone}</span>
                  )}
                </div>

                <div className={styles.formField}>
                  <label>אימייל (אופציונלי)</label>
                  <input
                    type="email"
                    value={customerData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="example@email.com"
                    className={formErrors.email ? styles.error : ''}
                  />
                  {formErrors.email && (
                    <span className={styles.fieldError}>{formErrors.email}</span>
                  )}
                </div>
              </div>

              <div className={styles.formField}>
                <label>הערות (אופציונלי)</label>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="הערות נוספות לעסק"
                  rows="3"
                />
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {canShowForm && (
          <div className={styles.submitSection}>
            <div className={styles.summary}>
              <h3>סיכום התור</h3>
              <div className={styles.summaryDetails}>
                <p><strong>שירות:</strong> {service.service_name}</p>
                <p><strong>תאריך:</strong> {formatHebrewDate(selectedDate)}</p>
                <p><strong>שעה:</strong> {selectedTime}</p>
                <p><strong>מחיר:</strong> ₪{service.price}</p>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={styles.submitButton}
            >
              {isSubmitting ? 'מבצע הזמנה...' : '✓ אשר תור'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
