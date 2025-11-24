import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
import axiosInstance from '../api/axiosInstance';
import ReviewReportModal from '../components/BusinessPublicProfile/components/ReviewReportModal';
import styles from './BusinessReviewsPage.module.css';

const BusinessReviewsPage = () => {
    const { currentUser } = useContext(UserContext);
    const navigate = useNavigate();
    const businessId = currentUser?.businessId || currentUser?.id;

    console.log('BusinessReviewsPage - currentUser:', currentUser);
    console.log('BusinessReviewsPage - businessId:', businessId);

    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [ratingFilter, setRatingFilter] = useState('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Report modal
    const [reportModalOpen, setReportModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        fetchReviews();
    }, [businessId]);

    const fetchReviews = async () => {
        if (!businessId) {
            console.log('No businessId available');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            console.log('Fetching reviews for businessId:', businessId);
            // Fetch all reviews and filter client-side for this implementation
            // In a real large-scale app, you'd want server-side filtering
            const response = await axiosInstance.get(`/reviews/business/${businessId}`, {
                params: { limit: 1000 } // Get enough reviews to filter
            });
            console.log('Reviews response:', response.data);
            console.log('Number of reviews:', response.data.reviews?.length || 0);
            setReviews(response.data.reviews || []);
            setError(null);
        } catch (error) {
            console.error('Error fetching reviews:', error);
            console.error('Error response:', error.response?.data);
            setError('שגיאה בטעינת הביקורות');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('he-IL', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderStars = (rating) => {
        return '★'.repeat(rating) + '☆'.repeat(5 - rating);
    };

    // Filter Logic
    const filteredReviews = useMemo(() => {
        return reviews.filter(review => {
            // Search by customer name or text
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                (review.customerName && review.customerName.toLowerCase().includes(searchLower)) ||
                (review.text && review.text.toLowerCase().includes(searchLower));

            // Date filter (simple string match for now, can be improved)
            const reviewDate = new Date(review.createdAt).toLocaleDateString('he-IL');
            const matchesDate = !dateFilter || reviewDate.includes(dateFilter);

            // Rating filter
            const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);

            return matchesSearch && matchesDate && matchesRating;
        });
    }, [reviews, searchTerm, dateFilter, ratingFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
    const paginatedReviews = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredReviews.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredReviews, currentPage]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, dateFilter, ratingFilter]);

    const handleClearFilters = () => {
        setSearchTerm('');
        setDateFilter('');
        setRatingFilter('all');
        setCurrentPage(1);
    };

    const handleReportClick = (review) => {
        setSelectedReview(review);
        setReportModalOpen(true);
    };

    const handleReportSuccess = () => {
        setReportModalOpen(false);
        setSelectedReview(null);
        // Optionally refresh reviews or show success message
    };

    if (loading) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.loadingContainer}>
                    <div className={styles.loadingSpinner}></div>
                    <p>טוען ביקורות...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.dashboard}>
                <div className={styles.errorContainer}>
                    <p>{error}</p>
                    <button
                        className={`${styles.btn} ${styles.btnSecondary}`}
                        onClick={fetchReviews}
                    >
                        נסה שוב
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1>ניהול ביקורות</h1>
                <button
                    className={`${styles.btn} ${styles.btnSecondary}`}
                    onClick={() => navigate(`/business/${businessId}/dashboard`)}
                >
                    חזרה לדשבורד
                </button>
            </header>

            {/* Filters Card */}
            <div className={styles.card}>
                <div className={styles.filtersGrid}>
                    <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="חיפוש לפי שם לקוח או תוכן..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    <input
                        type="text"
                        className={styles.dateInput}
                        placeholder="תאריך (dd.mm.yyyy)"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                    />

                    <select
                        className={styles.selectInput}
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                    >
                        <option value="all">כל הדירוגים</option>
                        <option value="5">5 כוכבים</option>
                        <option value="4">4 כוכבים</option>
                        <option value="3">3 כוכבים</option>
                        <option value="2">2 כוכבים</option>
                        <option value="1">כוכב 1</option>
                    </select>

                    <button
                        className={styles.clearButton}
                        onClick={handleClearFilters}
                        disabled={!searchTerm && !dateFilter && ratingFilter === 'all'}
                    >
                        נקה
                    </button>
                </div>
            </div>

            {/* Reviews List */}
            <div className={styles.card}>
                <h3 className={styles.cardTitle}>
                    רשימת ביקורות
                    <span className={styles.resultCount}>({filteredReviews.length} תוצאות)</span>
                </h3>

                {paginatedReviews.length === 0 ? (
                    <div className={styles.emptyText}>
                        {filteredReviews.length === 0 && (searchTerm || dateFilter || ratingFilter !== 'all')
                            ? 'לא נמצאו ביקורות התואמות לסינון'
                            : 'אין ביקורות להצגה'}
                    </div>
                ) : (
                    <>
                        <ul className={styles.reviewsList}>
                            {paginatedReviews.map((review) => (
                                <li key={review.reviewId} className={styles.reviewItem}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.reviewerInfo}>
                                            <span className={styles.customerName}>{review.customerName}</span>
                                            <span className={styles.rating}>{renderStars(review.rating)}</span>
                                        </div>
                                        <div className={styles.reviewActions}>
                                            <span className={styles.reviewDate}>{formatDate(review.createdAt)}</span>
                                            <button
                                                className={styles.reportButton}
                                                onClick={() => handleReportClick(review)}
                                                title="דווח על ביקורת"
                                            >
                                                דווח
                                            </button>
                                        </div>
                                    </div>
                                    {review.text && <p className={styles.reviewText}>{review.text}</p>}
                                </li>
                            ))}
                        </ul>

                        {totalPages > 1 && (
                            <div className={styles.pagination}>
                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                >
                                    הקודם
                                </button>

                                <span className={styles.pageInfo}>
                                    עמוד {currentPage} מתוך {totalPages}
                                </span>

                                <button
                                    className={`${styles.btn} ${styles.btnSecondary}`}
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                >
                                    הבא
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Report Modal */}
            <ReviewReportModal
                review={selectedReview}
                isOpen={reportModalOpen}
                onClose={() => {
                    setReportModalOpen(false);
                    setSelectedReview(null);
                }}
                onSuccess={handleReportSuccess}
            />
        </div>
    );
};

export default BusinessReviewsPage;
