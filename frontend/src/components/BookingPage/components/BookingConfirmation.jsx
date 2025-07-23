/**
 * Booking Confirmation Component
 * Displays booking confirmation details and success message
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.bookingDetails - Booking confirmation data
 * @param {Function} props.onGoHome - Callback to navigate to home
 * @param {Function} props.onViewAppointments - Callback to view appointments
 * @returns {JSX.Element} Booking confirmation component
 */

import React from 'react';
import { 
  FiCheckCircle, 
  FiCalendar, 
  FiClock, 
  FiMapPin, 
  FiPhone, 
  FiMail,
  FiHome,
  FiList,
  FiDownload,
  FiShare2
} from 'react-icons/fi';
import styles from './BookingConfirmation.module.css';

export default function BookingConfirmation({ 
  bookingDetails, 
  onGoHome, 
  onViewAppointments 
}) {
  
  /**
   * Format date for display
   */
  const formatDate = (dateString) => {
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
    return timeString;
  };

  /**
   * Calculate end time
   */
  const calculateEndTime = (startTime, duration) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  };

  /**
   * Generate calendar event data
   */
  const generateCalendarData = () => {
    const startDate = new Date(`${bookingDetails.date}T${bookingDetails.time}`);
    const endDate = new Date(startDate.getTime() + bookingDetails.serviceDuration * 60000);
    
    return {
      title: `${bookingDetails.serviceName} - ${bookingDetails.businessName}`,
      start: startDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      end: endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
      description: `תור ל${bookingDetails.serviceName} אצל ${bookingDetails.businessName}`,
      location: bookingDetails.businessAddress || bookingDetails.businessName
    };
  };

  /**
   * Download calendar event
   */
  const downloadCalendarEvent = () => {
    const event = generateCalendarData();
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Your App//Your App//EN
BEGIN:VEVENT
UID:${bookingDetails.bookingId}@yourapp.com
DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `appointment-${bookingDetails.bookingId}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  /**
   * Share booking details
   */
  const shareBooking = async () => {
    const shareData = {
      title: 'אישור תור',
      text: `התור שלי: ${bookingDetails.serviceName} ב-${formatDate(bookingDetails.date)} בשעה ${bookingDetails.time}`,
      url: window.location.origin
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareData.text);
      alert('פרטי התור הועתקו ללוח');
    }
  };

  const endTime = calculateEndTime(bookingDetails.time, bookingDetails.serviceDuration);

  return (
    <div className={styles.confirmationContainer}>
      {/* Success Header */}
      <div className={styles.successHeader}>
        <div className={styles.successIcon}>
          <FiCheckCircle />
        </div>
        <h1 className={styles.successTitle}>התור נקבע בהצלחה!</h1>
        <p className={styles.successSubtitle}>
          קיבלת אישור לתור שלך. פרטי התור נשלחו לאימייל שלך.
        </p>
        <div className={styles.bookingNumber}>
          <span>מספר תור: <strong>#{bookingDetails.bookingId}</strong></span>
        </div>
      </div>

      {/* Booking Details Card */}
      <div className={styles.detailsCard}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>פרטי התור</h2>
          <div className={styles.cardActions}>
            <button 
              onClick={downloadCalendarEvent}
              className={styles.actionButton}
              title="הוסף ליומן"
            >
              <FiDownload />
            </button>
            <button 
              onClick={shareBooking}
              className={styles.actionButton}
              title="שתף"
            >
              <FiShare2 />
            </button>
          </div>
        </div>

        <div className={styles.detailsGrid}>
          {/* Service Information */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>השירות</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>שם השירות:</span>
              <span className={styles.detailValue}>{bookingDetails.serviceName}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>משך השירות:</span>
              <span className={styles.detailValue}>{bookingDetails.serviceDuration} דקות</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>מחיר:</span>
              <span className={styles.detailValue}>₪{bookingDetails.servicePrice}</span>
            </div>
          </div>

          {/* Date & Time */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <FiCalendar className={styles.sectionIcon} />
              תאריך ושעה
            </h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>תאריך:</span>
              <span className={styles.detailValue}>{formatDate(bookingDetails.date)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>שעת התחלה:</span>
              <span className={styles.detailValue}>{formatTime(bookingDetails.time)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>שעת סיום:</span>
              <span className={styles.detailValue}>{endTime}</span>
            </div>
          </div>

          {/* Business Information */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>
              <FiMapPin className={styles.sectionIcon} />
              פרטי העסק
            </h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>שם העסק:</span>
              <span className={styles.detailValue}>{bookingDetails.businessName}</span>
            </div>
            {bookingDetails.businessAddress && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>כתובת:</span>
                <span className={styles.detailValue}>{bookingDetails.businessAddress}</span>
              </div>
            )}
            {bookingDetails.businessPhone && (
              <div className={styles.detailItem}>
                <FiPhone className={styles.detailIcon} />
                <span className={styles.detailValue}>{bookingDetails.businessPhone}</span>
              </div>
            )}
            {bookingDetails.businessEmail && (
              <div className={styles.detailItem}>
                <FiMail className={styles.detailIcon} />
                <span className={styles.detailValue}>{bookingDetails.businessEmail}</span>
              </div>
            )}
          </div>

          {/* Customer Information */}
          <div className={styles.detailSection}>
            <h3 className={styles.sectionTitle}>פרטי הלקוח</h3>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>שם מלא:</span>
              <span className={styles.detailValue}>
                {bookingDetails.customerInfo.firstName} {bookingDetails.customerInfo.lastName}
              </span>
            </div>
            <div className={styles.detailItem}>
              <FiPhone className={styles.detailIcon} />
              <span className={styles.detailValue}>{bookingDetails.customerInfo.phone}</span>
            </div>
            <div className={styles.detailItem}>
              <FiMail className={styles.detailIcon} />
              <span className={styles.detailValue}>{bookingDetails.customerInfo.email}</span>
            </div>
            {bookingDetails.customerInfo.notes && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>הערות:</span>
                <span className={styles.detailValue}>{bookingDetails.customerInfo.notes}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Important Information */}
      <div className={styles.infoCard}>
        <h3 className={styles.infoTitle}>מידע חשוב</h3>
        <div className={styles.infoList}>
          <div className={styles.infoItem}>
            <FiClock className={styles.infoIcon} />
            <span>מומלץ להגיע 5-10 דקות לפני התור</span>
          </div>
          <div className={styles.infoItem}>
            <FiPhone className={styles.infoIcon} />
            <span>לביטול או שינוי תור, התקשרו מראש</span>
          </div>
          <div className={styles.infoItem}>
            <FiMail className={styles.infoIcon} />
            <span>תקבלו תזכורת באימייל יום לפני התור</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionButtons}>
        <button 
          onClick={onViewAppointments}
          className={styles.primaryButton}
        >
          <FiList className={styles.buttonIcon} />
          <span>צפה בכל התורים</span>
        </button>
        
        <button 
          onClick={onGoHome}
          className={styles.secondaryButton}
        >
          <FiHome className={styles.buttonIcon} />
          <span>חזור לעמוד הבית</span>
        </button>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>תודה שבחרת בשירותים שלנו!</p>
        <p>במידה ויש לך שאלות, אנא צור קשר עם העסק ישירות.</p>
      </div>
    </div>
  );
}