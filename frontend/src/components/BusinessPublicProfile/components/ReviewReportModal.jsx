import React, { useState } from 'react';
import styles from './ReviewReportModal.module.css';
import axiosInstance from '../../../api/axiosInstance';
import { useContext } from 'react';
import { UserContext } from '../../../context/UserContext';

const ReviewReportModal = ({ review, isOpen, onClose, onSuccess }) => {
  const [complaintType, setComplaintType] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useContext(UserContext);

  const complaintTypes = [
    { value: 'inappropriate', label: 'תוכן לא מתאים' },
    { value: 'fake', label: 'ביקורת מזויפת' },
    { value: 'offensive', label: 'תוכן פוגעני' },
    { value: 'spam', label: 'ספאם' },
    { value: 'other', label: 'אחר' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!complaintType) {
      setError('אנא בחר סוג תלונה');
      return;
    }

    if (!user) {
      setError('יש להתחבר כדי לדווח על ביקורת');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.post(`/reviews/${review.reviewId}/report`, {
        reporterId: user.id,
        complaintType,
        complaintText: complaintText.trim() || null
      });

      onSuccess && onSuccess();
      
      // Reset form
      setComplaintType('');
      setComplaintText('');
      
      alert('הדיווח נשלח בהצלחה. צוות המנהלים יבחן את הבקשה.');
    } catch (error) {
      console.error('Error reporting review:', error);
      setError(
        error.response?.data?.error || 
        'שגיאה בשליחת הדיווח. אנא נסה שוב.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setComplaintType('');
      setComplaintText('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !review) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>דיווח על ביקורת</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.reviewPreview}>
          <div className={styles.reviewInfo}>
            <strong>{review.customerName}</strong>
            <div className={styles.stars}>
              {Array.from({ length: 5 }, (_, index) => (
                <span
                  key={index}
                  className={`${styles.star} ${index < review.rating ? styles.filled : ''}`}
                >
                  ★
                </span>
              ))}
            </div>
          </div>
          {review.text && (
            <div className={styles.reviewText}>
              "{review.text}"
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>
              סוג התלונה *
            </label>
            <select
              value={complaintType}
              onChange={(e) => setComplaintType(e.target.value)}
              className={styles.select}
              disabled={loading}
              required
            >
              <option value="">בחר סוג תלונה</option>
              {complaintTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="complaintText" className={styles.label}>
              פירוט נוסף (אופציונלי)
            </label>
            <textarea
              id="complaintText"
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              placeholder="פרט מדוע ברצונך לדווח על הביקורת הזו..."
              className={styles.textarea}
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className={styles.characterCount}>
              {complaintText.length}/500
            </div>
          </div>

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || !complaintType}
            >
              {loading ? 'שולח דיווח...' : 'שלח דיווח'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewReportModal;