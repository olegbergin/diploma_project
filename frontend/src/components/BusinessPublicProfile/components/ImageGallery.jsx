import React from 'react';
import styles from './ImageGallery.module.css';

const ImageGallery = () => {
    // Placeholder for images
    const images = [
        '/images/placeholder_buisness.png',
        '/images/placeholder_buisness.png',
        '/images/placeholder_buisness.png',
        '/images/placeholder_buisness.png',
    ];

    return (
        <div className={styles.galleryContainer}>
            <h2>Gallery</h2>
            <div className={styles.imageGrid}>
                {images.map((image, index) => (
                    <img key={index} src={image} alt={`Gallery image ${index + 1}`} className={styles.galleryImage} />
                ))}
            </div>
        </div>
    );
};

export default ImageGallery;
