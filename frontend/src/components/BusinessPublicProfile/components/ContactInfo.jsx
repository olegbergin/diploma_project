import React, { useMemo } from 'react';
import styles from './ContactInfo.module.css';
import { parseSchedule, formatScheduleForDisplay, getCurrentStatus } from '../../../utils/scheduleUtils';

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

    // Parse and format working hours (column name is 'schedule' in database)
    const { schedule, formattedSchedule, status } = useMemo(() => {
        const parsedSchedule = parseSchedule(business.schedule);
        const formatted = formatScheduleForDisplay(parsedSchedule);
        const currentStatus = getCurrentStatus(parsedSchedule);

        return {
            schedule: parsedSchedule,
            formattedSchedule: formatted,
            status: currentStatus
        };
    }, [business.schedule]);

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

            {/* Working Hours Section */}
            <div className={styles.hoursSection}>
                <h3 className={styles.sectionTitle}>שעות פעילות</h3>

                {/* Current Status Badge */}
                <div className={`${styles.statusBadge} ${status.isOpen ? styles.open : styles.closed}`}>
                    <span className={styles.statusDot}></span>
                    {status.isOpen ? (
                        <span>פתוח עכשיו</span>
                    ) : (
                        <span>סגור</span>
                    )}
                </div>

                {/* Next opening info if closed */}
                {!status.isOpen && status.nextOpenDay && (
                    <div className={styles.nextOpenInfo}>
                        פתיחה הבאה: {status.nextOpenDay}
                    </div>
                )}

                {/* Weekly Schedule */}
                <div className={styles.scheduleList}>
                    {formattedSchedule.map(({ day, hebrewName, isOpen, hours }) => (
                        <div key={day} className={styles.scheduleDay}>
                            <span className={styles.dayName}>{hebrewName}</span>
                            <span className={`${styles.dayHours} ${!isOpen ? styles.dayHoursClosed : ''}`}>
                                {hours}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ContactInfo;
