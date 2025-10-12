import React from 'react';
import styles from './ContactInfo.module.css';

const ContactInfo = ({ business }) => {
    const handleCall = () => {
        if (business.phone) {
            window.location.href = `tel:${business.phone}`;
        }
    };

    const formatPhoneNumber = (phone) => {
        if (!phone) return 'Not provided';
        // Basic phone formatting
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length === 10) {
            return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
        }
        return phone;
    };

    return (
        <div className={styles.contactContainer}>
            <h3 className={styles.sectionTitle}>Contact Information</h3>
            
            <div className={styles.contactItem}>
                <strong>Address:</strong>
                <span>{business.address || 'Address not provided'}</span>
                {business.address && (
                    <a 
                        href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.mapLink}
                    >
                        📍 View on Map
                    </a>
                )}
            </div>

            <div className={styles.contactItem}>
                <strong>Phone:</strong>
                <span 
                    className={business.phone ? styles.clickablePhone : ''}
                    onClick={business.phone ? handleCall : undefined}
                >
                    {formatPhoneNumber(business.phone)}
                </span>
                {business.phone && (
                    <span className={styles.phoneHint}>📞 Tap to call</span>
                )}
            </div>

            <div className={styles.contactItem}>
                <strong>Email:</strong>
                {business.email ? (
                    <a 
                        href={`mailto:${business.email}`}
                        className={styles.websiteLink}
                    >
                        {business.email} ✉️
                    </a>
                ) : (
                    <span>Not provided</span>
                )}
            </div>

        </div>
    );
};

export default ContactInfo;
