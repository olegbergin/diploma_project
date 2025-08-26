import React, { useContext, useState, useEffect } from 'react';
import axios from '../../../api/axiosInstance';
import { UserContext } from '../../../context/UserContext';
import { useToastContext } from '../../../context/ToastContext';
import styles from './ProfileHeader.module.css';

const ProfileHeader = ({ business }) => {
    const { currentUser } = useContext(UserContext);
    const { showSuccess, showError, showWarning } = useToastContext();
    const [isFavorite, setIsFavorite] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [favoriteCheckLoading, setFavoriteCheckLoading] = useState(true);

    const businessId = business.businessId || business.id;

    // Check if business is already in favorites
    useEffect(() => {
        const checkFavoriteStatus = async () => {
            if (!currentUser || !businessId) {
                setFavoriteCheckLoading(false);
                return;
            }

            try {
                const response = await axios.get(`/users/${currentUser.id}/favorites`);
                const favorites = response.data || [];
                const isBusinessFavorite = favorites.some(fav => 
                    (fav.businessId || fav.business_id) === businessId
                );
                setIsFavorite(isBusinessFavorite);
            } catch (error) {
                console.error('Error checking favorite status:', error);
            } finally {
                setFavoriteCheckLoading(false);
            }
        };

        checkFavoriteStatus();
    }, [currentUser, businessId]);

    const handleToggleFavorite = async () => {
        if (!currentUser) {
            showWarning('Please log in to add businesses to your favorites.', 4000);
            return;
        }

        if (!businessId) {
            showError('Unable to add to favorites: Invalid business ID.', 3000);
            return;
        }

        setIsLoading(true);

        try {
            if (isFavorite) {
                // Remove from favorites
                await axios.delete(`/users/${currentUser.id}/favorites/${businessId}`);
                setIsFavorite(false);
                showSuccess('Removed from favorites!', 3000);
            } else {
                // Add to favorites
                await axios.post(`/users/${currentUser.id}/favorites`, { 
                    businessId: businessId 
                });
                setIsFavorite(true);
                showSuccess('Added to favorites!', 3000);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            const errorMessage = error.response?.data?.message || 
                               'Failed to update favorites. Please try again.';
            showError(errorMessage, 4000);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStars = (rating) => {
        const numRating = parseFloat(rating) || 0;
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <span className={styles.stars}>
                {'⭐'.repeat(fullStars)}
                {hasHalfStar && '⭐'}
                {'☆'.repeat(emptyStars)}
            </span>
        );
    };

    const formatRating = (rating) => {
        const numRating = parseFloat(rating);
        return isNaN(numRating) ? 'No rating' : `(${numRating.toFixed(1)})`;
    };

    const getFavoriteButtonContent = () => {
        if (favoriteCheckLoading) {
            return '⏳ Loading...';
        }
        if (isLoading) {
            return isFavorite ? '💔 Removing...' : '❤️ Adding...';
        }
        return isFavorite ? '💖 Remove from Favorites' : '🤍 Add to Favorites';
    };

    return (
        <div className={styles.headerContainer}>
            <h1 className={styles.businessName}>
                {business.business_name || business.name || 'Business Name'}
            </h1>
            <p className={styles.businessCategory}>
                {business.category || 'Category not specified'}
            </p>
            <div className={styles.rating}>
                {renderStars(business.average_rating || business.rating)}
                <span className={styles.ratingText}>
                    {formatRating(business.average_rating || business.rating)}
                </span>
                {/* {business.total_reviews && (
                    <span className={styles.reviewCount}>
                        · {business.total_reviews} review{business.total_reviews !== 1 ? 's' : ''}
                    </span>
                )} */}
            </div>
            <button 
                className={`${styles.favoriteButton} ${isFavorite ? styles.favoriteActive : ''} ${isLoading || favoriteCheckLoading ? styles.favoriteLoading : ''}`}
                onClick={handleToggleFavorite}
                disabled={isLoading || favoriteCheckLoading}
            >
                {getFavoriteButtonContent()}
            </button>
        </div>
    );
};

export default ProfileHeader;
