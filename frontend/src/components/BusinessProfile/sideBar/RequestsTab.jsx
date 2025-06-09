// src/components/BusinessProfile/sideBar/RequestsTab.jsx

// --- Imports ---
import { useEffect, useState } from "react";
// Import our configured axios instance
import axiosInstance from "../../../api/axiosInstance"; // Adjust the path as necessary
// Import styles
import styles from "./RequestsTab.module.css";

/**
 * RequestsTab component for business owners to view and manage new appointment requests.
 * @param {object} props
 * @param {number|string} props.businessId - The ID of the current business.
 * @param {function} props.onAction - A callback function to notify the parent component of an action (e.g., to update a counter).
 */
export default function RequestsTab({ businessId, onAction }) {
  // --- State Hooks ---
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Added state for error handling

  // Get the current month in YYYY-MM format to fetch relevant requests
  const monthIso = new Date().toISOString().slice(0, 7);

  // --- Effect to fetch pending requests ---
  useEffect(() => {
    // Ensure businessId is available before fetching
    if (!businessId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null); // Clear previous errors

    // Define parameters for the GET request
    const params = {
      businessId: businessId,
      month: monthIso,
      status: 'pending'
    };

    // --- ИЗМЕНЕНИЕ 1: Fetching data with axios ---
    axiosInstance.get('/appointments', { params })
      .then(response => {
        // With axios, data is in response.data
        setRequests(response.data);
      })
      .catch(err => {
        // Handle potential errors
        console.error("Failed to fetch appointment requests:", err);
        setError("Could not load requests. Please try again later.");
      })
      .finally(() => {
        // This will run after the request is complete (success or failure)
        setLoading(false);
      });

  }, [businessId, monthIso]); // Re-run effect if businessId or month changes

  // --- Handler for approving or declining a request ---
  const handleAction = async (appointmentId, newStatus) => {
    try {
      // --- ИЗМЕНЕНИЕ 2: Updating data with axios ---
      // Use axios.put to send the update request.
      // The URL is relative to the baseURL in axiosInstance.
      // The second argument is the request body.
      await axiosInstance.put(`/appointments/${appointmentId}`, {
        status: newStatus
      });

      // If the request is successful, update the UI immediately
      // by filtering out the handled request.
      setRequests(prevRequests =>
        prevRequests.filter(req => req.appointment_id !== appointmentId)
      );

      // Call the parent's onAction callback if it exists
      if (onAction) {
        onAction();
      }
    } catch (err) {
      // --- ИЗМЕНЕНИЕ 3: Improved error handling ---
      console.error(`Failed to ${newStatus} appointment:`, err);
      // Display an error message to the user
      alert(`שגיאה בעדכון הבקשה. נסה שוב.`); // Error updating the request. Try again.
    }
  };

  // --- Conditional Rendering ---
  if (loading) {
    return <div className={styles.loader}>טוען בקשות…</div>; // Loading requests...
  }

  if (error) {
    return <div className={styles.empty}>{error}</div>; // Display error message
  }

  if (requests.length === 0) {
    return <div className={styles.empty}>אין בקשות חדשות.</div>; // No new requests.
  }

  // --- JSX for Rendering the List ---
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>בקשות תור חדשות</h3> {/* New Appointment Requests */}
      <ul className={styles.list}>
        {requests.map((req) => (
          <li key={req.appointment_id} className={styles.card}>
            <div>
              <span className={styles.date}>{req.date} {req.time}</span>
              <span className={styles.label}>לקוח:</span> <span>{req.customer_id}</span>
              <span className={styles.label}>שירות:</span> <span>{req.service_id}</span>
              {req.notes && (
                <>
                  <span className={styles.label}>הערות:</span> <span>{req.notes}</span>
                </>
              )}
            </div>
            <div className={styles.actions}>
              <button
                className={styles.approve}
                onClick={() => handleAction(req.appointment_id, "scheduled")}
              >
                אשר {/* Approve */}
              </button>
              <button
                className={styles.decline}
                onClick={() => handleAction(req.appointment_id, "declined")}
              >
                דחה {/* Decline */}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}