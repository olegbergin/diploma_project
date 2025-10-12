/**
 * ErrorMessage Component - Универсальный компонент для отображения ошибок
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string|Object} props.error - Текст ошибки или объект с ошибками
 * @param {string} props.type - Тип ошибки: 'error', 'warning', 'info'
 * @param {Function} props.onRetry - Callback функция для повторной попытки
 * @param {Function} props.onClose - Callback функция для закрытия ошибки
 * @param {string} props.className - Дополнительные CSS классы
 * @param {boolean} props.showIcon - Показывать ли иконку
 * @returns {JSX.Element} Error message component
 */

import React from 'react';
import styles from './ErrorMessage.module.css';

const ErrorMessage = ({ 
  error, 
  type = 'error', 
  onRetry, 
  onClose, 
  className = '', 
  showIcon = true 
}) => {
  if (!error) return null;

  // Определяем иконку по типу ошибки
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      case 'success':
        return '✅';
      default:
        return '❌';
    }
  };

  // Обрабатываем разные типы ошибок
  const renderErrorContent = () => {
    // Если ошибка - строка
    if (typeof error === 'string') {
      return <p className={styles.errorText}>{error}</p>;
    }

    // Если ошибка - объект с полями (валидация)
    if (typeof error === 'object' && error !== null) {
      return (
        <div className={styles.errorList}>
          {Object.entries(error).map(([field, message]) => (
            <div key={field} className={styles.errorItem}>
              <strong>{field}:</strong> {message}
            </div>
          ))}
        </div>
      );
    }

    return <p className={styles.errorText}>Произошла неизвестная ошибка</p>;
  };

  const errorClass = `${styles.errorContainer} ${styles[type]} ${className}`;

  return (
    <div className={errorClass} role="alert" aria-live="polite">
      <div className={styles.errorContent}>
        {showIcon && (
          <span className={styles.errorIcon} aria-hidden="true">
            {getIcon()}
          </span>
        )}
        <div className={styles.errorMessage}>
          {renderErrorContent()}
        </div>
      </div>
      
      {(onRetry || onClose) && (
        <div className={styles.errorActions}>
          {onRetry && (
            <button
              className={`${styles.actionBtn} ${styles.retryBtn}`}
              onClick={onRetry}
              aria-label="Повторить попытку"
            >
              🔄 Повторить
            </button>
          )}
          {onClose && (
            <button
              className={`${styles.actionBtn} ${styles.closeBtn}`}
              onClick={onClose}
              aria-label="Закрыть"
            >
              ✕
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorMessage;