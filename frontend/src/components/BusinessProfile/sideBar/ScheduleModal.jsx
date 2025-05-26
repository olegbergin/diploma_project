import { useState, useEffect, useRef, useMemo } from "react"; // Added useEffect, useRef, useMemo
import PropTypes from 'prop-types'; // Added PropTypes
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // סגנון מובנה
import styles from "./ScheduleModal.module.css";

export default function ScheduleModal({ appointments = [], onClose }) { // Added default for appointments
  const [day, setDay] = useState(null);
  const firstFocusableElementRef = useRef(null); // For initial focus (e.g., the close button or calendar)
  const modalContentRef = useRef(null); // For focus trapping

  // Optimize appointment date lookup for tileContent
  const appointmentDates = useMemo(() => {
    const dates = new Set();
    if (appointments) {
      appointments.forEach(app => dates.add(app.date));
    }
    return dates;
  }, [appointments]);

  /* תורים של היום הנבחר */
  const todaysAppts = useMemo(() => {
    if (!day || !appointments) return [];
    const selectedDateString = day.toISOString().slice(0, 10);
    return appointments.filter((a) => a.date === selectedDateString);
  }, [day, appointments]);

  // Focus trapping and Escape key handling
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
      // Basic focus trapping
      if (event.key === 'Tab' && modalContentRef.current) {
        const focusableElements = Array.from(
          modalContentRef.current.querySelectorAll(
            'button, [tabindex]:not([tabindex="-1"]), input, select, textarea, a[href]'
          )
        ).filter(el => el.offsetParent !== null); // Filter for visible elements

        if (focusableElements.length === 0) return;
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    if (firstFocusableElementRef.current) {
      firstFocusableElementRef.current.focus();
    } else if (modalContentRef.current) {
      // Fallback: focus the modal itself or the first available button if specific ref not set
      const fallbackFocus = modalContentRef.current.querySelector('button');
      if(fallbackFocus) fallbackFocus.focus();
      else modalContentRef.current.setAttribute('tabindex', '-1'); modalContentRef.current.focus();
    }


    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div 
        ref={modalContentRef} 
        className={styles.card} 
        onClick={(e) => e.stopPropagation()}
        role="dialog" // Accessibility: role dialog
        aria-modal="true" // Accessibility: aria-modal
        aria-labelledby="scheduleModalTitle" // Accessibility: aria-labelledby
      >
        <h2 id="scheduleModalTitle" className={styles.title}>לוח זמנים</h2>

        <Calendar
          locale="he-IL"
          calendarType="hebrew" /* RTL */
          value={day}
          onChange={setDay}
          tileContent={({ date }) => {
            const iso = date.toISOString().slice(0, 10);
            return appointmentDates.has(iso) ? (
              <span className={styles.dot} />
            ) : null;
          }}
          // Consider adding ref to calendar if it's the intended first focusable element
          // ref={firstFocusableElementRef} // Example: if calendar is first focus
        />

        <div className={styles.list}>
          <h3 id="dailyAppointmentsHeading">תורים ל-{day ? day.toLocaleDateString("he-IL") : "--"}</h3>
          {day ? (
            todaysAppts.length ? (
              todaysAppts.map((a, i) => ( // Assuming 'id' is not available on appointment 'a' for key
                <p key={a.id || `appt-${i}`}> {/* Use appointment ID if available, else fallback to index */}
                  {a.time} — {a.customer}
                </p>
              ))
            ) : (
              <p>אין תורים ביום זה</p>
            )
          ) : (
            <p>בחר יום כדי לראות תורים</p>
          )}
        </div>

        <button 
          ref={firstFocusableElementRef} // Example: if close button is the first focus
          className={styles.closeBtn} 
          onClick={onClose}
          aria-label="Close schedule modal" // Accessibility: aria-label for close button
        >
          סגור
        </button>
      </div>
    </div>
  );
}

ScheduleModal.propTypes = {
  appointments: PropTypes.arrayOf(PropTypes.shape({
    date: PropTypes.string.isRequired, // Expected format 'YYYY-MM-DD'
    time: PropTypes.string.isRequired,
    customer: PropTypes.string.isRequired,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]), // Optional: if appointments have a unique ID
  })), // Changed to not required, as default is provided
  onClose: PropTypes.func.isRequired,
};

// Providing default props for appointments if not already handled by default value in destructuring
ScheduleModal.defaultProps = {
  appointments: [],
};
