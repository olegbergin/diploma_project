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
 *
 * קומפוננטת לוח שנה לבחירת תאריך לתור:
 * מציגה חודש נוכחי, מאפשרת ניווט חודשים,
 * טוענת זמינות מהשרת ומסמנת ימים לפי זמינות.
 */

import React, { useState, useEffect } from "react";
import { FiChevronLeft, FiChevronRight, FiCheck, FiX } from "react-icons/fi";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./CalendarPicker.module.css";

// קומפוננטה שמקבלת מזהה עסק + מזהה שירות כדי לבדוק זמינות,
// ומחזירה לקומפוננטה ההורה תאריך שנבחר
export default function CalendarPicker({
  businessId,
  serviceId,
  onDateSelect,
  selectedDate,
}) {
  // ---------------------------------------------------
  // משתני מצב (State)
  // ---------------------------------------------------

  // החודש שמוצג כרגע בלוח השנה
  // מאותחל ליום הראשון של החודש הנוכחי
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  // אובייקט שמחזיק מידע על זמינות לכל תאריך (YYYY-MM-DD -> available/slots)
  const [availability, setAvailability] = useState({});

  // מצב טעינה בזמן שליפת זמינות מהשרת
  const [isLoading, setIsLoading] = useState(false);

  // Hebrew month names
  // שמות חודשים בעברית להצגה בכותרת הלוח
  const monthNames = [
    "ינואר",
    "פברואר",
    "מרץ",
    "אפריל",
    "מאי",
    "יוני",
    "יולי",
    "אוגוסט",
    "ספטמבר",
    "אוקטובר",
    "נובמבר",
    "דצמבר",
  ];

  // Hebrew day names (starting from Sunday)
  // שמות הימים בשבוע (מתחיל מראשון)
  const dayNames = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];

  /**
   * Fetch availability data for the current month
   */
  // ---------------------------------------------------
  // אפקט שמופעל בכל שינוי חודש / עסק / שירות
  // מושך מהשרת זמינות לחודש שמוצג כרגע
  // ---------------------------------------------------
  useEffect(() => {
    const fetchAvailability = async () => {
      setIsLoading(true);
      try {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth() + 1; // JS months are 0-based

        // בקשת זמינות מהשרת לפי חודש וserviceId
        const response = await axiosInstance.get(
          `/businesses/${businessId}/calendar?month=${year}-${month
            .toString()
            .padStart(2, "0")}&serviceId=${serviceId}`
        );

        // Convert array of available dates to object for quick lookup
        // המרה ממערך של תאריכים לאובייקט לנגישות מהירה לפי מפתח תאריך
        const availabilityMap = {};
        if (response.data.availableDates) {
          response.data.availableDates.forEach((dateInfo) => {
            availabilityMap[dateInfo.date] = {
              available: dateInfo.available,
              slots: dateInfo.availableSlots || 0,
            };
          });
        }

        // שמירת המפה במצב
        setAvailability(availabilityMap);
      } catch (err) {
        console.error("Failed to fetch availability:", err);
        // Fallback: Mark all future dates as available
        // במקרה שהשרת נכשל – יוצרים זמינות ברירת מחדל כדי שהמשתמש יוכל לבחור
        setAvailability(generateFallbackAvailability());
      } finally {
        setIsLoading(false);
      }
    };

    // נשלוף זמינות רק אם יש מזהה עסק ושירות
    if (businessId && serviceId) {
      fetchAvailability();
    }
  }, [currentMonth, businessId, serviceId]);

  /**
   * Generate fallback availability for when API fails
   */
  // ---------------------------------------------------
  // יצירת זמינות ברירת מחדל אם השרת לא מחזיר נתונים
  // מסמן 30 ימים קדימה כזמינים עם מספר "סלוטים" רנדומלי
  // ---------------------------------------------------
  const generateFallbackAvailability = () => {
    const availability = {};
    const today = new Date();

    // Mark next 30 days as available (excluding past dates)
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];
      availability[dateStr] = {
        available: true,
        slots: Math.floor(Math.random() * 8) + 2, // Random 2-10 slots
      };
    }

    return availability;
  };

  /**
   * Get calendar days for the current month view
   */
  // ---------------------------------------------------
  // בניית מערך ימים לתצוגת הלוח:
  // מייצר 42 ימים (6 שבועות) כדי למלא את הגריד,
  // כולל ימים מהחודש הקודם/הבא אם צריך.
  // ---------------------------------------------------
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);

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

      const dateStr = date.toISOString().split("T")[0];
      const isCurrentMonth = date.getMonth() === month;
      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      const isSelected = dateStr === selectedDate;

      const dayAvailability = availability[dateStr];

      // דוחפים אובייקט מידע לכל יום: תאריך, האם בחודש, האם עבר, זמינות וכו'
      days.push({
        date,
        dateStr,
        day: date.getDate(),
        isCurrentMonth,
        isPast,
        isToday,
        isSelected,
        isAvailable: dayAvailability?.available || false,
        slotsCount: dayAvailability?.slots || 0,
      });
    }

    return days;
  };

  /**
   * Handle date selection
   */
  // ---------------------------------------------------
  // לחיצה על יום בלוח:
  // אם היום לא תקין (עבר / לא בחודש / לא זמין) – לא עושים כלום
  // אחרת שולחים את התאריך הנבחר לקומפוננטה ההורה
  // ---------------------------------------------------
  const handleDateClick = (dayInfo) => {
    if (dayInfo.isPast || !dayInfo.isCurrentMonth || !dayInfo.isAvailable) {
      return;
    }

    onDateSelect(dayInfo.dateStr);
  };

  /**
   * Navigate to previous month
   */
  // מעבר לחודש קודם
  const goToPreviousMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  /**
   * Navigate to next month
   */
  // מעבר לחודש הבא
  const goToNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  /**
   * Get availability indicator for a day
   */
  // ---------------------------------------------------
  // מחזיר אינדיקטור ויזואלי לזמינות של יום:
  // גבוהה / בינונית / נמוכה / לא זמין
  // ---------------------------------------------------
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

  // יצירת רשימת הימים לתצוגה
  const calendarDays = getCalendarDays();

  // שם החודש והשנה לתצוגת כותרת
  const currentMonthName = monthNames[currentMonth.getMonth()];
  const currentYear = currentMonth.getFullYear();

  return (
    <div className={styles.calendarContainer}>
      <div className={styles.calendarHeader}>
        <h2 className={styles.calendarTitle}>בחר תאריך</h2>

        {/* ניווט חודשים קדימה/אחורה */}
        <div className={styles.monthNavigation}>
          <button
            onClick={goToPreviousMonth}
            className={styles.navButton}
            aria-label="חודש קודם"
          >
            <FiChevronRight />
          </button>

          {/* תצוגת חודש ושנה נוכחיים */}
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
      {/* מקרא צבעים לזמינות */}
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
      {/* גריד הלוח עצמו */}
      <div className={styles.calendar}>
        {/* Day names header */}
        {/* שורת שמות הימים */}
        <div className={styles.dayNamesRow}>
          {dayNames.map((dayName) => (
            <div key={dayName} className={styles.dayName}>
              {dayName}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {/* כפתור לכל יום בלוח */}
        <div className={styles.daysGrid}>
          {calendarDays.map((dayInfo, index) => (
            <button
              key={index}
              onClick={() => handleDateClick(dayInfo)}
              disabled={
                !dayInfo.isCurrentMonth ||
                dayInfo.isPast ||
                !dayInfo.isAvailable
              }
              className={`
                ${styles.dayButton}
                ${
                  dayInfo.isCurrentMonth
                    ? styles.currentMonth
                    : styles.otherMonth
                }
                ${dayInfo.isPast ? styles.pastDay : ""}
                ${dayInfo.isToday ? styles.today : ""}
                ${dayInfo.isSelected ? styles.selected : ""}
                ${
                  dayInfo.isAvailable &&
                  dayInfo.isCurrentMonth &&
                  !dayInfo.isPast
                    ? styles.available
                    : ""
                }
              `}
              aria-label={`${dayInfo.day} ${currentMonthName} ${currentYear}`}
            >
              <span className={styles.dayNumber}>{dayInfo.day}</span>

              {/* אינדיקטור זמינות */}
              {getAvailabilityIndicator(dayInfo)}

              {/* סימון וי על יום שנבחר */}
              {dayInfo.isSelected && (
                <FiCheck className={styles.selectedIcon} />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* שכבת טעינה בזמן שליפת זמינות */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner} />
          <span>טוען זמינות...</span>
        </div>
      )}
    </div>
  );
}
