import React, { useState } from "react";
import styles from "./ServiceModal.module.css";
import axiosInstance from "../../api/axiosInstance";

export default function ServiceModal({
  isOpen,
  onClose,
  onServiceCreated,
  businessId,
}) {
  /* 
    סטייט של הטופס – שומר את כל שדות השירות החדש 
    name, description, price, duration_minutes
  */
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration_minutes: "",
  });

  /* סטייט לטעינה (כאשר שולחים לשרת) */
  const [loading, setLoading] = useState(false);

  /* סטייט לשמירת הודעות שגיאה */
  const [error, setError] = useState("");

  /* 
    שינוי ערכים בשדות הטופס — 
    כל פעם שהמשתמש מקליד, מעדכנים את ה-state המתאים
  */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // מנקה הודעת שגיאה אם המשתמש התחיל להקליד מחדש
    if (error) setError("");
  };

  /* 
    שליחת הטופס לשרת — יצירת שירות חדש 
    כולל בדיקות תקינות לפני שליחה (Validation)
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // בדיקת תקינות: שם שירות חובה
    if (!formData.name.trim()) {
      setError("שם השירות הוא שדה חובה");
      return;
    }

    // בדיקת תקינות מחיר
    if (
      !formData.price ||
      isNaN(formData.price) ||
      parseFloat(formData.price) <= 0
    ) {
      setError("יש להזין מחיר תקין");
      return;
    }

    // בדיקת תקינות משך זמן
    if (
      !formData.duration_minutes ||
      isNaN(formData.duration_minutes) ||
      parseInt(formData.duration_minutes) <= 0
    ) {
      setError("יש להזין זמן תקין בדקות");
      return;
    }

    setLoading(true);
    setError("");

    // בניית אובייקט השירות לשליחה
    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      // שליחת בקשה לשרת
      const response = await axiosInstance.post(
        `/businesses/${businessId}/services`,
        serviceData
      );

      // איפוס הטופס לאחר יצירה מוצלחת
      setFormData({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
      });

      // עדכון האב שיש שירות חדש (חשוב לרענון רשימת השירותים)
      if (onServiceCreated) {
        onServiceCreated(response.data);
      }

      onClose(); // סגירת המודאל
    } catch (error) {
      console.error("Error creating service:", error);
      setError(error.response?.data?.message || "שגיאה ביצירת השירות");
    } finally {
      setLoading(false);
    }
  };

  /* 
    סגירת המודאל — 
    רק אם לא בטעינה, וגם מנקה את השדות והשגיאות
  */
  const handleClose = () => {
    if (!loading) {
      setFormData({
        name: "",
        description: "",
        price: "",
        duration_minutes: "",
      });
      setError("");
      onClose();
    }
  };

  /* אם המודאל סגור — לא מציגים אותו בכלל */
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      {/* עצירת bubbling כדי שהמודאל לא יסגר בלחיצה פנימית */}
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* כותרת + כפתור סגירה */}
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

        {/* טופס יצירת שירות */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* תצוגת הודעות שגיאה */}
          {error && <div className={styles.error}>{error}</div>}

          {/* שדה שם השירות */}
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

          {/* שדה תיאור השירות */}
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

          {/* שדה מחיר + משך זמן */}
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

          {/* כפתורי פעולה */}
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
                "✓ צור שירות"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
