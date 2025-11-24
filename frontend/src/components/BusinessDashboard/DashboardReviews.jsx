import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardReviews.module.css';
import axiosInstance from '../../api/axiosInstance';

const DashboardReviews = ({ businessId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchReviews = async () => {
            if (!businessId) return;
            try {
                setLoading(true);
                const response = await axiosInstance.get(`/reviews/business/${businessId}`, {
                    params: { limit: 3, sortBy: 'newest' }
                });
                setReviews(response.data.reviews || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [businessId]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    if (loading) {
        return <div className={styles.loading}>טוען ביקורות...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>ביקורות אחרונות</h3>
                <button
                    className={styles.actionButton}
                    onClick={() => navigate(`/business/${businessId}/reviews`)}
                >
                    📊 דיווחים ורשימת ביקורות
                </button>
            </div>

            <div className={styles.reviewsList}>
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.reviewId} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <div className={styles.reviewerInfo}>
                                    <h4 className={styles.reviewerName}>{review.customerName}</h4>
                                    <div className={styles.stars}>{renderStars(review.rating)}</div>
                                </div>
                                <span className={styles.reviewDate}>
                                    {formatDate(review.createdAt)}
                                </span>
                            </div>
                            {review.text && <p className={styles.reviewText}>{review.text}</p>}
                        </div>
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        אין ביקורות עדיין
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardReviews;
