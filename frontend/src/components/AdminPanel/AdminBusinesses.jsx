/**
 * Admin Business Management Component
 * Provides comprehensive business management with status-based tabs and approval workflow
 * 
 * @component
 * @returns {JSX.Element} Business management interface with tabs and actions
 */

import React, { useState, useEffect } from "react";
import axiosInstance from "../../api/axiosInstance";
import styles from "./AdminBusinesses.module.css";

function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // Start with pending for urgent actions
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0
  });

  // Status tab configuration
  const statusTabs = [
    { id: "pending", label: "ממתינים לאישור", status: "pending", urgent: true },
    { id: "approved", label: "מאושרים", status: "approved" },
    { id: "rejected", label: "נדחו", status: "rejected" },
    { id: "all", label: "הכל", status: "" }
  ];

  const loadBusinesses = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusTabs.find(tab => tab.id === activeTab)?.status || ''
      };

      const response = await axiosInstance.get('/admin/businesses', { params });
      
      setBusinesses(response.data.businesses || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to load businesses:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBusinesses();
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    // Reset to first page when tab or search changes
    setPagination(prev => ({ ...prev, page: 1 }));
    const timeoutId = setTimeout(() => {
      loadBusinesses();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [activeTab, searchTerm]);

  const handleBusinessAction = async (businessId, action) => {
    try {
      if (action === 'approve') {
        await axiosInstance.put(`/admin/businesses/${businessId}/approve`);
      } else if (action === 'reject') {
        await axiosInstance.put(`/admin/businesses/${businessId}/reject`);
      }
      
      // Reload businesses to reflect changes
      loadBusinesses();
    } catch (error) {
      console.error(`Failed to ${action} business:`, error);
    }
  };

  const handleDeleteBusiness = async (businessId) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עסק זה? פעולה זו אינה ניתנת לביטול.")) {
      try {
        await axiosInstance.delete(`/admin/businesses/${businessId}`);
        loadBusinesses();
      } catch (error) {
        console.error("Failed to delete business:", error);
      }
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "ממתין לאישור",
      approved: "מאושר", 
      rejected: "נדחה"
    };
    return statusMap[status] || "לא ידוע";
  };

  const getStatusColor = (status) => {
    const colorMap = {
      pending: "#ff9800",
      approved: "#4caf50",
      rejected: "#f44336"
    };
    return colorMap[status] || "#9e9e9e";
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
      
      {/* Status Tabs */}
      <div className={styles.statusTabs}>
        {statusTabs.map(tab => (
          <button
            key={tab.id}
            className={`${styles.statusTab} ${
              activeTab === tab.id ? styles.activeTab : ''
            } ${tab.urgent ? styles.urgentTab : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.urgent && pagination.total > 0 && (
              <span className={styles.urgentBadge}>
                {pagination.total}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Search and Controls */}
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
        
        <div className={styles.statsInfo}>
          {activeTab === "pending" && pagination.total > 0 && (
            <span className={styles.urgentInfo}>
              ⚠️ {pagination.total} עסקים הממתינים לאישור
            </span>
          )}
          {activeTab !== "pending" && (
            <span>סה״כ {pagination.total} עסקים</span>
          )}
        </div>
      </div>

      {/* Businesses Table */}
      <div className={styles.businessesTable}>
        <div className={styles.tableHeader}>
          <div className={styles.headerCell}>עסק</div>
          <div className={styles.headerCell}>בעלים</div>
          <div className={styles.headerCell}>קטגוריה</div>
          <div className={styles.headerCell}>סטטוס</div>
          <div className={styles.headerCell}>תאריך יצירה</div>
          <div className={styles.headerCell}>פעולות</div>
        </div>
        
        {businesses.map(business => (
          <div key={business.business_id} className={styles.tableRow}>
            <div className={styles.tableCell}>
              <div className={styles.businessInfo}>
                <div className={styles.businessName}>{business.name}</div>
                <div className={styles.businessLocation}>{business.location}</div>
                {business.description && (
                  <div className={styles.businessDescription}>
                    {business.description.substring(0, 60)}...
                  </div>
                )}
              </div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.ownerInfo}>
                <div className={styles.ownerName}>
                  {business.owner_first_name} {business.owner_last_name}
                </div>
                <div className={styles.ownerContact}>
                  {business.owner_email}
                </div>
                {business.owner_phone && (
                  <div className={styles.ownerPhone}>
                    {business.owner_phone}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.tableCell}>
              <span className={styles.categoryTag}>
                {business.category}
              </span>
            </div>
            <div className={styles.tableCell}>
              <span 
                className={styles.statusTag}
                style={{ 
                  backgroundColor: getStatusColor(business.status) + "20",
                  color: getStatusColor(business.status),
                  borderColor: getStatusColor(business.status)
                }}
              >
                {getStatusText(business.status)}
              </span>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.dateInfo}>
                {new Date(business.created_at).toLocaleDateString('he-IL')}
              </div>
            </div>
            <div className={styles.tableCell}>
              <div className={styles.actions}>
                {business.status === "pending" && (
                  <>
                    <button
                      className={styles.approveBtn}
                      onClick={() => handleBusinessAction(business.business_id, 'approve')}
                    >
                      אשר
                    </button>
                    <button
                      className={styles.rejectBtn}
                      onClick={() => handleBusinessAction(business.business_id, 'reject')}
                    >
                      דחה
                    </button>
                  </>
                )}
                {business.status === "approved" && (
                  <button
                    className={styles.rejectBtn}
                    onClick={() => handleBusinessAction(business.business_id, 'reject')}
                  >
                    דחה
                  </button>
                )}
                {business.status === "rejected" && (
                  <button
                    className={styles.approveBtn}
                    onClick={() => handleBusinessAction(business.business_id, 'approve')}
                  >
                    אשר
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteBusiness(business.business_id)}
                >
                  מחק
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {businesses.length === 0 && !loading && (
        <div className={styles.noResults}>
          <p>
            {activeTab === "pending" ? 
              "🎉 אין עסקים הממתינים לאישור" : 
              "לא נמצאו עסקים התואמים לחיפוש"
            }
          </p>
        </div>
      )}
      
      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
          >
            הקודם
          </button>
          
          <span className={styles.paginationInfo}>
            עמוד {pagination.page} מתוך {pagination.totalPages}
          </span>
          
          <button
            className={styles.paginationBtn}
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages}
          >
            הבא
          </button>
        </div>
      )}
    </div>
  );
}

export default AdminBusinesses;