import { useState, useMemo } from 'react';
import styles from './CalendarGrid.module.css';

export default function CalendarGrid({
  appointments = [],
  selectedDate,
  viewMode,
  onDateSelect,
  onAppointmentClick,
  onTimeSlotClick
}) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const date = new Date(selectedDate);
    const day = date.getDay();
    const diff = date.getDate() - day;
    return new Date(date.setDate(diff));
  });

  // Generate time slots (9:00 AM - 6:00 PM)
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 18; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      if (hour < 18) {
        slots.push(`${hour.toString().padStart(2, '0')}:30`);
      }
    }
    return slots;
  }, []);

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateStr);
  };

  // Get appointments for a specific time slot
  const getAppointmentsForTimeSlot = (date, timeSlot) => {
    const dateAppointments = getAppointmentsForDate(date);
    return dateAppointments.filter(apt => apt.time === timeSlot);
  };

  // Navigate week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction * 7));
    setCurrentWeekStart(newDate);
  };

  // Navigate month
  const navigateMonth = (direction) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    onDateSelect(newDate);
  };

  // Get week days
  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      days.push(date);
    }
    return days;
  };

  // Get month days
  const getMonthDays = () => {
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    const endDate = new Date(lastDay);
    
    // Adjust to start from Sunday
    startDate.setDate(firstDay.getDate() - firstDay.getDay());
    endDate.setDate(lastDay.getDate() + (6 - lastDay.getDay()));
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };


  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDate = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  // Day view
  if (viewMode === 'day') {
    const dayAppointments = getAppointmentsForDate(selectedDate);
    
    return (
      <div className={styles.dayView}>
        {/* Day Header */}
        <div className={styles.dayHeader}>
          <button 
            className={styles.navButton}
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() - 1);
              onDateSelect(newDate);
            }}
          >
            ←
          </button>
          
          <h2 className={styles.dayTitle}>
            {selectedDate.toLocaleDateString('he-IL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h2>
          
          <button 
            className={styles.navButton}
            onClick={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(newDate.getDate() + 1);
              onDateSelect(newDate);
            }}
          >
            →
          </button>
        </div>

        {/* Time Slots */}
        <div className={styles.timeSlotsContainer}>
          <div className={styles.timeColumn}>
            {timeSlots.map(timeSlot => (
              <div key={timeSlot} className={styles.timeSlot}>
                {timeSlot}
              </div>
            ))}
          </div>
          
          <div className={styles.appointmentsColumn}>
            {timeSlots.map(timeSlot => {
              const slotAppointments = getAppointmentsForTimeSlot(selectedDate, timeSlot);
              
              return (
                <div 
                  key={timeSlot} 
                  className={styles.appointmentSlot}
                  onClick={() => slotAppointments.length === 0 && onTimeSlotClick(timeSlot)}
                >
                  {slotAppointments.map(appointment => (
                    <div
                      key={appointment.id}
                      className={`${styles.appointment} ${styles[appointment.status]}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAppointmentClick(appointment);
                      }}
                    >
                      <div className={styles.appointmentTime}>{appointment.time}</div>
                      <div className={styles.appointmentCustomer}>
                        {appointment.customerName}
                      </div>
                      <div className={styles.appointmentService}>
                        {appointment.serviceName}
                      </div>
                    </div>
                  ))}
                  
                  {slotAppointments.length === 0 && (
                    <div className={styles.emptySlot}>
                      + הוסף תור
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Week view
  if (viewMode === 'week') {
    const weekDays = getWeekDays();
    
    return (
      <div className={styles.weekView}>
        {/* Week Header */}
        <div className={styles.weekHeader}>
          <button 
            className={styles.navButton}
            onClick={() => navigateWeek(-1)}
          >
            ←
          </button>
          
          <h2 className={styles.weekTitle}>
            {currentWeekStart.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            className={styles.navButton}
            onClick={() => navigateWeek(1)}
          >
            →
          </button>
        </div>

        {/* Week Grid */}
        <div className={styles.weekGrid}>
          <div className={styles.timeColumnHeader}></div>
          
          {weekDays.map(day => (
            <div 
              key={day.toISOString()} 
              className={`${styles.dayHeader} ${isToday(day) ? styles.today : ''} ${isSelectedDate(day) ? styles.selected : ''}`}
              onClick={() => onDateSelect(day)}
            >
              <div className={styles.dayName}>
                {day.toLocaleDateString('he-IL', { weekday: 'short' })}
              </div>
              <div className={styles.dayNumber}>
                {day.getDate()}
              </div>
            </div>
          ))}

          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className={styles.weekRow}>
              <div className={styles.timeLabel}>{timeSlot}</div>
              
              {weekDays.map(day => {
                const dayAppointments = getAppointmentsForTimeSlot(day, timeSlot);
                
                return (
                  <div 
                    key={`${day.toISOString()}-${timeSlot}`}
                    className={styles.weekCell}
                    onClick={() => dayAppointments.length === 0 && onTimeSlotClick(timeSlot)}
                  >
                    {dayAppointments.map(appointment => (
                      <div
                        key={appointment.id}
                        className={`${styles.weekAppointment} ${styles[appointment.status]}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAppointmentClick(appointment);
                        }}
                      >
                        {appointment.customerName}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Month view
  if (viewMode === 'month') {
    const monthDays = getMonthDays();
    const chunks = [];
    for (let i = 0; i < monthDays.length; i += 7) {
      chunks.push(monthDays.slice(i, i + 7));
    }

    return (
      <div className={styles.monthView}>
        {/* Month Header */}
        <div className={styles.monthHeader}>
          <button 
            className={styles.navButton}
            onClick={() => navigateMonth(-1)}
          >
            ←
          </button>
          
          <h2 className={styles.monthTitle}>
            {selectedDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' })}
          </h2>
          
          <button 
            className={styles.navButton}
            onClick={() => navigateMonth(1)}
          >
            →
          </button>
        </div>

        {/* Month Grid */}
        <div className={styles.monthGrid}>
          {/* Week days header */}
          <div className={styles.monthWeekHeader}>
            {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map(day => (
              <div key={day} className={styles.monthWeekDay}>{day}</div>
            ))}
          </div>

          {/* Month days */}
          {chunks.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.monthWeek}>
              {week.map(day => {
                const dayAppointments = getAppointmentsForDate(day);
                const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`${styles.monthDay} 
                      ${isToday(day) ? styles.today : ''} 
                      ${isSelectedDate(day) ? styles.selected : ''}
                      ${!isCurrentMonth ? styles.otherMonth : ''}
                    `}
                    onClick={() => onDateSelect(day)}
                  >
                    <div className={styles.monthDayNumber}>
                      {day.getDate()}
                    </div>
                    
                    <div className={styles.monthDayAppointments}>
                      {dayAppointments.slice(0, 3).map(appointment => (
                        <div
                          key={appointment.id}
                          className={`${styles.monthAppointment} ${styles[appointment.status]}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onAppointmentClick(appointment);
                          }}
                        >
                          {appointment.time} {appointment.customerName}
                        </div>
                      ))}
                      
                      {dayAppointments.length > 3 && (
                        <div className={styles.moreAppointments}>
                          +{dayAppointments.length - 3} עוד
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}