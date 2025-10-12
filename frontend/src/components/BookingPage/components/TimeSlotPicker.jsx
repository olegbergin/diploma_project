/**
 * Time Slot Picker Component
 * Interactive time slot selection with availability and duration consideration
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.date - Selected date for time slots
 * @param {Array} props.availableSlots - Array of available time slots
 * @param {Function} props.onTimeSelect - Callback when time is selected
 * @param {string} props.selectedTime - Currently selected time
 * @param {number} props.serviceDuration - Service duration in minutes
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element} Time slot picker grid
 */

import React, { useMemo } from 'react';
import { FiClock, FiCheck, FiX } from 'react-icons/fi';
import styles from './TimeSlotPicker.module.css';

export default function TimeSlotPicker({ 
  date, 
  availableSlots = [], 
  onTimeSelect, 
  selectedTime, 
  serviceDuration = 60,
  isLoading 
}) {
  
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
   * Generate time slots for the day with availability check
   */
  const timeSlots = useMemo(() => {
    const slots = [];
    const now = new Date();
    const selectedDate = new Date(date);
    const isToday = selectedDate.toDateString() === now.toDateString();
    
    // Standard business hours: 8:00 - 20:00
    for (let hour = 8; hour < 20; hour++) {
      for (let minutes = 0; minutes < 60; minutes += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        
        // Skip if it's today and the time has passed
        if (isToday) {
          const slotTime = new Date(selectedDate);
          slotTime.setHours(hour, minutes, 0, 0);
          if (slotTime <= now) {
            continue;
          }
        }
        
        // Check availability
        const isAvailable = availableSlots.includes(timeString);
        const isSelected = timeString === selectedTime;
        
        // Calculate end time
        const endTime = new Date(selectedDate);
        endTime.setHours(hour, minutes + serviceDuration, 0, 0);
        const endTimeString = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
        
        slots.push({
          time: timeString,
          endTime: endTimeString,
          isAvailable,
          isSelected,
          isPast: false,
          hour,
          minutes
        });
      }
    }
    
    return slots;
  }, [date, availableSlots, selectedTime, serviceDuration]);

  /**
   * Handle time slot selection
   */
  const handleTimeClick = (slot) => {
    if (!slot.isAvailable) return;
    onTimeSelect(slot.time);
  };

  /**
   * Group time slots by time periods
   */
  const groupedSlots = useMemo(() => {
    return {
      morning: timeSlots.filter(slot => slot.hour >= 8 && slot.hour < 12),
      afternoon: timeSlots.filter(slot => slot.hour >= 12 && slot.hour < 17),
      evening: timeSlots.filter(slot => slot.hour >= 17 && slot.hour < 20)
    };
  }, [timeSlots]);

  /**
   * Get period label
   */
  const getPeriodLabel = (period) => {
    switch (period) {
      case 'morning': return 'בוקר';
      case 'afternoon': return 'צהריים';
      case 'evening': return 'ערב';
      default: return '';
    }
  };

  /**
   * Get period icon
   */
  const getPeriodIcon = (period) => {
    switch (period) {
      case 'morning': return '🌅';
      case 'afternoon': return '☀️';
      case 'evening': return '🌙';
      default: return '🕐';
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <span>טוען זמנים פנויים...</span>
      </div>
    );
  }

  const availableCount = timeSlots.filter(slot => slot.isAvailable).length;

  return (
    <div className={styles.timePickerContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>בחר שעה</h2>
        <div className={styles.dateDisplay}>
          <FiClock className={styles.clockIcon} />
          <span>{formatDate(date)}</span>
        </div>
        
        {serviceDuration && (
          <div className={styles.durationInfo}>
            <span>משך השירות: {serviceDuration} דקות</span>
          </div>
        )}
        
        <div className={styles.availabilityInfo}>
          <span>{availableCount} זמנים פנויים</span>
        </div>
      </div>

      {availableCount === 0 ? (
        <div className={styles.noSlotsMessage}>
          <FiX className={styles.noSlotsIcon} />
          <h3>אין זמנים פנויים</h3>
          <p>לא נמצאו זמנים פנויים בתאריך זה. אנא בחר תאריך אחר.</p>
        </div>
      ) : (
        <div className={styles.slotsContainer}>
          {Object.entries(groupedSlots).map(([period, slots]) => {
            const availableInPeriod = slots.filter(slot => slot.isAvailable);
            
            if (availableInPeriod.length === 0) {
              return null;
            }
            
            return (
              <div key={period} className={styles.periodSection}>
                <div className={styles.periodHeader}>
                  <span className={styles.periodIcon}>{getPeriodIcon(period)}</span>
                  <h3 className={styles.periodTitle}>{getPeriodLabel(period)}</h3>
                  <span className={styles.periodCount}>
                    ({availableInPeriod.length} זמינים)
                  </span>
                </div>
                
                <div className={styles.slotsGrid}>
                  {slots.map((slot) => {
                    if (!slot.isAvailable) return null;
                    
                    return (
                      <button
                        key={slot.time}
                        onClick={() => handleTimeClick(slot)}
                        className={`
                          ${styles.timeSlot}
                          ${slot.isSelected ? styles.selected : ''}
                          ${!slot.isAvailable ? styles.unavailable : styles.available}
                        `}
                        disabled={!slot.isAvailable}
                        aria-label={`${slot.time} עד ${slot.endTime}`}
                      >
                        <div className={styles.slotTime}>
                          {slot.time}
                        </div>
                        {serviceDuration > 60 && (
                          <div className={styles.slotEndTime}>
                            עד {slot.endTime}
                          </div>
                        )}
                        {slot.isSelected && (
                          <FiCheck className={styles.selectedIcon} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#10b981' }} />
          <span>זמין</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#2563eb' }} />
          <span>נבחר</span>
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: '#e5e7eb' }} />
          <span>לא זמין</span>
        </div>
      </div>
    </div>
  );
}