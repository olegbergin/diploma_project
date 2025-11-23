// src/components/BusinessCard/BusinessCard.jsx
import React, { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ErrorMessage from "../shared/ErrorMessage/ErrorMessage";
import useErrorHandler from "../../hooks/useErrorHandler";
import styles from "./BusinessCard.module.css";

// תמונת ברירת מחדל במקרה שאין תמונות לעסק
const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholder_buisness.png"; // Adjust path as necessary

/**
 * Renders stars based on the rating.
 */
// פונקציה שמייצרת תצוגת כוכבים לפי דירוג (כולל חצאי כוכבים)
const renderStars = (rating, maxStars = 5) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;

  // לולאה שיוצרת עד maxStars כוכבים
  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      // Full star
      // כוכב מלא
      stars.push(
        <span
          key={`star-full-${i}`}
          className={`${styles.star} ${styles.starFull}`}
        >
          ★
        </span>
      );
    } else if (i - 0.5 === roundedRating) {
      // Half star
      // חצי כוכב
      stars.push(
        <span
          key={`star-half-${i}`}
          className={`${styles.star} ${styles.starHalf}`}
        >
          ★
        </span>
      );
    } else {
      // Empty star
      // כוכב ריק
      stars.push(
        <span
          key={`star-empty-${i}`}
          className={`${styles.star} ${styles.starEmpty}`}
        >
          ☆
        </span>
      );
    }
  }
  return stars;
};

/**
 * BusinessCard component displays a summary of a business with editing capabilities.
 */
// קומפוננטת כרטיס עסק: מציגה מידע על העסק + אפשרות עריכה/מחיקה למורשים
const BusinessCard = memo(function BusinessCard({
  business,
  onUpdate,
  onDelete,
  userRole,
  isFavorite = false,
  onToggleFavorite,
}) {
  // ניווט לעמוד העסק
  const navigate = useNavigate();

  // האם הכרטיס במצב עריכה
  const [isEditing, setIsEditing] = useState(false);

  // נתונים לעריכה (מאותחלים לפי העסק הקיים)
  const [editData, setEditData] = useState({
    name: business.name || "",
    category: business.category || "",
    description: business.description || "",
    location: business.location || "",
    phone: business.phone || "",
  });

  // שימוש בהוק לניהול שגיאות וטעינות
  const {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
  } = useErrorHandler();

  // פירוק שדות מהאובייקט business לנוחות
  const {
    businessId: propBusinessId,
    name = "שם עסק לא ידוע",
    category = "",
    location = "",
    description = "",
    phone = "",
    photos,
    average_rating,
    review_count,
  } = business;

  // מזהה עסק כאילו תמיד מחרוזת (לשימוש בנתיבים)
  const businessId = String(propBusinessId || business.business_id);

  // ---------------------------------------------------
  // טיפול בתמונות עסק
  // ---------------------------------------------------
  // ברירת מחדל לתמונה
  let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;

  // אם יש photos, ננסה לפרש ולשלוף תמונה ראשית
  if (photos) {
    try {
      const parsedPhotos =
        typeof photos === "string" ? JSON.parse(photos) : photos;
      if (
        Array.isArray(parsedPhotos) &&
        parsedPhotos.length > 0 &&
        parsedPhotos[0]
      ) {
        imageUrl = parsedPhotos[0];
      }
    } catch {
      // imageUrl remains DEFAULT_PLACEHOLDER_IMAGE
      // אם יש שגיאה בפענוח – נשארים עם תמונת ברירת מחדל
    }
  }

  // אם טעינת התמונה נכשלת – נחליף לתמונת ברירת מחדל
  const handleImageError = (event) => {
    if (event.target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
      event.target.onerror = null;
      event.target.src = DEFAULT_PLACEHOLDER_IMAGE;
    }
  };

  // ---------------------------------------------------
  // שינוי ערכים בטופס עריכה
  // ---------------------------------------------------
  const handleEditChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  // ---------------------------------------------------
  // עדכון עסק (PUT) אחרי לחיצה על שמור
  // ---------------------------------------------------
  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();

      // Client-side validation
      // בדיקות צד לקוח לפני שליחה
      if (!editData.name?.trim()) {
        handleError("שם העסק נדרש / Business name is required");
        return;
      }
      if (!editData.category?.trim()) {
        handleError("קטגוריה נדרשת / Category is required");
        return;
      }
      if (!editData.description?.trim()) {
        handleError("תיאור נדרש / Description is required");
        return;
      }

      try {
        await executeWithErrorHandling(async () => {
          // שליחת PUT לעדכון נתוני העסק
          const response = await axiosInstance.put(
            `/businesses/${businessId}`,
            editData
          );

          // אם ההורה ביקש עדכון רשימה – מפעילים callback
          if (onUpdate) onUpdate(response.data);

          // יציאה ממצב עריכה
          setIsEditing(false);
        });
      } catch (err) {
        console.error("Failed to update business:", err);
      }
    },
    [businessId, editData, onUpdate, handleError, executeWithErrorHandling]
  );

  // ---------------------------------------------------
  // מחיקת עסק (DELETE) אחרי אישור
  // ---------------------------------------------------
  const handleDelete = useCallback(async () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עסק זה?")) {
      try {
        await executeWithErrorHandling(async () => {
          // שליחת DELETE לשרת
          await axiosInstance.delete(`/businesses/${businessId}`);

          // אם ההורה רוצה להסיר מהרשימה – מפעילים callback
          if (onDelete) onDelete(businessId);
        });
      } catch (err) {
        console.error("Failed to delete business:", err);
      }
    }
  }, [businessId, onDelete, executeWithErrorHandling]);

  // האם למשתמש יש הרשאה לשנות עסק
  const canModify = userRole === "business_owner" || userRole === "admin";

  // האם להציג כפתורי עריכה/מחיקה
  const showButtons = canModify;

  // ---------------------------------------------------
  // מצב עריכה: מציג טופס במקום כרטיס תצוגה
  // ---------------------------------------------------
  if (isEditing && canModify) {
    return (
      <>
        <div className={styles.businessCard}>
          {/* Error Display */}
          {/* הצגת שגיאה אם קיימת */}
          {error && (
            <ErrorMessage
              error={error}
              onClose={clearError}
              className={styles.errorMessage}
            />
          )}

          {/* טופס עריכת עסק */}
          <form onSubmit={handleUpdate} className={styles.editForm}>
            <input
              type="text"
              name="name"
              value={editData.name}
              onChange={handleEditChange}
              placeholder="שם העסק"
              className={styles.editInput}
              required
            />
            <input
              type="text"
              name="category"
              value={editData.category}
              onChange={handleEditChange}
              placeholder="קטגוריה"
              className={styles.editInput}
              required
            />
            <textarea
              name="description"
              value={editData.description}
              onChange={handleEditChange}
              placeholder="תיאור"
              className={styles.editTextarea}
              rows="3"
            />
            <input
              type="text"
              name="location"
              value={editData.location}
              onChange={handleEditChange}
              placeholder="מיקום"
              className={styles.editInput}
            />
            <input
              type="tel"
              name="phone"
              value={editData.phone}
              onChange={handleEditChange}
              placeholder="טלפון"
              className={styles.editInput}
            />
            <div className={styles.editActions}>
              {/* כפתור שמירה */}
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? "💾 שומר..." : "💾 שמור"}
              </button>

              {/* כפתור ביטול עריכה */}
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                ❌ ביטול
              </button>
            </div>
          </form>
        </div>
      </>
    );
  }

  // ---------------------------------------------------
  // מצב תצוגה רגיל: כרטיס עסק
  // ---------------------------------------------------
  return (
    <>
      <article
        className={`${styles.card} ${styles.cardLink}`}
        aria-label={`View details for ${name}`}
        // לחיצה על הכרטיס תעביר לעמוד העסק
        onClick={() => navigate(`/business/${businessId}`)}
      >
        {/* תמונת העסק */}
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={`תמונה של ${name}`}
            className={styles.image}
            onError={handleImageError}
            loading="lazy"
          />
        </div>

        {/* תוכן הכרטיס */}
        <div className={styles.content}>
          <h3 className={styles.name}>{name}</h3>
          {category && <p className={styles.category}>{category}</p>}
          {description && <p className={styles.description}>{description}</p>}
          {location && <p className={styles.location}>📍 {location}</p>}
          {phone && <p className={styles.phone}>📞 {phone}</p>}

          {/* דירוג וכוכבים */}
          {typeof average_rating === "number" && (
            <div
              className={styles.ratingContainer}
              aria-label={`Rating: ${average_rating.toFixed(1)} out of 5 stars`}
            >
              <span className={styles.ratingValue} aria-hidden="true">
                ⭐ {average_rating.toFixed(1)}
              </span>
              <span className={styles.stars} aria-hidden="true">
                {renderStars(average_rating)}
              </span>

              {/* מספר ביקורות אם יש */}
              {typeof review_count === "number" && review_count > 0 && (
                <span
                  className={styles.reviewCount}
                  aria-label={`${review_count} reviews`}
                >
                  ({review_count})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Favorites Button */}
        {/* כפתור מועדפים – מוצג רק אם התקבלה פונקציה מתאימה */}
        {onToggleFavorite && (
          <button
            className={`${styles.favoriteButton} ${
              isFavorite ? styles.favorited : ""
            }`}
            onClick={(e) => {
              // מונעים ניווט לעמוד העסק בלחיצה על הלב
              e.preventDefault();
              e.stopPropagation();

              // מפעילים פונקציה שהועברה מההורה
              onToggleFavorite(businessId, isFavorite);
            }}
            aria-label={
              isFavorite ? "Remove from favorites" : "Add to favorites"
            }
            title={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
          >
            {isFavorite ? "❤️" : "🤍"}
          </button>
        )}

        {/* כפתורי עריכה/מחיקה רק למורשים */}
        {showButtons && (
          <div className={styles.actions}>
            <button
              className={styles.editButton}
              onClick={(e) => {
                // מונעים ניווט כשנלחץ כפתור העריכה
                e.preventDefault();
                e.stopPropagation();
                setIsEditing(true);
              }}
              disabled={isLoading}
            >
              ✏️ ערוך
            </button>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                // מונעים ניווט כשנלחץ כפתור המחיקה
                e.preventDefault();
                e.stopPropagation();
                handleDelete();
              }}
              disabled={isLoading}
            >
              {isLoading ? "🗑️ מוחק..." : "🗑️ מחק"}
            </button>
          </div>
        )}
      </article>
    </>
  );
});

export default BusinessCard;
