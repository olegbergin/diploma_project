import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../../../api/axiosInstance';
import { useToastContext } from '../../../context/ToastContext';
import styles from './ServiceList.module.css';

const ServiceList = ({ businessId }) => {
    const navigate = useNavigate();
    const { showError } = useToastContext();
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const response = await axios.get(`/businesses/${businessId}/services`);
                setServices(response.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchServices();
    }, [businessId]);

    const handleBookService = (service) => {
        if (!service.serviceId || !businessId) {
            showError('לא ניתן להזמין שירות');
            return;
        }

        navigate(`/booking/${businessId}/${service.serviceId}`, {
            state: { service, businessId }
        });
    };

    // Loading State
    if (loading) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>שירותים</h2>
                <div className={styles.skeleton}>
                    <div className={styles.skeletonCard}></div>
                    <div className={styles.skeletonCard}></div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>שירותים</h2>
                <p className={`${styles.message} ${styles.error}`}>
                    שגיאה בטעינת שירותים: {error}
                </p>
            </div>
        );
    }

    // Empty State
    if (services.length === 0) {
        return (
            <div className={styles.container}>
                <h2 className={styles.title}>שירותים</h2>
                <p className={styles.message}>אין שירותים זמינים</p>
            </div>
        );
    }

    // Services List
    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Services</h2>
            <ul className={styles.grid}>
                {services.map(service => (
                    <li key={service.serviceId} className={styles.card}>
                        <h3 className={styles.name}>{service.name}</h3>

                        <p className={styles.description}>
                            {service.description || 'אין תיאור זמין'}
                        </p>

                        <div className={styles.footer}>
                            <span className={styles.duration}>
                                ⏱️ {service.duration || service.durationMinutes} דקות
                            </span>

                            <span className={styles.price}>
                                ₪{service.price}
                            </span>

                            <button
                                className={styles.button}
                                onClick={() => handleBookService(service)}
                            >
                                הזמן
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ServiceList;
