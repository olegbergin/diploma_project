import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ServicesView from './views/ServicesView';
import LoadingSpinner from '../shared/LoadingSpinner/LoadingSpinner';
import axios from '../../config/axios';
import styles from './SimplifiedBusinessDashboard.module.css';

export default function SimplifiedBusinessDashboard() {
  const { id: businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load basic business info
  useEffect(() => {
    const loadBusinessInfo = async () => {
      if (!businessId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/businesses/${businessId}`);
        setBusiness(response.data);
      } catch (err) {
        setError('Failed to load business information');
        console.error('Error loading business:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadBusinessInfo();
  }, [businessId]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="large" message="טוען דשבורד..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>שגיאה בטעינת הנתונים</h2>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          נסה שוב
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Simple Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.businessInfo}>
            <h1 className={styles.businessName}>
              {business?.name || 'העסק שלי'}
            </h1>
            <p className={styles.businessCategory}>
              {business?.category || 'ניהול שירותים'}
            </p>
          </div>
          <button 
            className={styles.logoutButton}
            onClick={handleLogout}
            title="התנתק"
          >
            יציאה
          </button>
        </div>
      </header>

      {/* Main Content - Services Management */}
      <main className={styles.mainContent}>
        <ServicesView businessId={businessId} />
      </main>
    </div>
  );
}