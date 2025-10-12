import React, { useState } from 'react';
import styles from './ServiceModal.module.css';
import axiosInstance from '../../api/axiosInstance';

export default function ServiceModal({ isOpen, onClose, onServiceCreated, businessId }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      setError('שם השירות הוא שדה חובה');
      return;
    }
    if (!formData.price || isNaN(formData.price) || parseFloat(formData.price) <= 0) {
      setError('יש להזין מחיר תקין');
      return;
    }
    if (!formData.duration_minutes || isNaN(formData.duration_minutes) || parseInt(formData.duration_minutes) <= 0) {
      setError('יש להזין זמן תקין בדקות');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes)
      };

      const response = await axiosInstance.post(`/businesses/${businessId}/services`, serviceData);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_minutes: ''
      });
      
      // Notify parent component
      if (onServiceCreated) {
        onServiceCreated(response.data);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating service:', error);
      setError(error.response?.data?.message || 'שגיאה ביצירת השירות');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: '',
        description: '',
        price: '',
        duration_minutes: ''
      });
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>שירות חדש</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={loading}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="name">שם השירות *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="למשל: תספורת, עיסוי..."
              disabled={loading}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="description">תיאור השירות</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="תיאור קצר של השירות (אופציונלי)"
              rows="3"
              disabled={loading}
            />
          </div>

          <div className={styles.rowInputs}>
            <div className={styles.inputGroup}>
              <label htmlFor="price">מחיר (₪) *</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0"
                min="0"
                step="0.01"
                disabled={loading}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="duration_minutes">משך זמן (דקות) *</label>
              <input
                type="number"
                id="duration_minutes"
                name="duration_minutes"
                value={formData.duration_minutes}
                onChange={handleInputChange}
                placeholder="60"
                min="1"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              ביטול
            </button>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className={styles.spinner}></div>
                  שומר...
                </>
              ) : (
                '✓ צור שירות'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}