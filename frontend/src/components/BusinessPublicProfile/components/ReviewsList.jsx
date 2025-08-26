import React, { useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import styles from './ReviewsList.module.css';

const ReviewsList = ({ businessId }) => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`/businesses/${businessId}/reviews`);
                setReviews(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, [businessId]);

    if (loading) {
        return <div>Loading reviews...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.reviewsContainer}>
            <h2>Reviews</h2>
            {reviews.length > 0 ? (
                <ul className={styles.reviewList}>
                    {reviews.map(review => (
                        <li key={review.reviewId} className={styles.reviewItem}>
                            <div className={styles.reviewHeader}>
                                <strong>{`${review.user.firstName} ${review.user.lastName}`}</strong>
                                <span className={styles.rating}>{'⭐'.repeat(review.rating)}</span>
                            </div>
                            <p>{review.comment}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No reviews found for this business.</p>
            )}
        </div>
    );
};

export default ReviewsList;
