import { useState, useEffect } from 'react';
import styles from './ServiceModal.module.css';

export default function ServiceModal({ 
  service, 
  categories, 
  onSave, 
  onDelete, 
  onClose 
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: 0,
    duration: 30,
    isActive: true,
    imageUrl: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (service) {
      if (service.isNew) {
        setFormData({
          name: '',
          description: '',
          category: categories?.[0] || '',
          price: 0,
          duration: 30,
          isActive: true,
          imageUrl: ''
        });
      } else {
        setFormData({
          name: service.name || '',
          description: service.description || '',
          category: service.category || '',
          price: service.price || 0,
          duration: service.duration || 30,
          isActive: service.isActive !== undefined ? service.isActive : true,
          imageUrl: service.imageUrl || ''
        });
      }
    }
  }, [service, categories]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'שם השירות חובה';
    } else if (formData.name.length < 2) {
      newErrors.name = 'שם השירות חייב להכיל לפחות 2 תווים';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'תיאור השירות חובה';
    } else if (formData.description.length < 10) {
      newErrors.description = 'תיאור השירות חייב להכיל לפחות 10 תווים';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'קטגוריה חובה';
    }

    if (formData.price < 0) {
      newErrors.price = 'מחיר לא יכול להיות שלילי';
    } else if (formData.price === 0) {
      newErrors.price = 'מחיר חייב להיות גדול מ-0';
    }

    if (formData.duration < 5) {
      newErrors.duration = 'משך זמן מינימלי 5 דקות';
    } else if (formData.duration > 480) {
      newErrors.duration = 'משך זמן מקסימלי 8 שעות (480 דקות)';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'כתובת URL לא תקינה';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // URL validation helper
  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving service:', error);
      setErrors({ submit: 'שגיאה בשמירת השירות. נסה שוב.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את השירות? פעולה זו לא ניתנת לביטול.')) {
      onDelete();
    }
  };

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Duration format helper
  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${minutes} דקות`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} שעות`;
    }
    return `${hours} שעות ו-${remainingMinutes} דקות`;
  };

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {service?.isNew ? 'שירות חדש' : 'עריכת שירות'}
          </h2>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="סגור"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          {/* Basic Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>פרטים בסיסיים</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>שם השירות *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`${styles.input} ${errors.name ? styles.error : ''}`}
                placeholder="לדוגמה: חלה לשבת"
                maxLength="100"
              />
              {errors.name && (
                <span className={styles.errorText}>{errors.name}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>תיאור השירות *</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className={`${styles.textarea} ${errors.description ? styles.error : ''}`}
                placeholder="תאר את השירות, הרכיבים, ותהליך ההכנה..."
                rows="4"
                maxLength="500"
              />
              <div className={styles.characterCount}>
                {formData.description.length}/500
              </div>
              {errors.description && (
                <span className={styles.errorText}>{errors.description}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>קטגוריה *</label>
                <div className={styles.categoryInput}>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`${styles.select} ${errors.category ? styles.error : ''}`}
                  >
                    <option value="">בחר קטגוריה</option>
                    {categories?.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className={`${styles.input} ${styles.categoryCustomInput} ${errors.category ? styles.error : ''}`}
                    placeholder="או הכנס קטגוריה חדשה"
                    maxLength="50"
                  />
                </div>
                {errors.category && (
                  <span className={styles.errorText}>{errors.category}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>כתובת תמונה (אופציונלי)</label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => handleInputChange('imageUrl', e.target.value)}
                  className={`${styles.input} ${errors.imageUrl ? styles.error : ''}`}
                  placeholder="https://example.com/image.jpg"
                />
                {errors.imageUrl && (
                  <span className={styles.errorText}>{errors.imageUrl}</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing and Duration */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>מחיר ומשך זמן</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>מחיר (₪) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  className={`${styles.input} ${errors.price ? styles.error : ''}`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.price && (
                  <span className={styles.errorText}>{errors.price}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  משך זמן (דקות) * 
                  <span className={styles.durationDisplay}>
                    {formData.duration > 0 && ` - ${formatDuration(formData.duration)}`}
                  </span>
                </label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                  className={`${styles.input} ${errors.duration ? styles.error : ''}`}
                  min="5"
                  max="480"
                  step="5"
                  placeholder="30"
                />
                {errors.duration && (
                  <span className={styles.errorText}>{errors.duration}</span>
                )}
              </div>
            </div>
          </div>

          {/* Status */}
          <div className={styles.section}>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>שירות פעיל</span>
                <span className={styles.checkboxDescription}>
                  שירותים פעילים מוצגים ללקוחות וניתן להזמין אותם
                </span>
              </label>
            </div>
          </div>

          {/* Preview */}
          {(formData.name || formData.description) && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>תצוגה מקדימה</h3>
              <div className={styles.servicePreview}>
                <div className={styles.previewHeader}>
                  <h4 className={styles.previewName}>
                    {formData.name || 'שם השירות'}
                  </h4>
                  <div className={styles.previewPrice}>
                    ₪{formData.price || 0}
                  </div>
                </div>
                
                <div className={styles.previewCategory}>
                  {formData.category || 'קטגוריה'}
                </div>
                
                <p className={styles.previewDescription}>
                  {formData.description || 'תיאור השירות'}
                </p>
                
                <div className={styles.previewFooter}>
                  <span className={styles.previewDuration}>
                    ⏱️ {formatDuration(formData.duration || 30)}
                  </span>
                  <span className={`${styles.previewStatus} ${formData.isActive ? styles.active : styles.inactive}`}>
                    {formData.isActive ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}

          {/* Modal Actions */}
          <div className={styles.modalActions}>
            <div className={styles.leftActions}>
              {!service?.isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteButton}
                >
                  מחק שירות
                </button>
              )}
            </div>

            <div className={styles.rightActions}>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
                disabled={isSubmitting}
              >
                ביטול
              </button>
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'שומר...' : 'שמור'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}