/**
 * Calendar Picker Component
 * Interactive calendar for selecting appointment dates with availability indicators
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.businessId - Business ID for availability checking
 * @param {string} props.serviceId - Service ID for availability checking
 * @param {Function} props.onDateSelect - Callback when date is selected
 * @param {string} props.selectedDate - Currently selected date
 * @returns {JSX.Element} Interactive calendar component
 */

import React, { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from 'react-icons/fi';
import axiosInstance from '../../../api/axiosInstance';
import styles from './CalendarPicker.module.css';

export default function CalendarPicker({ businessId, serviceId, onDateSelect, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  
  const [availability, setAvailability] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Hebrew month names
  const monthNames = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
  ];

  // Hebrew day names (starting from Sunday)
  const dayNames = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

  /**
   * Fetch availability data for the current month
   */
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JS months are 0-based
        
        const response = await axiosInstance.get(
          `/businesses/${businessId}/calendar?month=${year}-${month.toString().padStart(2, '0')}&serviceId=${serviceId}`
        );
        
        // Convert array of available dates to object for quick lookup
        const availabilityMap = {};
        if (response.data.availableDates) {
          response.data.availableDates.forEach(dateInfo => {
            availabilityMap[dateInfo.date] = {
              available: dateInfo.available,
              slots: dateInfo.availableSlots || 0
            };
          });
        }
        
        setAvailability(availabilityMap);
      } catch (err) {
        console.error('Failed to fetch availability:', err);
        // Fallback: Mark all future dates as available
        setAvailability(generateFallbackAvailability());
      } finally {
        setIsLoading(false);
      }
    };

    if (businessId && serviceId) {
      fetchAvailability();
    }
  }, [currentMonth, businessId, serviceId]);

  /**
   * Generate fallback availability for when API fails
   */
  const generateFallbackAvailability = () => {
    const availability = {};
    const today = new Date();
    
    // Mark next 30 days as available (excluding past dates)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      availability[dateStr] = {
        available: true,
        slots: Math.floor(Math.random() * 8) + 2 // Random 2-10 slots
      };
    }
    
    return availability;
  };

  /**
   * Get calendar days for the current month view
   */
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday before or equal to the first day of month
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    
    // Generate 42 days (6 weeks)
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dateStr = date.toISOString().split('T')[0];
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateStr === selectedDate;
      
      const dayAvailability = availability[dateStr];
      
      days.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isAvailable: dayAvailability?.available || false,
        slotsCount: dayAvailability?.slots || 0
      });
    }
    
    return days;
  };

  /**
   * Handle date selection
   */
  const handleDateClick = (dayInfo) => {
    if (dayInfo.isPast || !dayInfo.isCurrentMonth || !dayInfo.isAvailable) {
      return;
    }
    
    onDateSelect(dayInfo.dateStr);
  };

  /**
   * Navigate to previous month
   */
  const goToPreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  /**
   * Navigate to next month
   */
  const goToNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  /**
   * Get availability indicator for a day
   */
  const getAvailabilityIndicator = (dayInfo) => {
    if (!dayInfo.isCurrentMonth || dayInfo.isPast) return null;
    
    if (!dayInfo.isAvailable) {
      return <FiX className={styles.unavailableIcon} />;
    }
    
    if (dayInfo.slotsCount > 5) {
      return <div className={styles.availabilityHigh} />;
    } else if (dayInfo.slotsCount > 2) {
      return <div className={styles.availabilityMedium} />;
    } else if (dayInfo.slotsCount > 0) {
      return <div className={styles.availabilityLow} />;
    }
    
    return <FiX className={styles.unavailableIcon} />;
  };

  const calendarDays = getCalendarDays();
  const currentMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h2 className={styles.calendarTitle}>בחר תאריך</h2>
        
        <div className={styles.monthNavigation}>
          <button 
            onClick={goToPreviousMonth}
            className={styles.navButton}
            aria-label="חודש קודם"
          >
            <FiChevronRight />
          </button>
          
          <div className={styles.monthDisplay}>
            <span className={styles.monthName}>{currentMonthName}</span>
            <span className={styles.yearName}>{currentYear}</span>
          </div>
          
          <button 
            onClick={goToNextMonth}
            className={styles.navButton}
            aria-label="חודש הבא"
          >
            <FiChevronLeft />
          </button>
        </div>
      </div>

      {/* Availability Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.availabilityHigh} />
          <span>זמינות גבוהה</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.availabilityMedium} />
          <span>זמינות בינונית</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.availabilityLow} />
          <span>זמינות נמוכה</span>
        </div>
        <div className={styles.legendItem}>
          <FiX className={styles.unavailableIcon} />
          <span>לא זמין</span>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className={styles.calendar}>
        {/* Day names header */}
        <div className={styles.dayNamesRow}>
          {dayNames.map(dayName => (
            <div key={dayName} className={styles.dayName}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(dayInfo)}
              disabled={!dayInfo.isCurrentMonth || dayInfo.isPast || !dayInfo.isAvailable}
              className={`
                ${styles.dayButton}
                ${dayInfo.isCurrentMonth ? styles.currentMonth : styles.otherMonth}
                ${dayInfo.isPast ? styles.pastDay : ''}
                ${dayInfo.isToday ? styles.today : ''}
                ${dayInfo.isSelected ? styles.selected : ''}
                ${dayInfo.isAvailable && dayInfo.isCurrentMonth && !dayInfo.isPast ? styles.available : ''}
              `}
              aria-label={`${dayInfo.day} ${currentMonthName} ${currentYear}`}
            >
              <span className={styles.dayNumber}>{dayInfo.day}</span>
              {getAvailabilityIndicator(dayInfo)}
              {dayInfo.isSelected && (
                <FiCheck className={styles.selectedIcon} />
              )}
            </button>
          ))}
        </div>
      </div>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>טוען זמינות...</span>
        </div>
      )}
    </div>
  );
}