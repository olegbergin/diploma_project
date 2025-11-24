import React, { useState } from 'react';
import styles from './ExceptionsEditor.module.css';
import {
  createException,
  validateException,
  formatDateRange,
  getExceptionTypeLabel,
  getExceptionReasonLabel,
  sortExceptions,
  EXCEPTION_TYPES,
  EXCEPTION_REASONS
} from '../../../utils/exceptionUtils';

const ExceptionsEditor = ({ exceptions = [], onChange }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(createException({}));
  const [errors, setErrors] = useState([]);

  const handleAdd = () => {
    setFormData(createException({}));
    setEditingId(null);
    setIsAdding(true);
    setErrors([]);
  };

  const handleEdit = (exception) => {
    setFormData({ ...exception });
    setEditingId(exception.id);
    setIsAdding(true);
    setErrors([]);
  };

  const handleDelete = (id) => {
    if (window.confirm('האם למחוק חריג זה?')) {
      const updated = exceptions.filter(ex => ex.id !== id);
      onChange(updated);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData(createException({}));
    setErrors([]);
  };

  const handleSave = () => {
    const validation = validateException(formData);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    let updated;
    if (editingId) {
      // Update existing
      updated = exceptions.map(ex => ex.id === editingId ? formData : ex);
    } else {
      // Add new
      updated = [...exceptions, formData];
    }

    onChange(sortExceptions(updated));
    handleCancel();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCustomHoursChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      customHours: {
        ...prev.customHours,
        [field]: value
      }
    }));
  };

  const sortedExceptions = sortExceptions(exceptions);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>חריגים בלוח הזמנים</h3>
        <p className={styles.description}>
          הגדר תאריכים בהם העסק סגור או פועל בשעות מיוחדות (חופשות, חגים, אירועים)
        </p>
      </div>

      {/* Exception List */}
      <div className={styles.exceptionsList}>
        {sortedExceptions.length === 0 ? (
          <div className={styles.emptyState}>
            אין חריגים מוגדרים. לחץ על "הוסף חריג" להוספת תאריכים מיוחדים.
          </div>
        ) : (
          sortedExceptions.map(exception => (
            <div key={exception.id} className={styles.exceptionItem}>
              <div className={styles.exceptionInfo}>
                <div className={styles.exceptionTitle}>
                  <strong>{exception.title}</strong>
                  <span className={styles.badge}>
                    {getExceptionTypeLabel(exception.type)}
                  </span>
                </div>
                <div className={styles.exceptionDetails}>
                  <span className={styles.dateRange}>
                    📅 {formatDateRange(exception.startDate, exception.endDate)}
                  </span>
                  <span className={styles.reason}>
                    🏷️ {getExceptionReasonLabel(exception.reason)}
                  </span>
                  {exception.type === EXCEPTION_TYPES.SPECIAL_HOURS && exception.customHours && (
                    <span className={styles.hours}>
                      🕐 {exception.customHours.openTime} - {exception.customHours.closeTime}
                    </span>
                  )}
                </div>
                {exception.description && (
                  <div className={styles.exceptionDescription}>
                    {exception.description}
                  </div>
                )}
              </div>
              <div className={styles.exceptionActions}>
                <button
                  type="button"
                  onClick={() => handleEdit(exception)}
                  className={styles.editBtn}
                >
                  ✏️ ערוך
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(exception.id)}
                  className={styles.deleteBtn}
                >
                  🗑️ מחק
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Form */}
      {!isAdding ? (
        <button
          type="button"
          onClick={handleAdd}
          className={styles.addButton}
        >
          ➕ הוסף חריג
        </button>
      ) : (
        <div className={styles.form}>
          <h4>{editingId ? 'עריכת חריג' : 'חריג חדש'}</h4>

          {errors.length > 0 && (
            <div className={styles.errors}>
              {errors.map((error, index) => (
                <div key={index} className={styles.error}>⚠️ {error}</div>
              ))}
            </div>
          )}

          <div className={styles.formGrid}>
            {/* Title */}
            <div className={styles.formField}>
              <label>כותרת *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="לדוגמה: חופשת קיץ"
              />
            </div>

            {/* Type */}
            <div className={styles.formField}>
              <label>סוג *</label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
              >
                <option value={EXCEPTION_TYPES.CLOSURE}>סגירה מלאה</option>
                <option value={EXCEPTION_TYPES.SPECIAL_HOURS}>שעות מיוחדות</option>
              </select>
            </div>

            {/* Start Date */}
            <div className={styles.formField}>
              <label>תאריך התחלה *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className={styles.formField}>
              <label>תאריך סיום *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>

            {/* Reason */}
            <div className={styles.formField}>
              <label>סיבה</label>
              <select
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
              >
                {Object.values(EXCEPTION_REASONS).map(reason => (
                  <option key={reason.value} value={reason.value}>
                    {reason.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Hours - only show for special_hours type */}
            {formData.type === EXCEPTION_TYPES.SPECIAL_HOURS && (
              <>
                <div className={styles.formField}>
                  <label>שעת פתיחה *</label>
                  <input
                    type="time"
                    value={formData.customHours?.openTime || '09:00'}
                    onChange={(e) => handleCustomHoursChange('openTime', e.target.value)}
                  />
                </div>
                <div className={styles.formField}>
                  <label>שעת סגירה *</label>
                  <input
                    type="time"
                    value={formData.customHours?.closeTime || '17:00'}
                    onChange={(e) => handleCustomHoursChange('closeTime', e.target.value)}
                  />
                </div>
              </>
            )}

            {/* Description */}
            <div className={`${styles.formField} ${styles.fullWidth}`}>
              <label>תיאור (אופציונלי)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="הסבר נוסף שיוצג ללקוחות"
                rows="3"
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              onClick={handleSave}
              className={styles.saveBtn}
            >
              ✓ שמור
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className={styles.cancelBtn}
            >
              ✗ ביטול
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExceptionsEditor;
