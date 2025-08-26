import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ServiceManagement.module.css';
import axiosInstance from '../../api/axiosInstance';
import { UserContext } from '../../context/UserContext';

export default function ServiceManagement() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const { currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  const businessId = currentUser?.businessId || currentUser?.id;

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    category: 'Services'
  });

  const fetchServices = useCallback(async () => {
    if (!businessId) return;
    
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/businesses/${businessId}/services`);
      setServices(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching services:', error);
      setError('שגיאה בטעינת השירותים');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      duration_minutes: '',
      category: 'Services'
    });
    setShowCreateForm(false);
    setEditingService(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.duration_minutes) {
      setError('נא למלא את כל השדות הנדרשים');
      return;
    }

    try {
      if (editingService) {
        // Update existing service
        await axiosInstance.put(`/businesses/${businessId}/services/${editingService.serviceId}`, {
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes)
        });
      } else {
        // Create new service
        await axiosInstance.post(`/businesses/${businessId}/services`, {
          ...formData,
          price: parseFloat(formData.price),
          duration_minutes: parseInt(formData.duration_minutes)
        });
      }
      
      resetForm();
      fetchServices();
    } catch (error) {
      console.error('Error saving service:', error);
      setError('שגיאה בשמירת השירות');
    }
  };

  const handleEdit = (service) => {
    setFormData({
      name: service.name,
      description: service.description || '',
      price: service.price.toString(),
      duration_minutes: service.durationMinutes.toString(),
      category: service.category || 'Services'
    });
    setEditingService(service);
    setShowCreateForm(true);
  };

  const handleDelete = async (serviceId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק את השירות? פעולה זו אינה הפיכה.')) {
      return;
    }

    try {
      await axiosInstance.delete(`/businesses/${businessId}/services/${serviceId}`);
      fetchServices();
    } catch (error) {
      console.error('Error deleting service:', error);
      setError('שגיאה במחיקת השירות');
    }
  };

  if (loading) {
    return <div className={styles.loadingContainer}><div className={styles.loadingSpinner}></div><p>טוען שירותים...</p></div>;
  }

  return (
    <div className={styles.serviceManagement}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button 
            className={`${styles.btn} ${styles.btnSecondary}`} 
            onClick={() => navigate(`/business/${businessId}/dashboard`)}
          >
            ← חזרה לדשבורד
          </button>
          <h1>ניהול שירותים</h1>
        </div>
        <button 
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={() => setShowCreateForm(true)}
        >
          ➕ הוסף שירות חדש
        </button>
      </header>

      {error && (
        <div className={styles.errorMessage}>
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formCard}>
            <h2>{editingService ? 'עריכת שירות' : 'יצירת שירות חדש'}</h2>
            <form onSubmit={handleSubmit} className={styles.serviceForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">שם השירות *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={styles.formInput}
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">תיאור השירות</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className={styles.formTextarea}
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="price">מחיר (₪) *</label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                    className={styles.formInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="duration_minutes">משך זמן (דקות) *</label>
                  <input
                    type="number"
                    id="duration_minutes"
                    name="duration_minutes"
                    value={formData.duration_minutes}
                    onChange={handleInputChange}
                    min="1"
                    required
                    className={styles.formInput}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="category">קטגוריה</label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={styles.formSelect}
                >
                  <option value="Services">שירותים</option>
                  <option value="שיער">שיער</option>
                  <option value="ציפורניים">ציפורניים</option>
                  <option value="פנים">פנים</option>
                  <option value="עיסוי">עיסוי</option>
                  <option value="איפור">איפור</option>
                  <option value="ריסים ועיניים">ריסים ועיניים</option>
                  <option value="גבות">גבות</option>
                  <option value="הסרת שיער">הסרת שיער</option>
                  <option value="טיפולים אסתטיים">טיפולים אסתטיים</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="button" onClick={resetForm} className={`${styles.btn} ${styles.btnSecondary}`}>
                  ביטול
                </button>
                <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
                  {editingService ? 'עדכן שירות' : 'צור שירות'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className={styles.servicesContainer}>
        {services.length > 0 ? (
          <div className={styles.servicesGrid}>
            {services.map(service => (
              <div key={service.serviceId} className={styles.serviceCard}>
                <div className={styles.serviceHeader}>
                  <h3 className={styles.serviceName}>{service.name}</h3>
                  <span className={styles.serviceCategory}>{service.category}</span>
                </div>
                
                {service.description && (
                  <p className={styles.serviceDescription}>{service.description}</p>
                )}
                
                <div className={styles.serviceDetails}>
                  <div className={styles.servicePrice}>₪{service.price}</div>
                  <div className={styles.serviceDuration}>{service.durationMinutes} דקות</div>
                </div>

                <div className={styles.serviceActions}>
                  <button 
                    onClick={() => handleEdit(service)}
                    className={`${styles.btn} ${styles.btnSecondary} ${styles.btnSmall}`}
                  >
                    ✏️ עריכה
                  </button>
                  <button 
                    onClick={() => handleDelete(service.serviceId)}
                    className={`${styles.btn} ${styles.btnDanger} ${styles.btnSmall}`}
                  >
                    🗑️ מחיקה
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>אין שירותים עדיין</h3>
            <p>התחל בהוספת השירות הראשון שלך</p>
            <button 
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => setShowCreateForm(true)}
            >
              ➕ הוסף שירות חדש
            </button>
          </div>
        )}
      </div>
    </div>
  );
}