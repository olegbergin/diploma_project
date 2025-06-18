// src/components/HomePage/BusinessCard.jsx
import React from "react";
import { Link } from "react-router-dom";
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
 * BusinessCard component displays a summary of a business.
 */
function BusinessCard({ business }) {
  const {
    business_id,
    name = "שם עסק לא ידוע",
    category = "",
    location = "",
    photos,
    average_rating,
    review_count,
    // description = ""
  } = business;

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
    } catch (e) {
      // imageUrl remains DEFAULT_PLACEHOLDER_IMAGE
    }
  }

  const handleImageError = (event) => {
    if (event.target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
      event.target.onerror = null;
      event.target.src = DEFAULT_PLACEHOLDER_IMAGE;
    }
  };

  // ---- הנתיב המתוקן כאן ----
  return (
    <Link
      to={`/home/business/${business_id}`}
      className={styles.cardLink}
      aria-label={`View details for ${name}`}
    >
      <article className={styles.card}>
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
          {location && <p className={styles.location}>{location}</p>}
          {typeof average_rating === "number" && (
            <div
              className={styles.ratingContainer}
              aria-label={`Rating: ${average_rating.toFixed(1)} out of 5 stars`}
            >
              <span className={styles.ratingValue} aria-hidden="true">
                {average_rating.toFixed(1)}
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
          {/* אפשר להחזיר פה תיאור אם תרצי */}
        </div>
      </article>
    </Link>
  );
}

export default BusinessCard;
