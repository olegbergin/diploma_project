import React, { useState, useEffect } from 'react';
import styles from './ReviewsList.module.css';
import axiosInstance from '../../../api/axiosInstance';
import { useContext } from 'react';
import { UserContext } from '../../../context/UserContext';
import ReviewReportModal from './ReviewReportModal';

const ReviewsList = ({ businessId }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const { user } = useContext(UserContext);

  useEffect(() => {
    fetchReviews();
  }, [businessId, sortBy]);

  const fetchReviews = async () => {
    if (!businessId) return;

    try {
      setLoading(true);
      const response = await axiosInstance.get(`/reviews/business/${businessId}`, {
        params: { sortBy, limit: 20 }
      });
      
      setReviews(response.data.reviews || []);
      setStats(response.data.stats || {});
      setError('');
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setError('שגיאה בטעינת הביקורות');
    } finally {
      setLoading(false);
    }
  };

  const handleReportReview = (review) => {
    if (!user) {
      alert('יש להתחבר כדי לדווח על ביקורת');
      return;
    }
    setSelectedReview(review);
    setShowReportModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('he-IL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span
        key={index}
        className={`${styles.star} ${index < rating ? styles.filled : ''}`}
      >
        ★
      </span>
    ));
  };

  const renderRatingDistribution = () => {
    if (!stats.total_reviews || stats.total_reviews === 0) return null;

    const total = stats.total_reviews;
    const distribution = [
      { stars: 5, count: stats.five_star || 0 },
      { stars: 4, count: stats.four_star || 0 },
      { stars: 3, count: stats.three_star || 0 },
      { stars: 2, count: stats.two_star || 0 },
      { stars: 1, count: stats.one_star || 0 }
    ];

    return (
      <div className={styles.ratingDistribution}>
        {distribution.map(({ stars, count }) => (
          <div key={stars} className={styles.ratingRow}>
            <span className={styles.starsLabel}>
              {stars} {renderStars(stars)}
            </span>
            <div className={styles.progressBar}>
              <div 
                className={styles.progressFill}
                style={{ 
                  width: total > 0 ? `${(count / total) * 100}%` : '0%' 
                }}
              />
            </div>
            <span className={styles.ratingCount}>{count}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>טוען ביקורות...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={fetchReviews} className={styles.retryButton}>
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>ביקורות ({stats.total_reviews || 0})</h2>
        
        {stats.total_reviews > 0 && (
          <div className={styles.overallRating}>
            <div className={styles.ratingScore}>
              {renderStars(Math.round(Number(stats.average_rating) || 0))}
              <span className={styles.ratingNumber}>
                {Number(stats.average_rating || 0).toFixed(1)}
              </span>
            </div>
            <p className={styles.ratingText}>
              מתוך {stats.total_reviews} ביקורות
            </p>
          </div>
        )}
      </div>

      {stats.total_reviews > 0 && renderRatingDistribution()}

      {reviews.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <h3>אין ביקורות עדיין</h3>
          <p>היה הראשון לכתוב ביקורת על העסק הזה!</p>
        </div>
      ) : (
        <>
          <div className={styles.controls}>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.sortSelect}
            >
              <option value="newest">הכי חדשות</option>
              <option value="rating_high">דירוג גבוה לנמוך</option>
              <option value="rating_low">דירוג נמוך לגבוה</option>
            </select>
          </div>

          <div className={styles.reviewsList}>
            {reviews.map(review => (
              <div key={review.reviewId} className={styles.reviewCard}>
                <div className={styles.reviewHeader}>
                  <div className={styles.reviewerInfo}>
                    <h4 className={styles.reviewerName}>
                      {review.customerName}
                    </h4>
                    <div className={styles.reviewRating}>
                      {renderStars(review.rating)}
                    </div>
                  </div>
                  
                  <div className={styles.reviewMeta}>
                    <span className={styles.reviewDate}>
                      {formatDate(review.createdAt)}
                    </span>
                    {review.serviceName && (
                      <span className={styles.serviceName}>
                        {review.serviceName}
                      </span>
                    )}
                  </div>
                </div>

                {review.text && (
                  <div className={styles.reviewText}>
                    {review.text}
                  </div>
                )}

                {review.businessResponse && (
                  <div className={styles.businessResponse}>
                    <div className={styles.responseHeader}>
                      <strong>תגובת העסק:</strong>
                      <span className={styles.responseDate}>
                        {formatDate(review.responseDate)}
                      </span>
                    </div>
                    <div className={styles.responseText}>
                      {review.businessResponse}
                    </div>
                  </div>
                )}

                <div className={styles.reviewActions}>
                  <button
                    onClick={() => handleReportReview(review)}
                    className={styles.reportButton}
                  >
                    דווח על ביקורת
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <ReviewReportModal
        review={selectedReview}
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setSelectedReview(null);
        }}
        onSuccess={() => {
          setShowReportModal(false);
          setSelectedReview(null);
        }}
      />
    </div>
  );
};

export default ReviewsList;