import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CalendarPage.module.css';
import axiosInstance from '../../api/axiosInstance';
import { UserContext } from '../../context/UserContext';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month' or 'week'
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const businessId = currentUser?.businessId || currentUser?.id;

  // Helper function to fetch customer details if missing
  const fetchCustomerDetails = async (customerId) => {
    try {
      const response = await axiosInstance.get(`/users/${customerId}`);
      return {
        first_name: response.data.firstName || 'לקוח',
        last_name: response.data.lastName || 'לא ידוע',
        customer_name: `${response.data.firstName || 'לקוח'} ${response.data.lastName || 'לא ידוע'}`
      };
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return {
        first_name: 'לקוח',
        last_name: 'לא ידוע',
        customer_name: 'לקוח לא ידוע'
      };
    }
  };

  // Helper function to fetch service details if missing
  const fetchServiceDetails = async (serviceId) => {
    try {
      const response = await axiosInstance.get(`/businesses/services/${serviceId}`);
      return {
        service_name: response.data.name || 'שירות לא ידוע',
        name: response.data.name || 'שירות לא ידוע',
        price: response.data.price || 0,
        duration_minutes: response.data.duration_minutes || 0
      };
    } catch (error) {
      console.error('Error fetching service details:', error);
      return {
        service_name: 'שירות לא ידוע',
        name: 'שירות לא ידוע',
        price: 0,
        duration_minutes: 0
      };
    }
  };

  // Enhance appointments with missing details
  const enhanceAppointments = async (appointments) => {
    const enhancedAppointments = await Promise.all(
      appointments.map(async (apt) => {
        let enhancedApt = { ...apt };

        // Check if customer name is actually missing (not just the default Hebrew text)
        const customerNameMissing = (!apt.first_name || !apt.last_name || 
                                   apt.first_name === 'לקוח' || apt.last_name === 'לא ידוע') && 
                                   (apt.customerId || apt.customer_id);

        if (customerNameMissing) {
          const customerDetails = await fetchCustomerDetails(apt.customerId || apt.customer_id);
          enhancedApt = { ...enhancedApt, ...customerDetails };
        }

        // Check if service name is actually missing
        const serviceNameMissing = (!apt.service_name || apt.service_name === 'שירות לא ידוע') && 
                                  (apt.serviceId || apt.service_id);

        if (serviceNameMissing) {
          const serviceDetails = await fetchServiceDetails(apt.serviceId || apt.service_id);
          enhancedApt = { ...enhancedApt, ...serviceDetails };
        }

        return enhancedApt;
      })
    );

    return enhancedAppointments;
  };

  // Fetch appointments for current month
  const fetchAppointments = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const monthParam = `${year}-${month}`;
      
      // Get appointments for the current month using the correct endpoint
      const response = await axiosInstance.get('/appointments', {
        params: {
          businessId,
          month: monthParam
          // Don't pass status to get all appointments
        }
      });
      
      // Enhance appointments with missing customer/service details
      const rawAppointments = response.data || [];
      const enhancedAppointments = await enhanceAppointments(rawAppointments);
      
      setAppointments(enhancedAppointments);
      setError(null);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('שגיאה בטעינת התורים');
      setAppointments([]); // Fallback to empty array
    } finally {
      setLoading(false);
    }
  }, [businessId, currentDate]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Navigate to previous month
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  // Navigate to next month  
  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get appointments for a specific date
  const getAppointmentsForDate = (date) => {
    // Use local timezone to avoid day shift issues
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const localDateStr = `${year}-${month}-${day}`;

    const matchingApts = appointments.filter(apt => {
      // Try multiple date formats to match
      const aptDate = apt.date; // Should be YYYY-MM-DD from backend
      const aptDatetime = apt.appointmentDatetime || apt.appointment_datetime;
      const aptDateFromDatetime = aptDatetime ? aptDatetime.split('T')[0] : null;

      const matches = aptDate === localDateStr || aptDateFromDatetime === localDateStr;

      return matches;
    });

    return matchingApts;
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    
    // Get first day of week (0 = Sunday, 1 = Monday, etc.)
    // Adjust for Hebrew calendar (Sunday = 0)
    const firstDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Check if date is today
  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Format month year for display
  const formatMonthYear = () => {
    return currentDate.toLocaleDateString('he-IL', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle appointment status change
  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/status`, { status: newStatus });
      fetchAppointments(); // Refresh appointments
    } catch (error) {
      console.error('Error updating appointment status:', error);
      setError('שגיאה בעדכון סטטוס התור');
    }
  };

  // Check if appointment can be cancelled
  const canCancelAppointment = (appointment) => {
    // Can only cancel confirmed appointments (pending ones can be rejected)
    if (appointment.status !== 'confirmed') {
      return false;
    }

    // Can only cancel future appointments
    const appointmentDate = new Date(appointment.appointment_datetime || appointment.appointmentDatetime);
    const now = new Date();
    if (appointmentDate < now) {
      return false;
    }

    return true;
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('האם אתה בטוח שברצונך לבטל את התור? הלקוח יקבל הודעת ביטול.')) {
      return;
    }

    try {
      await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status: 'cancelled_by_business'
      });

      // Refresh appointments
      fetchAppointments();

      alert('התור בוטל בהצלחה');
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      setError('שגיאה בביטול התור. אנא נסה שוב.');
    }
  };

  const calendarDays = generateCalendarDays();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען לוח שנה...</p>
      </div>
    );
  }

  return (
    <div className={styles.calendarPage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`} 
            onClick={() => navigate(`/business/${businessId}/dashboard`)}
          >
            ← חזרה לדשבורד
          </button>
          <h1>לוח שנה</h1>
        </div>
        <div className={styles.headerActions}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`}
            onClick={goToToday}
          >
            היום
          </button>
          <div className={styles.viewToggle}>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'month' ? styles.active : ''}`}
              onClick={() => setViewMode('month')}
            >
              חודש
            </button>
            <button 
              className={`${styles.viewBtn} ${viewMode === 'week' ? styles.active : ''}`}
              onClick={() => setViewMode('week')}
            >
              שבוע
            </button>
          </div>
        </div>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      <div className={styles.calendarLayout}>
        {/* Calendar Section */}
        <div className={styles.calendarContainer}>
          <div className={styles.calendarNavigation}>
            <button 
              className={styles.navBtn}
              onClick={goToPreviousMonth}
            >
              ‹
            </button>
            <h2 className={styles.monthTitle}>{formatMonthYear()}</h2>
            <button 
              className={styles.navBtn}
              onClick={goToNextMonth}
            >
              ›
            </button>
          </div>

          <div className={styles.calendar}>
            {/* Day headers */}
            <div className={styles.dayHeaders}>
              {['ש', 'ו', 'ה', 'ד', 'ג', 'ב', 'א'].map(day => (
                <div key={day} className={styles.dayHeader}>{day}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className={styles.calendarGrid}>
              {calendarDays.map((date, index) => {
                if (!date) {
                  return <div key={index} className={styles.emptyDay}></div>;
                }

                const dayAppointments = getAppointmentsForDate(date);
                const hasAppointments = dayAppointments.length > 0;

                return (
                  <div
                    key={index}
                    className={`${styles.calendarDay} ${
                      isToday(date) ? styles.today : ''
                    } ${hasAppointments ? styles.hasAppointments : ''} ${
                      selectedDate && selectedDate.toDateString() === date.toDateString() ? styles.selected : ''
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className={styles.dayNumber}>{date.getDate()}</div>
                    {hasAppointments && (
                      <div className={styles.appointmentIndicators}>
                        <div className={styles.appointmentCount}>
                          {dayAppointments.length}
                        </div>
                        <div className={styles.statusDots}>
                          {dayAppointments.slice(0, 3).map((apt, i) => (
                            <div
                              key={i}
                              className={`${styles.statusDot} ${styles[apt.status] || styles.pending}`}
                            />
                          ))}
                          {dayAppointments.length > 3 && (
                            <div className={styles.moreDots}>+{dayAppointments.length - 3}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Panel */}
        <div className={styles.sidebarPanel}>
          <div className={styles.sidebarHeader}>
            <h3>
              {selectedDate 
                ? selectedDate.toLocaleDateString('he-IL', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })
                : 'בחר תאריך לצפייה בתורים'
              }
            </h3>
          </div>
          
          <div className={styles.sidebarContent}>
            {!selectedDate ? (
              <p className={styles.noDateSelected}>לחץ על תאריך בלוח השנה לצפייה בתורים</p>
            ) : (() => {
              const dayAppointments = getAppointmentsForDate(selectedDate);
              if (dayAppointments.length === 0) {
                return <p className={styles.noAppointments}>אין תורים ליום זה</p>;
              }

              return (
                <div className={styles.appointmentsList}>
                  {dayAppointments
                    .sort((a, b) => {
                      const timeA = a.time || new Date(a.appointmentDatetime || a.appointment_datetime).toTimeString();
                      const timeB = b.time || new Date(b.appointmentDatetime || b.appointment_datetime).toTimeString();
                      return timeA.localeCompare(timeB);
                    })
                    .map(apt => (
                      <div key={apt.appointmentId || apt.appointment_id} className={`${styles.appointmentItem} ${styles[apt.status] || styles.pending}`}>
                        <div className={styles.appointmentTime}>
                          {apt.time || new Date(apt.appointmentDatetime || apt.appointment_datetime).toLocaleTimeString('he-IL', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                        <div className={styles.appointmentDetails}>
                          <div className={styles.customerName}>
                            {apt.customer_name || (apt.first_name && apt.last_name ? `${apt.first_name} ${apt.last_name}` : 'לקוח לא ידוע')}
                          </div>
                          <div className={styles.serviceName}>
                            {apt.service_name || apt.name || 'שירות לא ידוע'}
                          </div>
                          {apt.price && (
                            <div className={styles.price}>₪{apt.price}</div>
                          )}
                        </div>
                        <div className={styles.appointmentActions}>
                          {apt.status === 'pending' && (
                            <>
                              <button
                                className={styles.approveBtn}
                                onClick={() => handleStatusChange(apt.appointmentId || apt.appointment_id, 'confirmed')}
                              >
                                אשר
                              </button>
                              <button
                                className={styles.rejectBtn}
                                onClick={() => handleStatusChange(apt.appointmentId || apt.appointment_id, 'cancelled_by_business')}
                              >
                                דחה
                              </button>
                            </>
                          )}

                          {apt.status === 'confirmed' && canCancelAppointment(apt) && (
                            <button
                              className={styles.cancelBtn}
                              onClick={() => handleCancelAppointment(apt.appointmentId || apt.appointment_id)}
                            >
                              בטל תור
                            </button>
                          )}

                          <div className={`${styles.status} ${styles[apt.status] || styles.pending}`}>
                            {apt.status === 'confirmed' ? 'מאושר' :
                             apt.status === 'pending' ? 'ממתין' :
                             apt.status === 'completed' ? 'הושלם' : 'בוטל'}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}