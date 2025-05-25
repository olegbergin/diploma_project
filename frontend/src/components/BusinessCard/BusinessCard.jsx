// src/components/HomePage/BusinessCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BusinessCard.module.css';

// Default placeholder image path (place in public folder or import if in src/assets)
const DEFAULT_PLACEHOLDER_IMAGE = '../public/images/placeholder_buisness.png'; // Adjust path as necessary

/**
 * Renders stars based on the rating.
 * @param {number} rating - The numerical rating (e.g., 4.5).
 * @param {number} maxStars - The maximum number of stars (default 5).
 * @returns {JSX.Element[]} An array of star elements.
 */
const renderStars = (rating, maxStars = 5) => {
  const stars = [];
  const roundedRating = Math.round(rating * 2) / 2; // Round to nearest 0.5

  for (let i = 1; i <= maxStars; i++) {
    if (i <= roundedRating) {
      // Full star
      stars.push(<span key={`star-full-${i}`} className={`${styles.star} ${styles.starFull}`}>★</span>);
    } else if (i - 0.5 === roundedRating) {
      // Half star (optional, depends on your icon set and preference)
      // For simplicity, you might just round to full stars or use a different icon for half.
      // This example treats > .0 and < .9 as half if you want more granular half-star icons.
      // For now, we'll use the full star character and let CSS differentiate if needed.
      stars.push(<span key={`star-half-${i}`} className={`${styles.star} ${styles.starHalf}`}>★</span>); // Needs specific CSS for half appearance
    } else {
      // Empty star
      stars.push(<span key={`star-empty-${i}`} className={`${styles.star} ${styles.starEmpty}`}>☆</span>);
    }
  }
  return stars;
};

/**
 * BusinessCard component displays a summary of a business.
 * @param {object} props - The component's props.
 * @param {object} props.business - The business data object.
 * Expected business object properties:
 * - business_id (number/string): Unique identifier.
 * - name (string): Name of the business.
 * - category (string, optional): Category of the business.
 * - location (string, optional): Location/address of the business.
 * - photos (string/JSON array, optional): URLs of business photos.
 * - average_rating (number, optional): The average rating of the business.
 * - review_count (number, optional): The number of reviews.
 * - description (string, optional): A short description.
 */
function BusinessCard({ business }) {
  // Destructure with default values to prevent errors if properties are missing
  const {
    business_id,
    name = "שם עסק לא ידוע", // Unknown Business Name
    category = "",
    location = "",
    photos, // Can be a JSON string or already an array
    average_rating,
    review_count,
    // description = "" // If you plan to show a snippet
  } = business;

  // --- Image Handling ---
  let imageUrl = DEFAULT_PLACEHOLDER_IMAGE;
  if (photos) {
    try {
      // Attempt to parse photos if it's a JSON string
      const parsedPhotos = typeof photos === 'string' ? JSON.parse(photos) : photos;
      if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0 && parsedPhotos[0]) {
        imageUrl = parsedPhotos[0]; // Use the first photo
      }
    } catch (e) {
      console.warn(`Could not parse photos for business ID ${business_id}:`, photos, e);
      // imageUrl remains DEFAULT_PLACEHOLDER_IMAGE
    }
  }

  // --- Fallback for Image onError ---
  const handleImageError = (event) => {
    // Prevent infinite loop if placeholder also fails
    if (event.target.src !== DEFAULT_PLACEHOLDER_IMAGE) {
      event.target.onerror = null; // Remove the error handler
      event.target.src = DEFAULT_PLACEHOLDER_IMAGE; // Set to default placeholder
    }
  };

  return (
    // Link to the detailed business page
    <Link to={`/business/${business_id}`} className={styles.cardLink} aria-label={`View details for ${name}`}>
      <article className={styles.card}> {/* Use <article> for self-contained content */}
        <div className={styles.imageContainer}>
          <img
            src={imageUrl}
            alt={`תמונה של ${name}`} // Image of [Business Name] - important for accessibility
            className={styles.image}
            onError={handleImageError} // Handle broken image links
            loading="lazy" // Improve performance by lazy-loading images
          />
        </div>
        <div className={styles.content}>
          <h3 className={styles.name}>{name}</h3>
          {category && <p className={styles.category}>{category}</p>}
          {location && <p className={styles.location}>{location}</p>}

          {/* Display rating only if available */}
          {typeof average_rating === 'number' && (
            <div className={styles.ratingContainer} aria-label={`Rating: ${average_rating.toFixed(1)} out of 5 stars`}>
              <span className={styles.ratingValue} aria-hidden="true">{average_rating.toFixed(1)}</span>
              <span className={styles.stars} aria-hidden="true">{renderStars(average_rating)}</span>
              {typeof review_count === 'number' && review_count > 0 && (
                <span className={styles.reviewCount} aria-label={`${review_count} reviews`}>({review_count})</span>
              )}
            </div>
          )}
          {/*
          {description && (
            <p className={styles.description}>
              {description.length > 100 ? `${description.substring(0, 97)}...` : description}
            </p>
          )}
          */}
        </div>
        {/* Placeholder for a "favorite" button or other actions */}
        {/* <div className={styles.actions}> <button>♡</button> </div> */}
      </article>
    </Link>
  );
}

export default BusinessCard;