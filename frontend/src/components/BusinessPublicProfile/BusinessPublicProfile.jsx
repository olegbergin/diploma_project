import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import styles from "../BusinessProfile/BusinessProfile.module.css";
import Calendar from "../BusinessProfile/tabs/Calendar/Calendar";
import AppointmentForm from "../BusinessProfile/AppointmentForm/AppointmentForm"; // ודאי שיש לך import כזה

export default function BusinessPublicProfile() {
  const [business, setBusiness] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [innerTab, setInnerTab] = useState("calendar");
  const [booking, setBooking] = useState(null);

  const { id: businessId } = useParams();

  useEffect(() => {
    setLoading(true);
    axiosInstance
      .get(`/businesses/${businessId}`)
      .then((response) => setBusiness(response.data))
      .catch(() => setError("Could not load business information."))
      .finally(() => setLoading(false));
  }, [businessId]);

  useEffect(() => {
    // משיכת תורים לעסק
    axiosInstance
      .get(`/appointments`, { params: { businessId } })
      .then((res) => setAppointments(res.data))
      .catch(() => setAppointments([]));
  }, [businessId]);

  const handleCreateAppointment = async (newAppointmentData) => {
    try {
      const payload = {
        ...newAppointmentData,
        business_id: business.business_id,
      };
      await axiosInstance.post("/appointments", payload);
      alert("התור נשמר בהצלחה!");
      setBooking(null);
    } catch (err) {
      alert("שגיאה בשמירת תור.");
    }
  };

  if (loading) return <p className={styles.loading}>טוען נתוני עסק…</p>;
  if (error) return <p className={styles.loading}>{error}</p>;
  if (!business) return <p className={styles.loading}>לא נמצא עסק.</p>;

  return (
    <div className={styles.pageLayout}>
      <main className={styles.profileContent} style={{ margin: "auto" }}>
        <h1 className={styles.title}>{business.name}</h1>
        <p className={styles.category}>{business.category}</p>
        <p className={styles.description}>
          <strong>תיאור:</strong> {business.description}
        </p>

        <div className={styles.tabBar}>
          <button
            className={innerTab === "calendar" ? styles.activeTab : ""}
            onClick={() => setInnerTab("calendar")}
          >
            לוח שנה
          </button>
          <button
            className={innerTab === "contact" ? styles.activeTab : ""}
            onClick={() => setInnerTab("contact")}
          >
            צור קשר
          </button>
          <button
            className={innerTab === "galleryView" ? styles.activeTab : ""}
            onClick={() => setInnerTab("galleryView")}
          >
            גלריה
          </button>
        </div>

        {innerTab === "calendar" && (
          <section className={styles.section}>
            <h2>לוח שנה</h2>
            <Calendar
              appointments={appointments}
              onDaySelect={(iso, dayAppts) =>
                setBooking({ dateIso: iso, taken: dayAppts.map((a) => a.time) })
              }
            />
            {/* טופס הזמנת תור - רק אם בחרו יום */}
            {booking && (
              <AppointmentForm
                date={booking.dateIso}
                takenSlots={booking.taken}
                services={business.services || []}
                onSubmit={handleCreateAppointment}
                onCancel={() => setBooking(null)}
              />
            )}
          </section>
        )}
        {innerTab === "contact" && (
          <section className={styles.section}>
            <h2>פרטי יצירת קשר</h2>
            <p>
              <strong>אימייל:</strong> {business.email}
            </p>
            <p>
              <strong>טלפון:</strong> {business.phone}
            </p>
            <p>
              <strong>כתובת:</strong> {business.address}
            </p>
          </section>
        )}
        {innerTab === "galleryView" && (
          <section className={styles.section}>
            <h2>גלריה</h2>
            {/* ... */}
          </section>
        )}
      </main>
    </div>
  );
}
