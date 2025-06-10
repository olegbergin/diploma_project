import { useEffect, useState } from "react";
import styles from "./RequestsTab.module.css";

export default function RequestsTab({ businessId, onAction }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // לחודש הנוכחי (למנוע בקשות "ישנות")
  const monthIso = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    setLoading(true);
    fetch(
      `/api/appointments?businessId=${businessId}&month=${monthIso}&status=pending`
    )
      .then((r) => r.json())
      .then(setRequests)
      .finally(() => setLoading(false));
  }, [businessId, monthIso]);

  const handleAction = async (id, status) => {
    await fetch(`/api/appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setRequests((reqs) => reqs.filter((r) => r.appointment_id !== id));
    if (onAction) onAction(); // עדכון המונה במודל
  };

  if (loading) return <div className={styles.loader}>טוען בקשות…</div>;
  if (!requests.length)
    return <div className={styles.empty}>אין בקשות חדשות.</div>;

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
