import React from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = ({ business }) => {
    // Parse photos from business data
    let images = [];
    if (business?.photos) {
        try {
            const parsedPhotos = typeof business.photos === 'string' 
                ? JSON.parse(business.photos) 
                : business.photos;
            
            if (Array.isArray(parsedPhotos) && parsedPhotos.length > 0) {
                images = parsedPhotos;
            }
        } catch (error) {
            console.warn('Could not parse business photos:', error);
        }
    }
    
    // If no images, don't show gallery
    if (images.length === 0) {
        return null;
    }

    return (
        <div className={styles.galleryContainer}>
            <h2>גלריה</h2>
            <div className={styles.imageGrid}>
                {images.map((imageUrl, index) => (
                    <img 
                        key={index} 
                        src={imageUrl.startsWith('/') ? `http://localhost:3031${imageUrl}` : imageUrl}
                        alt={`תמונת גלריה ${index + 1}`} 
                        className={styles.galleryImage}
                        onError={(e) => {
                            console.error('Failed to load image:', imageUrl);
                            e.target.style.display = 'none';
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
