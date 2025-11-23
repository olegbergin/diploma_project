/**
 * Booking Page Component
 * Main page for booking appointments with step-by-step process
 *
 * @component
 * @returns {JSX.Element} Booking page with service selection, calendar, and form
 *
 * הערות בעברית:
 * זהו העמוד הראשי של הזמנת תור.
 * הוא מנהל את כל השלבים: סיכום שירות -> בחירת תאריך -> בחירת שעה -> מילוי טופס -> אישור -> הצלחה.
 */

import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { FiArrowRight, FiCheck, FiCalendar, FiMapPin } from "react-icons/fi";
import axiosInstance from "../../api/axiosInstance";
import ServiceSummary from "./components/ServiceSummary";
import CalendarPicker from "./components/CalendarPicker";
import TimeSlotPicker from "./components/TimeSlotPicker";
import BookingForm from "./components/BookingForm";
import BookingConfirmation from "./components/BookingConfirmation";
import styles from "./BookingPage.module.css";

// ---------------------------------------------------
// אובייקט קבוע שמגדיר את כל שלבי ההזמנה
// ---------------------------------------------------
const BOOKING_STEPS = {
  SUMMARY: "summary",
  CALENDAR: "calendar",
  TIME: "time",
  FORM: "form",
  CONFIRMATION: "confirmation",
  SUCCESS: "success",
};

export default function BookingPage() {
  // ---------------------------------------------------
  // קריאת פרמטרים מה־URL (מזהי עסק ושירות)
  // ---------------------------------------------------
  const { businessId, serviceId } = useParams();

  // location מאפשר לקבל state שהועבר בניווט
  const location = useLocation();

  // navigate מאפשר לעבור עמודים קדימה/אחורה
  const navigate = useNavigate();

  // ---------------------------------------------------
  // משתני מצב עבור נתוני העסק והשירות
  // אם הועברו דרך navigate.state – נשתמש בהם
  // אחרת נטען מהשרת
  // ---------------------------------------------------
  const [business, setBusiness] = useState(location.state?.business || null);
  const [service, setService] = useState(location.state?.service || null);

  // ---------------------------------------------------
  // משתני מצב לתהליך ההזמנה עצמו
  // ---------------------------------------------------
  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SUMMARY); // השלב הנוכחי
  const [selectedDate, setSelectedDate] = useState(null); // תאריך שנבחר
  const [selectedTime, setSelectedTime] = useState(null); // שעה שנבחרה
  const [customerData, setCustomerData] = useState({}); // נתוני לקוח מהטופס
  const [availableSlots, setAvailableSlots] = useState([]); // שעות זמינות לתאריך
  const [isLoading, setIsLoading] = useState(false); // מצב טעינה כללי
  const [error, setError] = useState(null); // הודעת שגיאה אם יש

  /**
   * Fetch business and service data if not provided via navigation
   */
  // ---------------------------------------------------
  // אפקט: אם אין לנו נתוני עסק או שירות מהניווט,
  // נטען אותם מהשרת לפי businessId ו-serviceId
  // ---------------------------------------------------
  useEffect(() => {
    const fetchData = async () => {
      if (!business || !service) {
        setIsLoading(true);
        try {
          // Fetch business data
          // טעינת נתוני העסק
          if (!business) {
            const businessResponse = await axiosInstance.get(
              `/businesses/${businessId}`
            );
            setBusiness(businessResponse.data);
          }

          // Fetch service data
          // טעינת השירותים של העסק ומציאת השירות המתאים לפי serviceId
          if (!service) {
            const servicesResponse = await axiosInstance.get(
              `/businesses/${businessId}/services`
            );
            const foundService = servicesResponse.data.find(
              (s) => s.serviceId === parseInt(serviceId)
            );
            if (foundService) {
              setService(foundService);
            } else {
              setError("Service not found");
            }
          }
        } catch (err) {
          console.error("Failed to fetch booking data:", err);
          setError("Failed to load booking information");
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
  // ---------------------------------------------------
  // פונקציה שמביאה מהשרת את השעות הזמינות לתאריך שנבחר
  // ---------------------------------------------------
  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/availability?date=${date}&serviceId=${serviceId}`
      );
      setAvailableSlots(response.data.availableSlots || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      // Fallback to default slots
      // אם השרת נכשל – נותנים שעות ברירת מחדל
      setAvailableSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle date selection
   */
  // ---------------------------------------------------
  // בחירת תאריך:
  // שומרים תאריך, מאפסים שעה, טוענים שעות זמינות
  // ועוברים לשלב בחירת שעה
  // ---------------------------------------------------
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
    fetchAvailableSlots(date);
    setCurrentStep(BOOKING_STEPS.TIME);
  };

  /**
   * Handle time slot selection
   */
  // ---------------------------------------------------
  // בחירת שעה:
  // שומרים שעה וממשיכים לטופס הלקוח
  // ---------------------------------------------------
  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(BOOKING_STEPS.FORM);
  };

  /**
   * Handle customer form submission
   */
  // ---------------------------------------------------
  // סיום מילוי טופס לקוח:
  // שומרים את הנתונים ועוברים לאישור סופי
  // ---------------------------------------------------
  const handleFormSubmit = (formData) => {
    setCustomerData(formData);
    setCurrentStep(BOOKING_STEPS.CONFIRMATION);
  };

  /**
   * Handle final booking confirmation
   */
  // ---------------------------------------------------
  // אישור סופי של התור:
  // בונה bookingData ושולח POST לשרת
  // אם הצלחה – מציג מסך SUCCESS ואז מעביר לדשבורד
  // ---------------------------------------------------
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    try {
      const bookingData = {
        businessId: parseInt(businessId),
        serviceId: parseInt(serviceId),
        date: selectedDate,
        time: selectedTime,
        firstName:
          customerData.customerInfo?.firstName || customerData.firstName,
        lastName: customerData.customerInfo?.lastName || customerData.lastName,
        phone: customerData.customerInfo?.phone || customerData.phone,
        email: customerData.customerInfo?.email || customerData.email,
        notes: customerData.customerInfo?.notes || customerData.notes || "",
      };

      const response = await axiosInstance.post("/appointments", bookingData);

      // Success - show success step
      setCurrentStep(BOOKING_STEPS.SUCCESS);

      // Auto-redirect after 5 seconds
      // לאחר 5 שניות מעביר אוטומטית לדשבורד המשתמש
      setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem("userInfo"));
        if (currentUser) {
          navigate(`/user/${currentUser.id}/dashboard`, {
            state: {
              message: "הזמנה נוצרה בהצלחה!",
              appointmentId: response.data.appointmentId,
            },
          });
        } else {
          navigate("/login");
        }
      }, 5000);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      setError("שגיאה ביצירת התור. אנא נסה שוב.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Navigate to previous step
   */
  // ---------------------------------------------------
  // פונקציה לחזרה לשלב קודם לפי השלב הנוכחי
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // חישוב אחוז התקדמות לסרגל ההתקדמות
  // ---------------------------------------------------
  const stepOrder = Object.values(BOOKING_STEPS);
  const currentStepIndex = stepOrder.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / stepOrder.length) * 100;

  // ---------------------------------------------------
  // תצוגת טעינה בזמן טעינת העסק
  // ---------------------------------------------------
  if (isLoading && !business) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loading}>טוען נתוני הזמנה...</div>
      </div>
    );
  }

  // ---------------------------------------------------
  // תצוגת שגיאה כללית
  // ---------------------------------------------------
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

  // ---------------------------------------------------
  // אם אין נתונים – מציג שגיאה על עסק או שירות
  // ---------------------------------------------------
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
      {/* כותרת ראשית + כפתור חזרה + סרגל התקדמות */}
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
      {/* קומפוננטת סיכום שירות תמיד מוצגת כדי שהמשתמש יראה מה בחר */}
      <ServiceSummary
        business={business}
        service={service}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      {/* Step Content */}
      {/* כאן מוצג התוכן לפי השלב הנוכחי */}
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

        {currentStep === BOOKING_STEPS.SUCCESS && (
          <div className={styles.successStep}>
            <div className={styles.successIcon}>
              <FiCheck />
            </div>
            <h1 className={styles.successTitle}>התור נקבע בהצלחה!</h1>
            <p className={styles.successSubtitle}>
              קיבלת אישור לתור שלך. פרטי התור נשלחו לאימייל שלך.
            </p>
            <div className={styles.bookingNumber}>
              <span>
                מספר תור: <strong>#{Date.now().toString().slice(-6)}</strong>
              </span>
            </div>
            <div className={styles.successDetails}>
              <div className={styles.successDetailItem}>
                <strong>{service?.service_name || service?.name}</strong>
              </div>
              <div className={styles.successDetailItem}>
                <FiCalendar />{" "}
                {new Date(selectedDate).toLocaleDateString("he-IL")} בשעה{" "}
                {selectedTime}
              </div>
              <div className={styles.successDetailItem}>
                <FiMapPin /> {business?.business_name || business?.name}
              </div>
            </div>
            <p className={styles.redirectMessage}>
              מעביר אותך לדשבורד תוך 5 שניות...
            </p>
            <button
              onClick={() => {
                const currentUser = JSON.parse(
                  localStorage.getItem("userInfo")
                );
                if (currentUser) {
                  navigate(`/user/${currentUser.id}/dashboard`);
                } else {
                  navigate("/login");
                }
              }}
              className={styles.goToDashboardButton}
            >
              עבור לדשבורד עכשיו
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
