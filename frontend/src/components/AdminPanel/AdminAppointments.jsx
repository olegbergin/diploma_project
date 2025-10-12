/**
 * Admin Appointments Management Component
 * Allows administrators to view and manage system appointments
 * 
 * @component
 * @returns {JSX.Element} Appointments management interface
 */

import React, { useState, useEffect } from "react";
import styles from "./AdminAppointments.module.css";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadAppointments = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setAppointments([
            {
              id: 1,
              customerName: "אברהם כהן",
              customerEmail: "abraham@email.com",
              businessName: "מאפיית איילה",
              serviceName: "עוגת יום הולדת",
              date: "2024-01-25",
              time: "10:00",
              duration: 60,
              status: "confirmed",
              price: 250,
              notes: "עוגה בטעם שוקולד עם כיתוב מיוחד"
            },
            {
              id: 2,
              customerName: "שרה לוי",
              customerEmail: "sarah@email.com",
              businessName: "סלון יופי רחל",
              serviceName: "תספורת ועיצוב",
              date: "2024-01-25",
              time: "14:30",
              duration: 90,
              status: "pending",
              price: 180,
              notes: "לקוחה חדשה, להכין ייעוץ צבעים"
            },
            {
              id: 3,
              customerName: "דוד שמעון",
              customerEmail: "david@email.com",
              businessName: "מוסך דוד",
              serviceName: "החלפת שמן",
              date: "2024-01-24",
              time: "09:00",
              duration: 30,
              status: "completed",
              price: 120,
              notes: "רכב טויוטה קורולה 2018"
            },
            {
              id: 4,
              customerName: "רחל אברמוביץ",
              customerEmail: "rachel@email.com",
              businessName: "מרפאת שיניים ד\"ר כהן",
              serviceName: "בדיקה כללית",
              date: "2024-01-26",
              time: "16:00",
              duration: 45,
              status: "cancelled",
              price: 200,
              notes: "בדיקה שנתית + ניקוי אבנית"
            },
            {
              id: 5,
              customerName: "משה גרין",
              customerEmail: "moshe@email.com",
              businessName: "מאפיית איילה",
              serviceName: "לחמניות לשבת",
              date: "2024-01-26",
              time: "07:00",
              duration: 15,
              status: "confirmed",
              price: 35,
              notes: "12 לחמניות רגילות"
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load appointments:", error);
        setLoading(false);
      }
    };

    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      appointment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || appointment.status === filterStatus;
    
    const matchesDate = !filterDate || appointment.date === filterDate;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prevAppointments => 
      prevAppointments.map(appointment => 
        appointment.id === appointmentId ? { ...appointment, status: newStatus } : appointment
      )
    );
    // TODO: Add API call to update appointment status
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "ממתין",
      confirmed: "מאושר",
      completed: "הושלם",
      cancelled: "בוטל"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ff9800",
      confirmed: "#4caf50",
      completed: "#2196f3",
      cancelled: "#f44336"
    };
    return colorMap[status] || "#9e9e9e";
  };

  const formatTime = (time) => {
    return time;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('he-IL');
  };

  if (loading) {
    return (
      <div className={styles.appointmentsContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען תורים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.appointmentsContainer}>
      <h2 className={styles.sectionTitle}>ניהול תורים</h2>
      
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש תורים..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>
        
        <div className={styles.filterContainer}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={styles.filterSelect}
          >
            <option value="all">כל הסטטוסים</option>
            <option value="pending">ממתין</option>
            <option value="confirmed">מאושר</option>
            <option value="completed">הושלם</option>
            <option value="cancelled">בוטל</option>
          </select>
        </div>

        <div className={styles.dateContainer}>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={styles.dateInput}
          />
        </div>
      </div>

      <div className={styles.appointmentsTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>לקוח</div>
          <div className={styles.headerCell}>עסק</div>
          <div className={styles.headerCell}>שירות</div>
          <div className={styles.headerCell}>תאריך ושעה</div>
          <div className={styles.headerCell}>מחיר</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>
        
        {filteredAppointments.map(appointment => (
          <div key={appointment.id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <div className={styles.customerInfo}>
                <div className={styles.customerName}>{appointment.customerName}</div>
                <div className={styles.customerEmail}>{appointment.customerEmail}</div>
              </div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.businessName}>{appointment.businessName}</div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.serviceInfo}>
                <div className={styles.serviceName}>{appointment.serviceName}</div>
                <div className={styles.serviceDuration}>{appointment.duration} דקות</div>
              </div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.dateTimeInfo}>
                <div className={styles.appointmentDate}>{formatDate(appointment.date)}</div>
                <div className={styles.appointmentTime}>{formatTime(appointment.time)}</div>
              </div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.price}>₪{appointment.price}</div>
            </div>
            <div className={styles.tableCell}>
              <span 
                className={styles.statusTag}
                style={{ 
                  backgroundColor: getStatusColor(appointment.status) + "20",
                  color: getStatusColor(appointment.status)
                }}
              >
                {getStatusText(appointment.status)}
              </span>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.actions}>
                {appointment.status === "pending" && (
                  <>
                    <button
                      className={styles.confirmBtn}
                      onClick={() => handleStatusChange(appointment.id, "confirmed")}
                    >
                      אשר
                    </button>
                    <button
                      className={styles.cancelBtn}
                      onClick={() => handleStatusChange(appointment.id, "cancelled")}
                    >
                      בטל
                    </button>
                  </>
                )}
                {appointment.status === "confirmed" && (
                  <button
                    className={styles.completeBtn}
                    onClick={() => handleStatusChange(appointment.id, "completed")}
                  >
                    סמן כהושלם
                  </button>
                )}
                <button className={styles.viewBtn}>
                  פרטים
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAppointments.length === 0 && (
        <div className={styles.noResults}>
          <p>לא נמצאו תורים התואמים לחיפוש</p>
        </div>
      )}
    </div>
  );
}

export default AdminAppointments;