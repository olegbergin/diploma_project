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
        // Check if we have valid service data
        if (!service.serviceId || !businessId) {
            showError('Unable to book service: Invalid service information');
            return;
        }

        // Navigate to booking page with service and business IDs
        navigate(`/booking/${businessId}/${service.serviceId}`, {
            state: { 
                service: service,
                businessId: businessId
            }
        });
    };

    if (loading) {
        return <div>Loading services...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={styles.serviceListContainer}>
            <h2>Services</h2>
            {services.length > 0 ? (
                <ul className={styles.serviceList}>
                    {services.map(service => (
                        <li key={service.serviceId} className={styles.serviceItem}>
                            <div className={styles.serviceInfo}>
                                <h3>{service.name}</h3>
                                <p>{service.description || 'No description available'}</p>
                                <p className={styles.serviceDetails}>
                                    <span className={styles.price}>${service.price}</span>
                                    <span className={styles.duration}>{service.duration || service.durationMinutes} mins</span>
                                </p>
                            </div>
                            <button 
                                className={styles.bookButton}
                                onClick={() => handleBookService(service)}
                            >
                                📅 Book Now
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No services found for this business.</p>
            )}
        </div>
    );
};

export default ServiceList;
