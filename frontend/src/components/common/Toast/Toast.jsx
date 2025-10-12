import React, { useState, useEffect, useCallback } from 'react';
import styles from './Toast.module.css';

export const useToast = () => {
    const [toasts, setToasts] = useState([]);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'success', duration = 3000) => {
        const id = Date.now() + Math.random();
        const toast = { id, message, type, duration };
        
        setToasts(prev => [...prev, toast]);
        
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, [removeToast]);

    const showSuccess = useCallback((message, duration) => showToast(message, 'success', duration), [showToast]);
    const showError = useCallback((message, duration) => showToast(message, 'error', duration), [showToast]);
    const showWarning = useCallback((message, duration) => showToast(message, 'warning', duration), [showToast]);
    const showInfo = useCallback((message, duration) => showToast(message, 'info', duration), [showToast]);

    return {
        toasts,
        showToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        removeToast
    };
};

const Toast = ({ toast, onRemove }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onRemove(toast.id);
        }, toast.duration || 3000);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onRemove]);

    return (
        <div className={`${styles.toast} ${styles[toast.type]}`}>
            <div className={styles.content}>
                <span className={styles.icon}>
                    {toast.type === 'success' && '✓'}
                    {toast.type === 'error' && '✗'}
                    {toast.type === 'warning' && '⚠'}
                    {toast.type === 'info' && 'ℹ'}
                </span>
                <span className={styles.message}>{toast.message}</span>
            </div>
            <button 
                className={styles.closeButton}
                onClick={() => onRemove(toast.id)}
                aria-label="Close notification"
            >
                ×
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, onRemove }) => {
    if (!toasts.length) return null;

    return (
        <div className={styles.toastContainer}>
            {toasts.map(toast => (
                <Toast 
                    key={toast.id} 
                    toast={toast} 
                    onRemove={onRemove} 
                />
            ))}
        </div>
    );
};

export default Toast;