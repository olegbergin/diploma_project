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
                    setBusiness(response.data);
                } else {
                    throw new Error('No business data received');
                }
            } catch (err) {
                console.error('Error fetching business:', err);
                const errorMessage = err.response?.data?.message || err.message || 'נכשל בטעינת מידע העסק';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchBusiness();
        } else {
            setError('מזהה עסק לא תקין');
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
                <div className={styles.twoColumnLayout}>
                    <div className={styles.leftColumn}>
                        <ContactInfoSkeleton />
                        <AboutSkeleton />
                    </div>
                    <div className={styles.rightColumn}>
                        <ImageGallerySkeleton />
                        <ServiceListSkeleton />
                    </div>
                </div>
                {/* <ReviewsListSkeleton /> */}
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.profileContainer}>
                <div className={styles.errorContainer}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h2 className={styles.errorTitle}>לא ניתן לטעון את העסק</h2>
                    <p className={styles.errorMessage}>{error}</p>
                    <button 
                        className={styles.retryButton}
                        onClick={handleRetry}
                        disabled={loading}
                    >
                        {loading ? 'טוען...' : 'נסה שוב'}
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
                    <h2 className={styles.notFoundTitle}>העסק לא נמצא</h2>
                    <p className={styles.notFoundMessage}>
                        העסק שאתה מחפש לא קיים או הוסר.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.profileContainer}>
            <ProfileHeader business={business} />
            <div className={styles.twoColumnLayout}>
                <div className={styles.leftColumn}>
                    <ContactInfo business={business} />
                    <About business={business} />
                </div>
                <div className={styles.rightColumn}>
                    <ImageGallery business={business} />
                    <ServiceList businessId={id} />
                </div>
            </div>
            <ReviewsList businessId={id} />
        </div>
    );
};

export default BusinessPublicProfile;
