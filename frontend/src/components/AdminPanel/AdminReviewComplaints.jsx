import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import styles from './AdminReviewComplaints.module.css';

const AdminReviewComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [hideReason, setHideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    fetchComplaints();
  }, [statusFilter, currentPage]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        limit: itemsPerPage,
        offset: (currentPage - 1) * itemsPerPage
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      const response = await axiosInstance.get('/admin/reviews/complaints', { params });

      // Map camelCase response to snake_case for component
      const mappedComplaints = (response.data.complaints || []).map(c => ({
        complaint_id: c.complaintId,
        review_id: c.reviewId,
        complaint_type: c.complaintType,
        complaint_text: c.complaintText,
        status: c.status,
        admin_notes: c.adminNotes,
        complaint_created_at: c.createdAt,
        rating: c.review?.rating,
        review_text: c.review?.text,
        customer_name: c.review?.customerName,
        business_name: c.review?.businessName,
        reporter_name: c.reporterName
      }));

      setComplaints(mappedComplaints);
      setTotalComplaints(response.data.total || 0);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('שגיאה בטעינת התלונות');
    } finally {
      setLoading(false);
    }
  };

  const handleDismissComplaint = async (complaintId) => {
    if (!window.confirm('האם אתה בטוח שברצונך לדחות תלונה זו?')) {
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.put(`/admin/complaints/${complaintId}/resolve`, {
        resolution: 'dismissed',
        adminNotes: 'התלונה נדחתה על ידי המנהל'
      });

      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error dismissing complaint:', error);
      alert('שגיאה בדחיית התלונה');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHideReview = async () => {
    if (!selectedComplaint || !hideReason.trim()) {
      alert('נא למלא סיבה להסתרת הביקורת');
      return;
    }

    try {
      setActionLoading(true);

      // Hide the review - backend expects 'action' and 'reason'
      await axiosInstance.put(`/admin/reviews/${selectedComplaint.review_id}/moderate`, {
        action: 'hide',
        reason: hideReason.trim()
      });

      // Mark complaint as resolved - backend expects 'resolution'
      await axiosInstance.put(`/admin/complaints/${selectedComplaint.complaint_id}/resolve`, {
        resolution: 'resolved',
        adminNotes: `הביקורת הוסתרה. סיבה: ${hideReason.trim()}`
      });

      setShowHideModal(false);
      setSelectedComplaint(null);
      setHideReason('');
      fetchComplaints(); // Refresh the list
    } catch (error) {
      console.error('Error hiding review:', error);
      alert('שגיאה בהסתרת הביקורת');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getComplaintTypeLabel = (type) => {
    const types = {
      inappropriate: 'תוכן לא מתאים',
      fake: 'ביקורת מזויפת',
      offensive: 'תוכן פוגעני',
      spam: 'ספאם',
      other: 'אחר'
    };
    return types[type] || type;
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'ממתין', className: styles.statusPending },
      reviewed: { text: 'נבדק', className: styles.statusReviewed },
      resolved: { text: 'טופל', className: styles.statusResolved },
      dismissed: { text: 'נדחה', className: styles.statusDismissed }
    };
    const badge = badges[status] || { text: status, className: '' };
    return <span className={`${styles.statusBadge} ${badge.className}`}>{badge.text}</span>;
  };

  const filteredComplaints = complaints.filter(complaint => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      complaint.business_name?.toLowerCase().includes(search) ||
      complaint.customer_name?.toLowerCase().includes(search) ||
      complaint.reporter_name?.toLowerCase().includes(search) ||
      complaint.review_text?.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalComplaints / itemsPerPage);

  if (loading && complaints.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען תלונות...</p>
        </div>
      </div>
    );
    value = { statusFilter }
    onChange = {(e) => {
  setStatusFilter(e.target.value);
  setCurrentPage(1);
}}
className = { styles.select }
  >
            <option value="all">הכל</option>
            <option value="pending">ממתין</option>
            <option value="reviewed">נבדק</option>
            <option value="resolved">טופל</option>
            <option value="dismissed">נדחה</option>
          </select >
        </div >

  <div className={styles.filterGroup}>
    <input
      type="text"
      placeholder="חיפוש לפי עסק, לקוח או תוכן..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className={styles.searchInput}
    />
  </div>
      </div >

  { error && (
    <div className={styles.error}>
      {error}
      <button onClick={fetchComplaints} className={styles.retryButton}>
        נסה שוב
      </button>
    </div>
  )}

{/* Complaints List */ }
{
  filteredComplaints.length === 0 ? (
    <div className={styles.empty}>
      <p>לא נמצאו תלונות</p>
    </div>
  ) : (
  <>
    <div className={styles.complaintsTable}>
      {filteredComplaints.map((complaint) => (
        <div key={complaint.complaint_id} className={styles.complaintCard}>
          <div className={styles.complaintHeader}>
            <div className={styles.complaintInfo}>
              <h3>{complaint.business_name}</h3>
              {getStatusBadge(complaint.status)}
            </div>
            <span className={styles.complaintDate}>
              {formatDate(complaint.complaint_created_at)}
            </span>
          </div>

          <div className={styles.reviewSection}>
            <div className={styles.reviewMeta}>
              <strong>ביקורת של:</strong> {complaint.customer_name}
              <span className={styles.rating}>{renderStars(complaint.rating)}</span>
            </div>
            {complaint.review_text && (
              <div className={styles.reviewText}>
                "{complaint.review_text}"
              </div>
            )}
          </div>

          <div className={styles.complaintSection}>
            <div className={styles.complaintMeta}>
              <span className={styles.complaintType}>
                {getComplaintTypeLabel(complaint.complaint_type)}
              </span>
              <span className={styles.reporter}>
                דווח על ידי: {complaint.reporter_name}
              </span>
            </div>
            {complaint.complaint_text && (
              <div className={styles.complaintText}>
                {complaint.complaint_text}
              </div>
            )}
          </div>

          {complaint.status === 'pending' && (
            <div className={styles.actions}>
              <button
                className={styles.dismissButton}
                onClick={() => handleDismissComplaint(complaint.complaint_id)}
                disabled={actionLoading}
              >
                דחה תלונה
              </button>
              <button
                className={styles.hideButton}
                onClick={() => {
                  setSelectedComplaint(complaint);
                  setShowHideModal(true);
                }}
                disabled={actionLoading}
              >
                הסתר ביקורת
              </button>
            </div>
          )}

          {complaint.admin_notes && (
            <div className={styles.adminNotes}>
              <strong>הערות מנהל:</strong> {complaint.admin_notes}
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Pagination */}
    {totalPages > 1 && (
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
          disabled={currentPage === 1}
          className={styles.pageButton}
        >
          הקודם
        </button>
        <span className={styles.pageInfo}>
          עמוד {currentPage} מתוך {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
          className={styles.pageButton}
        >
          הבא
        </button>
      </div>
    )}
  </>
)
}

{/* Hide Review Modal */ }
{
  showHideModal && selectedComplaint && (
    <div className={styles.modalOverlay} onClick={() => !actionLoading && setShowHideModal(false)}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>הסתרת ביקורת</h3>
          <button
            className={styles.closeButton}
            onClick={() => !actionLoading && setShowHideModal(false)}
            disabled={actionLoading}
          >
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <p>הביקורת של {selectedComplaint.customer_name} על {selectedComplaint.business_name} תוסתר.</p>
          <p>נא לציין את הסיבה להסתרה:</p>

          <textarea
            value={hideReason}
            onChange={(e) => setHideReason(e.target.value)}
            placeholder="סיבה להסתרת הביקורת..."
            className={styles.textarea}
            rows={4}
            disabled={actionLoading}
          />
        </div>

        <div className={styles.modalActions}>
          <button
            onClick={() => !actionLoading && setShowHideModal(false)}
            className={styles.cancelButton}
            disabled={actionLoading}
          >
            ביטול
          </button>
          <button
            onClick={handleHideReview}
            className={styles.confirmButton}
            disabled={actionLoading || !hideReason.trim()}
          >
            {actionLoading ? 'מסתיר...' : 'הסתר ביקורת'}
          </button>
        </div>
      </div>
    </div>
  )
}
    </div >
  );
};

export default AdminReviewComplaints;
