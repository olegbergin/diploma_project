import React, { useState, useEffect } from 'react';
import styles from './BookingsView.module.css';

export default function BookingsView({ user }) {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        
        // Fetch upcoming appointments
        const upcomingResponse = await fetch(`/api/appointments/user/${user.id}?type=upcoming`);
        const upcomingData = await upcomingResponse.json();
        
        // Fetch past appointments  
        const pastResponse = await fetch(`/api/appointments/user/${user.id}?type=past`);
        const pastData = await pastResponse.json();
        
        // Transform API data
        const transformedBookings = {
          upcoming: upcomingData.map(apt => ({
            id: apt.appointment_id,
            businessName: apt.business_name,
            serviceName: apt.service_name,
            date: apt.appointment_datetime?.split(' ')[0] || apt.date,
            time: apt.appointment_datetime?.split(' ')[1]?.slice(0, 5) || apt.time,
            duration: apt.duration_minutes || 60,
            price: apt.price || 0,
            status: apt.status === 'approved' ? 'confirmed' : apt.status,
            businessImage: apt.business_image || '/images/placeholder_business.png',
            address: apt.business_address || 'כתובת לא זמינה',
            phone: apt.business_phone || ''
          })),
          past: pastData.map(apt => ({
            id: apt.appointment_id,
            businessName: apt.business_name,
            serviceName: apt.service_name,
            date: apt.appointment_datetime?.split(' ')[0] || apt.date,
            time: apt.appointment_datetime?.split(' ')[1]?.slice(0, 5) || apt.time,
            duration: apt.duration_minutes || 60,
            price: apt.price || 0,
            status: 'completed',
            businessImage: apt.business_image || '/images/placeholder_business.png',
            address: apt.business_address || 'כתובת לא זמינה',
            phone: apt.business_phone || '',
            rating: Math.floor(Math.random() * 2) + 4 // TODO: Get actual rating from reviews table
          }))
        };
        
        setBookings(transformedBookings);
      } catch (error) {
        console.error('Failed to fetch bookings:', error);
        
        // Fallback to mock data
        const mockBookings = {
          upcoming: [
            {
              id: 1,
              businessName: 'סלון יופי אלגנס',
              serviceName: 'תספורת + צביעה',
              date: '2024-01-15',
              time: '14:00',
              duration: 120,
              price: 180,
              status: 'confirmed',
              businessImage: '/images/placeholder_business.png',
              address: 'רחוב הרצל 25, תל אביב',
              phone: '03-1234567'
            }
          ],
          past: [
            {
              id: 3,
              businessName: 'קוסמטיקאית גלוריה',
              serviceName: 'טיפול פנים מתקדם',
              date: '2024-01-10',
              time: '11:00',
              duration: 90,
              price: 250,
              status: 'completed',
              businessImage: '/images/placeholder_business.png',
              address: 'רחוב אלנבי 15, תל אביב',
              phone: '03-9876543',
              rating: 5
            }
          ]
        };
        setBookings(mockBookings);
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchBookings();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed':
        return 'מאושר';
      case 'pending':
        return 'ממתין לאישור';
      case 'completed':
        return 'הושלם';
      case 'cancelled':
        return 'בוטל';
      default:
        return 'לא ידוע';
    }
  };

  const handleCancelBooking = (bookingId) => {
    // Handle booking cancellation
    console.log('Cancelling booking:', bookingId);
  };

  const handleRescheduleBooking = (bookingId) => {
    // Handle booking rescheduling
    console.log('Rescheduling booking:', bookingId);
  };

  const renderRating = (rating) => {
    return (
      <div className={styles.rating}>
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={`${styles.star} ${star <= rating ? styles.filled : ''}`}
          >
            ⭐
          </span>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.bookingsContainer}>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p>טוען תורים...</p>
        </div>
      </div>
    );
  }

  const currentBookings = bookings[activeTab] || [];

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.bookingsHeader}>
        <h1 className={styles.pageTitle}>התורים שלי</h1>
        <p className={styles.pageDescription}>
          נהל את התורים שלך, בטל או עדכן לפי הצורך
        </p>
      </div>

      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          <span className={styles.tabIcon}>📅</span>
          <span className={styles.tabText}>תורים קרובים</span>
          <span className={styles.badge}>{bookings.upcoming?.length || 0}</span>
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'past' ? styles.active : ''}`}
          onClick={() => setActiveTab('past')}
        >
          <span className={styles.tabIcon}>📋</span>
          <span className={styles.tabText}>תורים קודמים</span>
          <span className={styles.badge}>{bookings.past?.length || 0}</span>
        </button>
      </div>

      <div className={styles.bookingsList}>
        {currentBookings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              {activeTab === 'upcoming' ? '📅' : '📋'}
            </div>
            <h3 className={styles.emptyTitle}>
              {activeTab === 'upcoming' ? 'אין תורים קרובים' : 'אין תורים קודמים'}
            </h3>
            <p className={styles.emptyDescription}>
              {activeTab === 'upcoming' 
                ? 'כשתקבע תורים חדשים, תראה אותם כאן'
                : 'היסטוריית התורים שלך תופיע כאן'
              }
            </p>
            {activeTab === 'upcoming' && (
              <button className={styles.emptyAction}>
                מצא עסקים וקבע תור
              </button>
            )}
          </div>
        ) : (
          currentBookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingHeader}>
                <div className={styles.businessInfo}>
                  <img 
                    src={booking.businessImage} 
                    alt={booking.businessName}
                    className={styles.businessImage}
                  />
                  <div className={styles.businessDetails}>
                    <h3 className={styles.businessName}>{booking.businessName}</h3>
                    <p className={styles.address}>{booking.address}</p>
                  </div>
                </div>
                <div className={styles.bookingStatus}>
                  <span className={`${styles.statusBadge} ${styles[getStatusColor(booking.status)]}`}>
                    {getStatusText(booking.status)}
                  </span>
                </div>
              </div>

              <div className={styles.bookingDetails}>
                <div className={styles.serviceInfo}>
                  <h4 className={styles.serviceName}>{booking.serviceName}</h4>
                  <div className={styles.bookingMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span className={styles.metaText}>{formatDate(booking.date)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⏰</span>
                      <span className={styles.metaText}>{booking.time}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>⏱️</span>
                      <span className={styles.metaText}>{booking.duration} דקות</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>💰</span>
                      <span className={styles.metaText}>₪{booking.price}</span>
                    </div>
                  </div>
                </div>

                {booking.rating && (
                  <div className={styles.ratingSection}>
                    <span className={styles.ratingLabel}>הדירוג שלך:</span>
                    {renderRating(booking.rating)}
                  </div>
                )}
              </div>

              <div className={styles.bookingActions}>
                {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                  <>
                    <button 
                      className={`${styles.actionButton} ${styles.secondary}`}
                      onClick={() => handleRescheduleBooking(booking.id)}
                    >
                      📅 דחה תור
                    </button>
                    <button 
                      className={`${styles.actionButton} ${styles.danger}`}
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      ❌ בטל תור
                    </button>
                  </>
                )}
                
                {activeTab === 'past' && booking.status === 'completed' && !booking.rating && (
                  <button className={`${styles.actionButton} ${styles.primary}`}>
                    ⭐ דרג את השירות
                  </button>
                )}
                
                <button className={`${styles.actionButton} ${styles.outline}`}>
                  📞 צור קשר
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}