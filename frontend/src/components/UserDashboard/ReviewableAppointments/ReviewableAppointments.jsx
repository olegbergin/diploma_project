import React, { useState, useEffect } from 'react';
import styles from './ReviewableAppointments.module.css';
import axiosInstance from '../../../api/axiosInstance';
import ReviewModal from '../ReviewModal/ReviewModal';
import { useToastContext } from '../../../context/ToastContext';

const ReviewableAppointments = ({ user, onReviewSubmitted }) => {
  const [reviewableAppointments, setReviewableAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { showInfo } = useToastContext();

  useEffect(() => {
    fetchReviewableAppointments();
  }, [user?.id]);

  const fetchReviewableAppointments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/reviewable/${user.id}`);
      setReviewableAppointments(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching reviewable appointments:', error);
      setError('שגיאה בטעינת תורים לביקורת');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowReviewModal(true);
  };

  const handleReviewSuccess = () => {
    // Remove the reviewed appointment from the list
    setReviewableAppointments(prev => 
      prev.filter(apt => apt.appointmentId !== selectedAppointment.appointmentId)
    );
    
    // Show informational toast
    showInfo('תודה על הביקורת! היא תופיע בעמוד העסק');
    
    // Notify parent component
    onReviewSubmitted && onReviewSubmitted();
    
    // Close modal
    setShowReviewModal(false);
    setSelectedAppointment(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>טוען תורים לביקורת...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchReviewableAppointments} className={styles.retryButton}>
          נסה שוב
        </button>
      </div>
    );
  }

  if (reviewableAppointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>⭐</div>
        <h3>אין תורים לביקורת</h3>
        <p>כל התורים שהושלמו כבר קיבלו ביקורת או שחלון הביקורת פג</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>תורים המחכים לביקורת</h3>
        <p className={styles.subtitle}>
          ביקורת ניתן לכתוב עד 30 יום לאחר השירות
        </p>
      </div>

      <div className={styles.appointmentsGrid}>
        {reviewableAppointments.map(appointment => (
          <div key={appointment.appointmentId} className={styles.appointmentCard}>
            <div className={styles.appointmentHeader}>
              <h4 className={styles.businessName}>{appointment.businessName}</h4>
              <div className={styles.reviewBadge}>
                ממתין לביקורת
              </div>
            </div>
            
            <div className={styles.appointmentDetails}>
              <p className={styles.serviceName}>{appointment.serviceName}</p>
              <p className={styles.appointmentDate}>
                {formatDate(appointment.appointmentDatetime)}
              </p>
              {appointment.price && (
                <p className={styles.price}>₪{appointment.price}</p>
              )}
            </div>

            <button
              onClick={() => handleReviewClick(appointment)}
              className={styles.reviewButton}
            >
              כתוב ביקורת ⭐
            </button>
          </div>
        ))}
      </div>

      <ReviewModal
        appointment={selectedAppointment}
        user={user}
        isOpen={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setSelectedAppointment(null);
        }}
        onSuccess={handleReviewSuccess}
      />
    </div>
  );
};

export default ReviewableAppointments;