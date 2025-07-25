import { useState, useEffect } from 'react';
import styles from './AppointmentModal.module.css';
import { useServices } from '../hooks/useServices';

export default function AppointmentModal({ 
  appointment, 
  businessId, 
  onSave, 
  onDelete, 
  onClose 
}) {
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceId: '',
    serviceName: '',
    date: '',
    time: '',
    duration: 30,
    status: 'pending',
    price: 0,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { services, isLoading: servicesLoading } = useServices(businessId);

  // Initialize form data
  useEffect(() => {
    if (appointment) {
      if (appointment.isNew) {
        setFormData({
          customerName: '',
          customerPhone: '',
          serviceId: '',
          serviceName: '',
          date: appointment.date ? appointment.date.toISOString().split('T')[0] : '',
          time: appointment.time || '',
          duration: 30,
          status: 'pending',
          price: 0,
          notes: ''
        });
      } else {
        setFormData({
          customerName: appointment.customerName || '',
          customerPhone: appointment.customerPhone || '',
          serviceId: appointment.serviceId || '',
          serviceName: appointment.serviceName || '',
          date: appointment.date || '',
          time: appointment.time || '',
          duration: appointment.duration || 30,
          status: appointment.status || 'pending',
          price: appointment.price || 0,
          notes: appointment.notes || ''
        });
      }
    }
  }, [appointment]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }

    // Auto-fill service details when service is selected
    if (field === 'serviceId' && services) {
      const selectedService = services.find(s => s.id === value);
      if (selectedService) {
        setFormData(prev => ({
          ...prev,
          serviceName: selectedService.name,
          duration: selectedService.duration || 30,
          price: selectedService.price || 0
        }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = 'שם הלקוח חובה';
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = 'טלפון הלקוח חובה';
    } else if (!/^05\d{8}$/.test(formData.customerPhone.replace(/[\s-]/g, ''))) {
      newErrors.customerPhone = 'מספר טלפון לא תקין';
    }

    if (!formData.serviceId) {
      newErrors.serviceId = 'יש לבחור שירות';
    }

    if (!formData.date) {
      newErrors.date = 'תאריך חובה';
    }

    if (!formData.time) {
      newErrors.time = 'שעה חובה';
    }

    if (formData.duration < 15) {
      newErrors.duration = 'משך זמן מינימלי 15 דקות';
    }

    if (formData.price < 0) {
      newErrors.price = 'מחיר לא יכול להיות שלילי';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      console.error('Error saving appointment:', error);
      setErrors({ submit: 'שגיאה בשמירת התור. נסה שוב.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את התור?')) {
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

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'ממתין לאישור', color: '#f59e0b' },
    { value: 'confirmed', label: 'מאושר', color: '#10b981' },
    { value: 'completed', label: 'הושלם', color: '#2563eb' },
    { value: 'cancelled', label: 'בוטל', color: '#ef4444' }
  ];

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop} onClick={onClose} />
      
      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>
            {appointment?.isNew ? 'תור חדש' : 'עריכת תור'}
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
          {/* Customer Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>פרטי לקוח</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>שם הלקוח *</label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className={`${styles.input} ${errors.customerName ? styles.error : ''}`}
                  placeholder="הכנס שם הלקוח"
                />
                {errors.customerName && (
                  <span className={styles.errorText}>{errors.customerName}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>טלפון *</label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className={`${styles.input} ${errors.customerPhone ? styles.error : ''}`}
                  placeholder="050-1234567"
                />
                {errors.customerPhone && (
                  <span className={styles.errorText}>{errors.customerPhone}</span>
                )}
              </div>
            </div>
          </div>

          {/* Service Information */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>פרטי שירות</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>שירות *</label>
              <select
                value={formData.serviceId}
                onChange={(e) => handleInputChange('serviceId', e.target.value)}
                className={`${styles.select} ${errors.serviceId ? styles.error : ''}`}
                disabled={servicesLoading}
              >
                <option value="">בחר שירות</option>
                {services?.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ₪{service.price}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <span className={styles.errorText}>{errors.serviceId}</span>
              )}
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>משך זמן (דקות)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  className={`${styles.input} ${errors.duration ? styles.error : ''}`}
                  min="15"
                  step="15"
                />
                {errors.duration && (
                  <span className={styles.errorText}>{errors.duration}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>מחיר (₪)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value))}
                  className={`${styles.input} ${errors.price ? styles.error : ''}`}
                  min="0"
                  step="0.01"
                />
                {errors.price && (
                  <span className={styles.errorText}>{errors.price}</span>
                )}
              </div>
            </div>
          </div>

          {/* DateTime and Status */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>תאריך ושעה</h3>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.label}>תאריך *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`${styles.input} ${errors.date ? styles.error : ''}`}
                />
                {errors.date && (
                  <span className={styles.errorText}>{errors.date}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>שעה *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`${styles.input} ${errors.time ? styles.error : ''}`}
                />
                {errors.time && (
                  <span className={styles.errorText}>{errors.time}</span>
                )}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>סטטוס</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.select}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className={styles.section}>
            <div className={styles.formGroup}>
              <label className={styles.label}>הערות</label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className={styles.textarea}
                placeholder="הערות נוספות..."
                rows="3"
              />
            </div>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className={styles.submitError}>
              {errors.submit}
            </div>
          )}

          {/* Modal Actions */}
          <div className={styles.modalActions}>
            <div className={styles.leftActions}>
              {!appointment?.isNew && (
                <button
                  type="button"
                  onClick={handleDelete}
                  className={styles.deleteButton}
                >
                  מחק תור
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