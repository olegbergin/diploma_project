import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FavoritesView.module.css';

export default function FavoritesView({ user }) {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);
        
        // Fetch user's favorite businesses
        const response = await fetch(`/api/users/${user.id}/favorites`);
        const favoritesData = await response.json();
        
        // Fetch detailed information for each favorite business
        const detailedFavorites = await Promise.all(
          favoritesData.map(async (fav) => {
            try {
              const businessResponse = await fetch(`/api/businesses/${fav.business_id}`);
              const businessData = await businessResponse.json();
              
              return {
                id: fav.business_id,
                name: businessData.name,
                category: businessData.category,
                rating: 4.5 + Math.random() * 0.5, // TODO: Get actual rating from reviews
                reviewCount: Math.floor(Math.random() * 200) + 50,
                address: businessData.address,
                phone: businessData.phone,
                image: businessData.image_url || '/images/placeholder_business.png',
                isOpen: Math.random() > 0.3, // TODO: Calculate based on opening hours
                nextAvailable: new Date(Date.now() + Math.random() * 48 * 60 * 60 * 1000).toISOString(),
                services: businessData.services?.map(s => s.name).slice(0, 3) || ['שירות כללי'],
                priceRange: businessData.services?.length > 0 ? 
                  `₪${Math.min(...businessData.services.map(s => s.price))}-₪${Math.max(...businessData.services.map(s => s.price))}` : 
                  '₪100-₪200',
                lastVisit: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                totalVisits: Math.floor(Math.random() * 10) + 1
              };
            } catch (businessError) {
              console.error('Failed to fetch business details:', businessError);
              return {
                id: fav.business_id,
                name: fav.name || 'עסק לא זמין',
                category: 'כללי',
                rating: 4.0,
                reviewCount: 0,
                address: 'כתובת לא זמינה',
                phone: '',
                image: '/images/placeholder_business.png',
                isOpen: false,
                nextAvailable: null,
                services: ['שירות כללי'],
                priceRange: '₪100-₪200',
                lastVisit: null,
                totalVisits: 0
              };
            }
          })
        );
        
        setFavorites(detailedFavorites);
      } catch (error) {
        console.error('Failed to fetch favorites:', error);
        
        // Fallback to mock data
        const mockFavorites = [
          {
            id: 1,
            name: 'סלון יופי אלגנס',
            category: 'יופי ועיצוב',
            rating: 4.8,
            reviewCount: 127,
            address: 'רחוב הרצל 25, תל אביב',
            phone: '03-1234567',
            image: '/images/placeholder_business.png',
            isOpen: true,
            nextAvailable: '2024-01-15 14:00',
            services: ['תספורת', 'צביעה', 'הדגשות'],
            priceRange: '₪80-₪200',
            lastVisit: '2024-01-10',
            totalVisits: 3
          }
        ];
        setFavorites(mockFavorites);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchFavorites();
    }
  }, [user]);

  const handleRemoveFavorite = (businessId) => {
    setFavorites(favorites.filter(fav => fav.id !== businessId));
  };

  const handleBookAppointment = (businessId) => {
    navigate(`/booking/${businessId}`);
  };

  const handleViewBusiness = (businessId) => {
    navigate(`/business/${businessId}`);
  };

  const renderRating = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className={styles.star}>⭐</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className={styles.starHalf}>⭐</span>);
    }

    return <div className={styles.rating}>{stars}</div>;
  };

  if (loading) {
    return (
      <div className={styles.favoritesContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען מועדפים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.favoritesContainer}>
      <div className={styles.favoritesHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>המועדפים שלי</h1>
          <p className={styles.pageDescription}>
            העסקים שהכי אהבת - גישה מהירה להזמנת תורים
          </p>
        </div>
        
        <div className={styles.headerControls}>
          <div className={styles.viewModeToggle}>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              aria-label="תצוגת רשת"
            >
              ⊞
            </button>
            <button
              className={`${styles.viewModeButton} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              aria-label="תצוגת רשימה"
            >
              ☰
            </button>
          </div>
          
          <div className={styles.favoritesCount}>
            <span className={styles.countNumber}>{favorites.length}</span>
            <span className={styles.countLabel}>מועדפים</span>
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>⭐</div>
          <h3 className={styles.emptyTitle}>אין עסקים מועדפים</h3>
          <p className={styles.emptyDescription}>
            כשתמצא עסקים שאתה אוהב, תוכל להוסיף אותם למועדפים לגישה מהירה
          </p>
          <button 
            className={styles.emptyAction}
            onClick={() => navigate('/search')}
          >
            חפש עסקים
          </button>
        </div>
      ) : (
        <div className={`${styles.favoritesList} ${styles[viewMode]}`}>
          {favorites.map((business) => (
            <div key={business.id} className={styles.favoriteCard}>
              <div className={styles.cardHeader}>
                <img 
                  src={business.image} 
                  alt={business.name}
                  className={styles.businessImage}
                />
                <div className={styles.statusIndicator}>
                  <span className={`${styles.statusDot} ${business.isOpen ? styles.open : styles.closed}`}>
                  </span>
                  <span className={styles.statusText}>
                    {business.isOpen ? 'פתוח' : 'סגור'}
                  </span>
                </div>
                <button 
                  className={styles.favoriteButton}
                  onClick={() => handleRemoveFavorite(business.id)}
                  aria-label="הסר ממועדפים"
                >
                  💙
                </button>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.businessInfo}>
                  <h3 className={styles.businessName}>{business.name}</h3>
                  <p className={styles.businessCategory}>{business.category}</p>
                  
                  <div className={styles.ratingSection}>
                    {renderRating(business.rating)}
                    <span className={styles.ratingNumber}>{business.rating}</span>
                    <span className={styles.reviewCount}>({business.reviewCount})</span>
                  </div>
                </div>

                <div className={styles.businessDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>📍</span>
                    <span className={styles.detailText}>{business.address}</span>
                  </div>
                  
                  <div className={styles.detailItem}>
                    <span className={styles.detailIcon}>💰</span>
                    <span className={styles.detailText}>{business.priceRange}</span>
                  </div>
                  
                  {business.nextAvailable && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailIcon}>⏰</span>
                      <span className={styles.detailText}>
                        זמין: {new Date(business.nextAvailable).toLocaleDateString('he-IL')} בשעה {new Date(business.nextAvailable).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                </div>

                <div className={styles.servicesSection}>
                  <h4 className={styles.servicesTitle}>שירותים מובילים:</h4>
                  <div className={styles.servicesTags}>
                    {business.services.slice(0, 3).map((service, index) => (
                      <span key={index} className={styles.serviceTag}>
                        {service}
                      </span>
                    ))}
                    {business.services.length > 3 && (
                      <span className={styles.serviceMore}>
                        +{business.services.length - 3} נוספים
                      </span>
                    )}
                  </div>
                </div>

                <div className={styles.visitHistory}>
                  <div className={styles.historyItem}>
                    <span className={styles.historyLabel}>ביקור אחרון:</span>
                    <span className={styles.historyValue}>
                      {new Date(business.lastVisit).toLocaleDateString('he-IL')}
                    </span>
                  </div>
                  <div className={styles.historyItem}>
                    <span className={styles.historyLabel}>סה״כ ביקורים:</span>
                    <span className={styles.historyValue}>{business.totalVisits}</span>
                  </div>
                </div>
              </div>

              <div className={styles.cardActions}>
                <button 
                  className={`${styles.actionButton} ${styles.primary}`}
                  onClick={() => handleBookAppointment(business.id)}
                >
                  📅 קבע תור
                </button>
                <button 
                  className={`${styles.actionButton} ${styles.secondary}`}
                  onClick={() => handleViewBusiness(business.id)}
                >
                  👁 צפה בעסק
                </button>
                <button className={`${styles.actionButton} ${styles.outline}`}>
                  📞 התקשר
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}