import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../api/axiosInstance';
import styles from './BusinessPublicProfile.module.css';
import ProfileHeader from './components/ProfileHeader';
import ContactInfo from './components/ContactInfo';
import About from './components/About';
import ImageGallery from './components/ImageGallery';
import ServiceList from './components/ServiceList';
import ReviewsList from './components/ReviewsList';
import { 
    ProfileHeaderSkeleton,
    ContactInfoSkeleton,
    AboutSkeleton,
    ImageGallerySkeleton,
    ServiceListSkeleton,
    // ReviewsListSkeleton
} from './components/SkeletonLoader';
const BusinessPublicProfile = () => {
    const { id } = useParams();
    const [business, setBusiness] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        const fetchBusiness = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get(`/businesses/${id}`);
                
                if (response.data) {
                    console.log('Business data received:', response.data); // Debug log
                    setBusiness(response.data);
                } else {
                    throw new Error('No business data received');
                }
            } catch (err) {
                console.error('Error fetching business:', err);
                const errorMessage = err.response?.data?.message || err.message || 'Failed to load business information';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBusiness();
        } else {
            setError('Invalid business ID');
            setLoading(false);
        }
    }, [id, retryCount]);

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
    };

    if (loading) {
        return (
            <div className={styles.profileContainer}>
                <ProfileHeaderSkeleton />
                <ContactInfoSkeleton />
                <AboutSkeleton />
                <ImageGallerySkeleton />
                <ServiceListSkeleton />
                {/* <ReviewsListSkeleton /> */}
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.profileContainer}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2 className={styles.errorTitle}>Unable to Load Business</h2>
                    <p className={styles.errorMessage}>{error}</p>
                    <button 
                        className={styles.retryButton}
                        onClick={handleRetry}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Try Again'}
                    </button>
                </div>
            </div>
        );
    }

    if (!business) {
        return (
            <div className={styles.profileContainer}>
                <div className={styles.notFoundContainer}>
                    <div className={styles.notFoundIcon}>🔍</div>
                    <h2 className={styles.notFoundTitle}>Business Not Found</h2>
                    <p className={styles.notFoundMessage}>
                        The business you're looking for doesn't exist or has been removed.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <ProfileHeader business={business} />
            <ContactInfo business={business} />
            <About business={business} />
            <ImageGallery business={business} />
            <ServiceList businessId={id} />
            <ReviewsList businessId={id} />
        </div>
    );
};

export default BusinessPublicProfile;
