/**
 * Booking Page Component
 * Main page for booking appointments with step-by-step process
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

const BOOKING_STEPS = {
  SUMMARY: "summary",
  CALENDAR: "calendar",
  TIME: "time",
  FORM: "form",
  CONFIRMATION: "confirmation",
  SUCCESS: "success",
};

function toYYYYMMDD(input) {
  if (!input) return "";
  if (typeof input === "string") {
    // "YYYY-MM-DD" או ISO
    if (/^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
    const d = new Date(input);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }
  // Date
  const d = input instanceof Date ? input : new Date(input);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function toHHMM(input) {
  if (!input) return "";
  if (typeof input === "string") {
    const m = input.match(/^(\d{1,2}):(\d{2})/);
    if (m) {
      const hh = String(parseInt(m[1], 10)).padStart(2, "0");
      const mm = m[2];
      return `${hh}:${mm}`;
    }
  }
  return "";
}

export default function BookingPage() {
  const { businessId, serviceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [business, setBusiness] = useState(location.state?.business || null);
  const [service, setService] = useState(location.state?.service || null);

  const [currentStep, setCurrentStep] = useState(BOOKING_STEPS.SUMMARY);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [customerData, setCustomerData] = useState({});
  const [availableSlots, setAvailableSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch business & service if not provided
  useEffect(() => {
    const fetchData = async () => {
      if (!business || !service) {
        setIsLoading(true);
        try {
          if (!business) {
            const businessResponse = await axiosInstance.get(
              `/businesses/${businessId}`
            );
            setBusiness(businessResponse.data);
          }
          if (!service) {
            const servicesResponse = await axiosInstance.get(
              `/businesses/${businessId}/services`
            );
            const foundService = servicesResponse.data.find(
              (s) => s.service_id === parseInt(serviceId)
            );
            if (foundService) setService(foundService);
            else setError("Service not found");
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

  // Fetch available time slots for selected date
  const fetchAvailableSlots = async (date) => {
    setIsLoading(true);
    try {
      const response = await axiosInstance.get(
        `/businesses/${businessId}/availability`,
        { params: { date: toYYYYMMDD(date), serviceId: serviceId } }
      );
      setAvailableSlots(response.data.availableSlots || []);
    } catch (err) {
      console.error("Failed to fetch availability:", err);
      setAvailableSlots(["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime(null);
    fetchAvailableSlots(date);
    setCurrentStep(BOOKING_STEPS.TIME);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setCurrentStep(BOOKING_STEPS.FORM);
  };

  const handleFormSubmit = (formData) => {
    setCustomerData(formData);
    setCurrentStep(BOOKING_STEPS.CONFIRMATION);
  };

  // Submit final booking
  const handleConfirmBooking = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // נורמליזציה לדיוק לפי מה שהשרת מצפה
      const dateStr = toYYYYMMDD(selectedDate);
      const timeStr = toHHMM(selectedTime);

      const bookingData = {
        businessId: parseInt(businessId),
        serviceId: parseInt(serviceId),
        date: dateStr, // "YYYY-MM-DD"
        time: timeStr, // "HH:MM"
        firstName:
          customerData.customerInfo?.firstName || customerData.firstName,
        lastName: customerData.customerInfo?.lastName || customerData.lastName,
        phone: customerData.customerInfo?.phone || customerData.phone,
        email: customerData.customerInfo?.email || customerData.email || "",
        notes: customerData.customerInfo?.notes || customerData.notes || "",
      };

      // ולידציה בסיסית לפני שליחה
      if (!bookingData.date || !bookingData.time) {
        throw new Error("תאריך/שעה לא תקינים");
      }

      // חשוב: אם ה-baseURL שלך כבר כולל /api, אפשר להשאיר '/appointments' בלבד
      const response = await axiosInstance.post(
        "/appointments",
        bookingData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setCurrentStep(BOOKING_STEPS.SUCCESS);

      // Auto-redirect after 5 seconds
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
          navigate("/home", { state: { message: "הזמנה נוצרה בהצלחה!" } });
        }
      }, 5000);
    } catch (err) {
      console.error("Failed to create appointment:", err);
      // ניסיון להוציא הודעות שגיאה מובְנות מהשרת (400/409)
      const serverMsg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        (err?.response?.data?.errors
          ? Object.values(err.response.data.errors).join(" • ")
          : "");

      setError(serverMsg || "שגיאה ביצירת התור. אנא נסי שוב.");
    } finally {
      setIsLoading(false);
    }
  };

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
        navigate(-1);
    }
  };

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

      <ServiceSummary
        business={business}
        service={service}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />

      <div className={styles.stepContent}>
        {currentStep === BOOKING_STEPS.SUMMARY && (
          <div className={styles.summaryStep}>
            <h2>בחרת את השירות</h2>
            <p>לחצי 'המשך' כדי לבחור תאריך ושעה</p>
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
                {new Date(toYYYYMMDD(selectedDate)).toLocaleDateString("he-IL")}{" "}
                בשעה {toHHMM(selectedTime)}
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
                if (currentUser) navigate(`/user/${currentUser.id}/dashboard`);
                else navigate("/home");
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
