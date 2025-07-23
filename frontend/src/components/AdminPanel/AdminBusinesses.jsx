/**
 * Admin Businesses Management Component
 * Allows administrators to view and manage businesses in the system
 * 
 * @component
 * @returns {JSX.Element} Businesses management interface
 */

import React, { useState, useEffect } from "react";
import styles from "./AdminBusinesses.module.css";

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    // TODO: Replace with actual API call
    const loadBusinesses = async () => {
      try {
        // Mock data for now
        setTimeout(() => {
          setBusinesses([
            {
              id: 1,
              name: "מאפיית איילה",
              category: "מאפיה",
              owner: "איילה כהן",
              email: "ayala@bakery.com",
              phone: "054-1234567",
              status: "active",
              servicesCount: 8,
              appointmentsCount: 156,
              createdAt: "2024-01-10",
              address: "רחוב הרצל 15, תל אביב"
            },
            {
              id: 2,
              name: "סלון יופי רחל",
              category: "יופי וטיפוח",
              owner: "רחל לוי",
              email: "rachel@beauty.com",
              phone: "052-9876543",
              status: "pending",
              servicesCount: 12,
              appointmentsCount: 89,
              createdAt: "2024-01-18",
              address: "שדרות רוטשילד 42, תל אביב"
            },
            {
              id: 3,
              name: "מוסך דוד",
              category: "רכב",
              owner: "דוד שמעון",
              email: "david@garage.com",
              phone: "053-5555555",
              status: "suspended",
              servicesCount: 6,
              appointmentsCount: 23,
              createdAt: "2023-12-15",
              address: "רחוב המלאכה 8, פתח תקווה"
            },
            {
              id: 4,
              name: "מרפאת שיניים ד\"ר כהן",
              category: "בריאות",
              owner: "ד\"ר משה כהן",
              email: "cohen@dental.com",
              phone: "050-1111111",
              status: "active",
              servicesCount: 15,
              appointmentsCount: 267,
              createdAt: "2023-11-20",
              address: "רחוב דיזנגוף 123, תל אביב"
            }
          ]);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Failed to load businesses:", error);
        setLoading(false);
      }
    };

    loadBusinesses();
  }, []);

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = 
      business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
      business.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "all" || business.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (businessId, newStatus) => {
    setBusinesses(prevBusinesses => 
      prevBusinesses.map(business => 
        business.id === businessId ? { ...business, status: newStatus } : business
      )
    );
    // TODO: Add API call to update business status
  };

  const getStatusText = (status) => {
    const statusMap = {
      active: "פעיל",
      pending: "ממתין לאישור",
      suspended: "מושעה"
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      active: "#4caf50",
      pending: "#ff9800",
      suspended: "#f44336"
    };
    return colorMap[status] || "#9e9e9e";
  };

  const getCategoryEmoji = (category) => {
    const emojiMap = {
      "מאפיה": "🥖",
      "יופי וטיפוח": "💄",
      "רכב": "🚗",
      "בריאות": "🏥",
      "מסעדה": "🍽️",
      "חינוך": "📚"
    };
    return emojiMap[category] || "🏢";
  };

  if (loading) {
    return (
      <div className={styles.businessesContainer}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען עסקים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.businessesContainer}>
      <h2 className={styles.sectionTitle}>ניהול עסקים</h2>
      
      <div className={styles.controls}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="חיפוש עסקים..."
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
            <option value="active">פעיל</option>
            <option value="pending">ממתין לאישור</option>
            <option value="suspended">מושעה</option>
          </select>
        </div>
      </div>

      <div className={styles.businessesGrid}>
        {filteredBusinesses.map(business => (
          <div key={business.id} className={styles.businessCard}>
            <div className={styles.cardHeader}>
              <div className={styles.businessInfo}>
                <div className={styles.businessIcon}>
                  {getCategoryEmoji(business.category)}
                </div>
                <div className={styles.businessDetails}>
                  <h3 className={styles.businessName}>{business.name}</h3>
                  <p className={styles.businessCategory}>{business.category}</p>
                </div>
              </div>
              <div 
                className={styles.statusBadge}
                style={{ 
                  backgroundColor: getStatusColor(business.status) + "20",
                  color: getStatusColor(business.status)
                }}
              >
                {getStatusText(business.status)}
              </div>
            </div>

            <div className={styles.cardContent}>
              <div className={styles.ownerInfo}>
                <span className={styles.label}>בעלים:</span>
                <span className={styles.value}>{business.owner}</span>
              </div>
              
              <div className={styles.contactInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.label}>📧</span>
                  <span className={styles.value}>{business.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>📞</span>
                  <span className={styles.value}>{business.phone}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.label}>📍</span>
                  <span className={styles.value}>{business.address}</span>
                </div>
              </div>

              <div className={styles.statsInfo}>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{business.servicesCount}</span>
                  <span className={styles.statLabel}>שירותים</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statValue}>{business.appointmentsCount}</span>
                  <span className={styles.statLabel}>תורים</span>
                </div>
              </div>
            </div>

            <div className={styles.cardActions}>
              {business.status === "pending" && (
                <button
                  className={styles.approveBtn}
                  onClick={() => handleStatusChange(business.id, "active")}
                >
                  אשר עסק
                </button>
              )}
              {business.status === "active" && (
                <button
                  className={styles.suspendBtn}
                  onClick={() => handleStatusChange(business.id, "suspended")}
                >
                  השעה עסק
                </button>
              )}
              {business.status === "suspended" && (
                <button
                  className={styles.activateBtn}
                  onClick={() => handleStatusChange(business.id, "active")}
                >
                  הפעל עסק
                </button>
              )}
              <button className={styles.viewBtn}>
                צפה בפרטים
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredBusinesses.length === 0 && (
        <div className={styles.noResults}>
          <p>לא נמצאו עסקים התואמים לחיפוש</p>
        </div>
      )}
    </div>
  );
}

export default AdminBusinesses;