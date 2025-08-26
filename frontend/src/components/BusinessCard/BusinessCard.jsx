// src/components/BusinessCard/BusinessCard.jsx
import React, { useState, memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import ErrorMessage from "../shared/ErrorMessage/ErrorMessage";
import useErrorHandler from "../../hooks/useErrorHandler";
import styles from "./BusinessCard.module.css";

const DEFAULT_PLACEHOLDER_IMAGE = "/images/placeholder_buisness.png"; // Adjust path as necessary

/**
 * Renders stars based on the rating.
 */
const renderStars = (rating, maxStars = 5) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2;

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      // Full star
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
const BusinessCard = memo(function BusinessCard({ 
  business, 
  onUpdate, 
  onDelete, 
  userRole,
  isFavorite = false,
  onToggleFavorite 
}) {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: business.name || "",
    category: business.category || "",
    description: business.description || "",
    location: business.location || "",
    phone: business.phone || "",
  });
  const { error, isLoading, handleError, clearError, executeWithErrorHandling } = useErrorHandler();

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

  const businessId = String(propBusinessId || business.business_id);

  let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
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
    }
  }

  const handleImageError = (event) => {
    if (event.target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
      event.target.onerror = null;
      event.target.src = DEFAULT_PLACEHOLDER_IMAGE;
    }
  };

  const handleEditChange = useCallback((event) => {
    const { name, value } = event.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleUpdate = useCallback(
    async (e) => {
      e.preventDefault();
      
      // Client-side validation
      if (!editData.name?.trim()) {
        handleError('שם העסק נדרש / Business name is required');
        return;
      }
      if (!editData.category?.trim()) {
        handleError('קטגוריה נדרשת / Category is required');
        return;
      }
      if (!editData.description?.trim()) {
        handleError('תיאור נדרש / Description is required');
        return;
      }
      
      try {
        await executeWithErrorHandling(async () => {
          const response = await axiosInstance.put(
            `/businesses/${businessId}`,
            editData
          );
          if (onUpdate) onUpdate(response.data);
          setIsEditing(false);
        });
      } catch (err) {
        console.error('Failed to update business:', err);
      }
    },
    [businessId, editData, onUpdate, handleError, executeWithErrorHandling]
  );

  const handleDelete = useCallback(async () => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק עסק זה?")) {
      try {
        await executeWithErrorHandling(async () => {
          await axiosInstance.delete(`/businesses/${businessId}`);
          if (onDelete) onDelete(businessId);
        });
      } catch (err) {
        console.error('Failed to delete business:', err);
      }
    }
  }, [businessId, onDelete, executeWithErrorHandling]);


  const canModify = userRole === 'business_owner' || userRole === 'admin';
  const showButtons = canModify;

  if (isEditing && canModify) {
    return (
      <>
        <div className={styles.businessCard}>
          {/* Error Display */}
          {error && (
            <ErrorMessage 
              error={error} 
              onClose={clearError}
              className={styles.errorMessage}
            />
          )}
          
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
              <button
                type="submit"
                className={styles.saveButton}
                disabled={isLoading}
              >
                {isLoading ? "💾 שומר..." : "💾 שמור"}
              </button>
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

  return (
    <>
      <article
        className={`${styles.card} ${styles.cardLink}`}
        aria-label={`View details for ${name}`}
        onClick={() => {
          console.log("Navigating to:", `/business/${businessId}`);
          navigate(`/business/${businessId}`);
        }}
      >
          <div className={styles.imageContainer}>
            <img
              src={imageUrl}
              alt={`תמונה של ${name}`}
              className={styles.image}
              onError={handleImageError}
              loading="lazy"
            />
          </div>
          <div className={styles.content}>
            <h3 className={styles.name}>{name}</h3>
            {category && <p className={styles.category}>{category}</p>}
            {description && <p className={styles.description}>{description}</p>}
            {location && <p className={styles.location}>📍 {location}</p>}
            {phone && <p className={styles.phone}>📞 {phone}</p>}
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
          {onToggleFavorite && (
            <button
              className={`${styles.favoriteButton} ${isFavorite ? styles.favorited : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(businessId, isFavorite);
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              title={isFavorite ? "הסר מהמועדפים" : "הוסף למועדפים"}
            >
              {isFavorite ? '❤️' : '🤍'}
            </button>
          )}

          {showButtons && (
            <div className={styles.actions}>
              <button
                className={styles.editButton}
                onClick={(e) => {
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
