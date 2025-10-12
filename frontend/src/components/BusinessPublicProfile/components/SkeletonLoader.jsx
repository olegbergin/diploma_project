import React from 'react';
import styles from './SkeletonLoader.module.css';

export const SkeletonText = ({ width = '100%', height = '1rem' }) => (
    <div 
        className={styles.skeleton} 
        style={{ width, height }}
    />
);

export const SkeletonAvatar = ({ size = '40px' }) => (
    <div 
        className={`${styles.skeleton} ${styles.skeletonRound}`} 
        style={{ width: size, height: size }}
    />
);

export const SkeletonButton = ({ width = '120px', height = '44px' }) => (
    <div 
        className={`${styles.skeleton} ${styles.skeletonButton}`} 
        style={{ width, height }}
    />
);

export const SkeletonCard = ({ children, className = '' }) => (
    <div className={`${styles.skeletonCard} ${className}`}>
        {children}
    </div>
);

export const ProfileHeaderSkeleton = () => (
    <SkeletonCard className={styles.headerContainer}>
        <SkeletonText width="300px" height="3rem" />
        <SkeletonText width="200px" height="1.5rem" />
        <SkeletonText width="150px" height="1.5rem" />
        <SkeletonButton width="180px" />
    </SkeletonCard>
);

export const ContactInfoSkeleton = () => (
    <SkeletonCard className={styles.contactContainer}>
        <div className={styles.contactItem}>
            <SkeletonText width="100px" height="1rem" />
            <SkeletonText width="200px" height="1rem" />
        </div>
        <div className={styles.contactItem}>
            <SkeletonText width="80px" height="1rem" />
            <SkeletonText width="150px" height="1rem" />
        </div>
        <div className={styles.contactItem}>
            <SkeletonText width="90px" height="1rem" />
            <SkeletonText width="180px" height="1rem" />
        </div>
        <SkeletonButton width="100%" height="48px" />
    </SkeletonCard>
);

export const AboutSkeleton = () => (
    <SkeletonCard className={styles.aboutContainer}>
        <SkeletonText width="150px" height="2rem" />
        <SkeletonText width="100%" height="1rem" />
        <SkeletonText width="90%" height="1rem" />
        <SkeletonText width="95%" height="1rem" />
        <SkeletonText width="70%" height="1rem" />
    </SkeletonCard>
);

export const ImageGallerySkeleton = () => (
    <SkeletonCard className={styles.galleryContainer}>
        <SkeletonText width="120px" height="2rem" />
        <div className={styles.imageGrid}>
            {[1, 2, 3, 4].map((i) => (
                <div 
                    key={i}
                    className={`${styles.skeleton} ${styles.skeletonImage}`}
                />
            ))}
        </div>
    </SkeletonCard>
);

export const ServiceListSkeleton = () => (
    <SkeletonCard className={styles.serviceContainer}>
        <SkeletonText width="150px" height="2rem" />
        {[1, 2, 3].map((i) => (
            <div key={i} className={styles.serviceItem}>
                <div className={styles.serviceInfo}>
                    <SkeletonText width="200px" height="1.5rem" />
                    <SkeletonText width="300px" height="1rem" />
                </div>
                <SkeletonButton width="100px" height="40px" />
            </div>
        ))}
    </SkeletonCard>
);

export const ReviewsListSkeleton = () => (
    <SkeletonCard className={styles.reviewsContainer}>
        <SkeletonText width="150px" height="2rem" />
        {[1, 2, 3].map((i) => (
            <div key={i} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                    <SkeletonText width="150px" height="1.2rem" />
                    <SkeletonText width="80px" height="1.2rem" />
                </div>
                <SkeletonText width="100%" height="1rem" />
                <SkeletonText width="90%" height="1rem" />
                <SkeletonText width="60%" height="1rem" />
            </div>
        ))}
    </SkeletonCard>
);