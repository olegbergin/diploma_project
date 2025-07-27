// src/components/BusinessProfile/sideBar/RequestsTab.jsx

import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import styles from "./RequestsTab.module.css";

export default function RequestsTab({ businessId, onAction }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

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
      .then((response) => setRequests(response.data))
      .catch((err) => {
        console.error("Failed to fetch appointment requests:", err);
        setError("לא ניתן לטעון בקשות חדשות");
      })
      .finally(() => setLoading(false));
  }, [businessId, monthIso]);

  // שינוי סטטוס בקשה (אישור/דחייה)
  const handleAction = async (appointmentId, newStatus) => {
    try {
      await axiosInstance.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });
      setRequests((prev) =>
        prev.filter((req) => req.appointment_id !== appointmentId)
      );
      if (onAction) onAction();
    } catch {
      alert("שגיאה בעדכון הבקשה. נסו שוב.");
    }
  };

  // חיפוש פשוט
  const filteredRequests = requests.filter(
    (req) =>
      (req.notes || "").toLowerCase().includes(search.toLowerCase()) ||
      (req.customer_id + "").includes(search) ||
      (req.service_id + "").includes(search)
  );

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>בקשות תור חדשות</h2>
      <input
        className={styles.search}
        placeholder="חיפוש לפי לקוח/הערה"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <div className={styles.loader}>טוען בקשות…</div>
      ) : error ? (
        <div className={styles.empty}>{error}</div>
      ) : filteredRequests.length === 0 ? (
        <div className={styles.empty}>אין בקשות חדשות.</div>
      ) : (
        <ul className={styles.list}>
          {filteredRequests.map((req) => (
            <li key={req.appointment_id} className={styles.item}>
              <div>
                <div className={styles.date}>
                  {req.date} {req.time}
                </div>
                <div>
                  <span className={styles.label}>לקוח:</span>{" "}
                  <span>{req.customer_id}</span>
                </div>
                <div>
                  <span className={styles.label}>שירות:</span>{" "}
                  <span>{req.service_id}</span>
                </div>
                {req.notes && (
                  <div>
                    <span className={styles.label}>הערות:</span>{" "}
                    <span>{req.notes}</span>
                  </div>
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
      )}
    </div>
  );
}
