import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../../api/axiosInstance';
import useImageUpload from '../../hooks/useImageUpload';
import DragDropUpload from '../shared/DragDropUpload/DragDropUpload';
import styles from './BusinessEditPage.module.css';

const CATEGORY_OPTIONS = [
  "מספרה",
  "מניקור פדיקור", 
  "קוסמטיקה",
  "קעקועים",
  "עיסוי וטיפול",
  "חיות מחמד",
  "ספורט",
  "בריאות",
  "מסעדה",
  "סלון יופי",
  "אחר",
];

const DAYS_OF_WEEK = [
  { key: 'sunday', name: 'ראשון' },
  { key: 'monday', name: 'שני' },
  { key: 'tuesday', name: 'שלישי' },
  { key: 'wednesday', name: 'רביעי' },
  { key: 'thursday', name: 'חמישי' },
  { key: 'friday', name: 'שישי' },
  { key: 'saturday', name: 'שבת' }
];

export default function BusinessEditPage() {
  const { id: businessId } = useParams();
  const navigate = useNavigate();

  // Business info state
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    category: '',
    description: '',
    phone: '',
    email: '',
    address: '',
    image_url: ''
  });

  // Schedule state
  const [schedule, setSchedule] = useState({
    sunday: { isOpen: false, openTime: '09:00', closeTime: '17:00' },
    monday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    tuesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    wednesday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    thursday: { isOpen: true, openTime: '09:00', closeTime: '17:00' },
    friday: { isOpen: true, openTime: '09:00', closeTime: '14:00' },
    saturday: { isOpen: false, openTime: '09:00', closeTime: '17:00' }
  });

  // Portfolio state
  const [portfolio, setPortfolio] = useState([]);
  
  // Image upload hook
  const { isUploading, uploadSingle } = useImageUpload();

  // UI state
  const [activeTab, setActiveTab] = useState('business-info');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadBusinessData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/businesses/${businessId}`);
      const data = response.data;
      
      // Parse photos from database
      let parsedPhotos = [];
      if (data.photos) {
        try {
          parsedPhotos = typeof data.photos === 'string' 
            ? JSON.parse(data.photos) 
            : data.photos;
          if (!Array.isArray(parsedPhotos)) {
            parsedPhotos = [];
          }
        } catch (e) {
          console.warn('Could not parse photos:', e);
          parsedPhotos = [];
        }
      }

      // Set business info - use first photo as profile image
      setBusinessInfo({
        name: data.name || '',
        category: data.category || '',
        description: data.description || '',
        phone: data.phone || '',
        email: data.email || '',
        address: data.address || '',
        image_url: parsedPhotos.length > 0 ? parsedPhotos[0] : ''
      });

      // Parse schedule if available
      if (data.working_hours) {
        try {
          const parsedSchedule = JSON.parse(data.working_hours);
          setSchedule(parsedSchedule);
        } catch (e) {
          console.warn('Could not parse working hours:', e);
        }
      }

      // Set portfolio images (all photos except the first one which is profile image)
      const portfolioImages = parsedPhotos.slice(1).map((url, index) => ({
        id: Date.now() + index,
        url: url
      }));
      setPortfolio(portfolioImages);

    } catch (error) {
      console.error('Error loading business data:', error);
      setError('שגיאה בטעינת נתוני העסק');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  // Load business data on component mount
  useEffect(() => {
    loadBusinessData();
  }, [loadBusinessData]);

  const handleBusinessInfoChange = (e) => {
    const { name, value } = e.target;
    setBusinessInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, field, value) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value
      }
    }));
  };

  const handleProfileImageUploadComplete = useCallback((uploadedImages) => {
    if (uploadedImages && uploadedImages.length > 0) {
      const newProfileImageUrl = uploadedImages[0].url;
      
      // Update business info with new profile image
      setBusinessInfo(prev => ({
        ...prev,
        image_url: newProfileImageUrl
      }));
      
      // If there was an old profile image, move it to portfolio
      setPortfolio(prev => {
        const currentProfileImage = businessInfo.image_url;
        if (currentProfileImage && currentProfileImage !== '') {
          // Add old profile image to portfolio if it's not already there
          const existsInPortfolio = prev.some(img => img.url === currentProfileImage);
          if (!existsInPortfolio) {
            return [{
              id: Date.now() - 1,
              url: currentProfileImage
            }, ...prev];
          }
        }
        return prev;
      });
    }
  }, [businessInfo.image_url]);

  const handlePortfolioImageUpload = useCallback((uploadedImages) => {
    setPortfolio(prev => [...prev, ...uploadedImages]);
  }, []);

  const removePortfolioImage = (imageId) => {
    setPortfolio(prev => prev.filter(img => img.id !== imageId));
  };

  const saveBusinessInfo = async () => {
    try {
      setSaving(true);
      setError('');
      
      // Combine profile image and portfolio images into one photos array
      const allPhotos = [];
      
      // Add profile image as first photo if it exists
      if (businessInfo.image_url && businessInfo.image_url.trim() !== '') {
        allPhotos.push(businessInfo.image_url);
      }
      
      // Add portfolio images
      portfolio.forEach(image => {
        if (image.url && !allPhotos.includes(image.url)) {
          allPhotos.push(image.url);
        }
      });
      
      const updateData = {
        ...businessInfo,
        working_hours: JSON.stringify(schedule),
        gallery: allPhotos
      };

      await axiosInstance.put(`/businesses/${businessId}`, updateData);
      
      setSuccessMessage('פרטי העסק נשמרו בהצלחה');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error saving business info:', error);
      setError('שגיאה בשמירת פרטי העסק');
    } finally {
      setSaving(false);
    }
  };

  const generateScheduleDisplay = () => {
    const days = [];
    DAYS_OF_WEEK.forEach(({ key, name }) => {
      const daySchedule = schedule[key];
      if (daySchedule.isOpen) {
        days.push(`${name}: ${daySchedule.openTime}-${daySchedule.closeTime}`);
      } else {
        days.push(`${name}: סגור`);
      }
    });
    return days.join(', ');
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>טוען נתוני העסק...</p>
      </div>
    );
  }

  return (
    <div className={styles.editPageContainer}>
      <header className={styles.header}>
        <button 
          className={styles.backButton}
          onClick={() => navigate(`/business/${businessId}/dashboard`)}
        >
          ← חזרה לדשבורד
        </button>
        <h1>עריכת פרטי העסק</h1>
        <button 
          className={`${styles.saveButton} ${saving ? styles.saving : ''}`}
          onClick={saveBusinessInfo}
          disabled={saving}
        >
          {saving ? 'שומר...' : 'שמור שינויים'}
        </button>
      </header>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {successMessage && <div className={styles.successMessage}>{successMessage}</div>}

      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tabButton} ${activeTab === 'business-info' ? styles.active : ''}`}
          onClick={() => setActiveTab('business-info')}
        >
          פרטי העסק
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'schedule' ? styles.active : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          שעות פתיחה
        </button>
        <button 
          className={`${styles.tabButton} ${activeTab === 'portfolio' ? styles.active : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          פורטפוליו
        </button>
      </div>

      <div className={styles.tabContent}>
        {/* Business Info Tab */}
        {activeTab === 'business-info' && (
          <div className={styles.formSection}>
            <h2>פרטי העסק הבסיסיים</h2>
            
            <div className={styles.formColumns}>
              <div className={styles.formColumn}>
                <div className={styles.inputGroup}>
                  <label htmlFor="name">שם העסק *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={businessInfo.name}
                    onChange={handleBusinessInfoChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="category">קטגוריה *</label>
                  <select
                    id="category"
                    name="category"
                    value={businessInfo.category}
                    onChange={handleBusinessInfoChange}
                    required
                    className={styles.select}
                  >
                    <option value="">בחר קטגוריה...</option>
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="description">תיאור העסק</label>
                  <textarea
                    id="description"
                    name="description"
                    value={businessInfo.description}
                    onChange={handleBusinessInfoChange}
                    rows={4}
                    className={styles.textarea}
                    placeholder="ספר על העסק שלך, השירותים שאתה מציע והמומחיות שלך..."
                  />
                </div>
              </div>

              <div className={styles.formColumn}>
                <div className={styles.inputGroup}>
                  <label htmlFor="phone">טלפון עסקי</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={businessInfo.phone}
                    onChange={handleBusinessInfoChange}
                    className={styles.input}
                    placeholder="050-1234567"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="email">מייל עסקי</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={businessInfo.email}
                    onChange={handleBusinessInfoChange}
                    className={styles.input}
                    placeholder="business@example.com"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="address">כתובת</label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={businessInfo.address}
                    onChange={handleBusinessInfoChange}
                    className={styles.input}
                    placeholder="רחוב 123, עיר"
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>תמונת פרופיל</label>
                  <DragDropUpload
                    onUploadComplete={handleProfileImageUploadComplete}
                    multiple={false}
                    disabled={isUploading}
                    className={styles.profileImageUpload}
                  />
                  {businessInfo.image_url && (
                    <div className={styles.imagePreview}>
                      <img 
                        src={businessInfo.image_url.startsWith('/') ? 
                          `http://localhost:3031${businessInfo.image_url}` : 
                          businessInfo.image_url
                        } 
                        alt="תמונת פרופיל" 
                        className={styles.previewImage}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Schedule Tab */}
        {activeTab === 'schedule' && (
          <div className={styles.formSection}>
            <h2>שעות פתיחה</h2>
            <div className={styles.scheduleContainer}>
              {DAYS_OF_WEEK.map(({ key, name }) => (
                <div key={key} className={styles.scheduleDay}>
                  <div className={styles.dayHeader}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={schedule[key].isOpen}
                        onChange={(e) => handleScheduleChange(key, 'isOpen', e.target.checked)}
                        className={styles.checkbox}
                      />
                      <span className={styles.dayName}>{name}</span>
                    </label>
                  </div>
                  
                  {schedule[key].isOpen && (
                    <div className={styles.timeInputs}>
                      <div className={styles.timeInput}>
                        <label>פתיחה:</label>
                        <input
                          type="time"
                          value={schedule[key].openTime}
                          onChange={(e) => handleScheduleChange(key, 'openTime', e.target.value)}
                          className={styles.input}
                        />
                      </div>
                      <div className={styles.timeInput}>
                        <label>סגירה:</label>
                        <input
                          type="time"
                          value={schedule[key].closeTime}
                          onChange={(e) => handleScheduleChange(key, 'closeTime', e.target.value)}
                          className={styles.input}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className={styles.schedulePreview}>
              <h3>תצוגה מקדימה של שעות הפתיחה:</h3>
              <p className={styles.scheduleDisplay}>{generateScheduleDisplay()}</p>
            </div>
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <div className={styles.formSection}>
            <h2>פורטפוליו תמונות</h2>
            
            <div className={styles.uploadSection}>
              <DragDropUpload
                onUploadComplete={handlePortfolioImageUpload}
                multiple={true}
                disabled={isUploading}
                className={styles.portfolioUpload}
              />
            </div>

            <div className={styles.portfolioGrid}>
              {portfolio.map((image) => (
                <div key={image.id} className={styles.portfolioItem}>
                  <img 
                    src={image.url.startsWith('/') ? 
                      `http://localhost:3031${image.url}` : 
                      image.url
                    } 
                    alt="תמונת פורטפוליו" 
                    className={styles.portfolioImage}
                  />
                  <button
                    type="button"
                    onClick={() => removePortfolioImage(image.id)}
                    className={styles.removeImageButton}
                    title="הסר תמונה"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {portfolio.length === 0 && (
              <div className={styles.emptyPortfolio}>
                <p>עדיין לא הוספת תמונות לפורטפוליו</p>
                <p>הוסף תמונות כדי להראות ללקוחות את העבודות שלך</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}