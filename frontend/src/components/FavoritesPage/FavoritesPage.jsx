import React, { useState, useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';
import BusinessCard from '../BusinessCard/BusinessCard';
import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '../shared/ErrorMessage/ErrorMessage';
import styles from './FavoritesPage.module.css';

export default function FavoritesPage({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user?.id) return;
      
      try {
        setLoading(true);
        const response = await axiosInstance.get(`/users/${user.id}/favorites`);
        setFavorites(response.data || []);
        setError(null);
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setError('שגיאה בטעינת העסקים המועדפים');
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user?.id]);

  const handleRemoveFromFavorites = (businessId) => {
    setFavorites(prevFavorites => 
      prevFavorites.filter(business => business.businessId !== businessId)
    );
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner />
        <p>טוען עסקים מועדפים...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <ErrorMessage error={error} onClose={() => setError(null)} />
      </div>
    );
  }

  return (
    <div className={styles.favoritesPage}>
      <div className={styles.header}>
        <h1>העסקים המועדפים שלי</h1>
        <p>כאן תוכל לראות את כל העסקים שסימנת כמועדפים</p>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>❤️</div>
          <h3>אין עסקים מועדפים</h3>
          <p>עדיין לא הוספת עסקים לרשימת המועדפים שלך</p>
          <button 
            className={styles.actionButton}
            onClick={() => window.location.href = '/search'}
          >
            <div className={styles.actionIcon}>🔍</div>
            <div className={styles.actionLabel}>חפש עסקים</div>
          </button>
        </div>
      ) : (
        <div className={styles.favoritesGrid}>
          {favorites.map(business => (
            <BusinessCard
              key={business.businessId || business.id}
              business={business}
              userRole={user?.role}
              onDelete={handleRemoveFromFavorites}
            />
          ))}
        </div>
      )}
    </div>
  );
}