// src/components/BusinessProfile/sideBar/RequestsTab.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./RequestsTab.module.css";

export default function RequestsTab({ businessId, onAction }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const monthIso = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const params = {
      businessId: businessId,
      month: monthIso,
      status: "pending",
    };

    axiosInstance
      .get("/appointments", { params })
      .then((response) => {
        setRequests(response.data);
      })
      .catch((err) => {
        console.error("Failed to fetch appointment requests:", err);
        setError("Could not load requests. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [businessId, monthIso]);

  // --- תיקן כאן את ה-URL ---
  const handleAction = async (appointmentId, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      setRequests((prevRequests) =>
        prevRequests.filter((req) => req.appointment_id !== appointmentId)
      );

      if (onAction) {
        onAction();
      }
    } catch (err) {
      console.error(`Failed to ${newStatus} appointment:`, err);
      alert(`שגיאה בעדכון הבקשה. נסה שוב.`);
    }
  };

  if (loading) {
    return <div className={styles.loader}>טוען בקשות…</div>;
  }

  if (error) {
    return <div className={styles.empty}>{error}</div>;
  }

  if (requests.length === 0) {
    return <div className={styles.empty}>אין בקשות חדשות.</div>;
  }

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>בקשות תור חדשות</h3>
      <ul className={styles.list}>
        {requests.map((req) => (
          <li key={req.appointment_id} className={styles.card}>
            <div>
              <span className={styles.date}>
                {req.date} {req.time}
              </span>
              <span className={styles.label}>לקוח:</span>{" "}
              <span>{req.customer_id}</span>
              <span className={styles.label}>שירות:</span>{" "}
              <span>{req.service_id}</span>
              {req.notes && (
                <>
                  <span className={styles.label}>הערות:</span>{" "}
                  <span>{req.notes}</span>
                </>
              )}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.approve}
                onClick={() => handleAction(req.appointment_id, "scheduled")}
              >
                אשר
              </button>
              <button
                className={styles.decline}
                onClick={() => handleAction(req.appointment_id, "declined")}
              >
                דחה
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
