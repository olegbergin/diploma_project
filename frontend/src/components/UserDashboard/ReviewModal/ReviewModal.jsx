import React, { useState } from 'react';
import styles from './ReviewModal.module.css';
import axiosInstance from '../../../api/axiosInstance';

const ReviewModal = ({ appointment, isOpen, onClose, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('אנא בחר דירוג');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await axiosInstance.post('/reviews', {
        appointmentId: appointment.appointmentId,
        customerId: appointment.customerId,
        rating,
        text: text.trim() || null
      });

      onSuccess && onSuccess();
      onClose();
      
      // Reset form
      setRating(0);
      setText('');
    } catch (error) {
      console.error('Error submitting review:', error);
      setError(
        error.response?.data?.errors?.appointmentId || 
        error.response?.data?.error || 
        'שגיאה ביצירת הביקורת'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setRating(0);
      setText('');
      setError('');
      onClose();
    }
  };

  if (!isOpen || !appointment) return null;

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      return (
        <button
          key={index}
          type="button"
          className={`${styles.star} ${
            starValue <= (hoverRating || rating) ? styles.filled : ''
          }`}
          onMouseEnter={() => setHoverRating(starValue)}
          onMouseLeave={() => setHoverRating(0)}
          onClick={() => setRating(starValue)}
          disabled={loading}
        >
          ★
        </button>
      );
    });
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

  const getRatingText = (rating) => {
    const ratingTexts = {
      1: 'גרוע מאוד',
      2: 'לא טוב',
      3: 'בסדר',
      4: 'טוב',
      5: 'מעולה'
    };
    return ratingTexts[rating] || '';
  };

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>כתיבת ביקורת</h2>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <div className={styles.appointmentInfo}>
          <h3>{appointment.businessName}</h3>
          <p className={styles.service}>{appointment.serviceName}</p>
          <p className={styles.date}>
            {formatDate(appointment.appointmentDatetime)}
          </p>
          {appointment.price && (
            <p className={styles.price}>₪{appointment.price}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.ratingSection}>
            <label className={styles.label}>
              דירוג השירות *
            </label>
            <div className={styles.starsContainer}>
              {renderStars()}
              {rating > 0 && (
                <span className={styles.ratingText}>
                  {getRatingText(rating)}
                </span>
              )}
            </div>
          </div>

          <div className={styles.textSection}>
            <label htmlFor="reviewText" className={styles.label}>
              תיאור הביקורת (אופציונלי)
            </label>
            <textarea
              id="reviewText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ספר על החוויה שלך..."
              className={styles.textarea}
              rows={4}
              maxLength={500}
              disabled={loading}
            />
            <div className={styles.characterCount}>
              {text.length}/500
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
              disabled={loading || rating === 0}
            >
              {loading ? 'שולח...' : 'שלח ביקורת'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;