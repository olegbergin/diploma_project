/**
 * LoadingSpinner Component - Универсальный компонент для индикации загрузки
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.size - Размер спиннера: 'small', 'medium', 'large'
 * @param {string} props.color - Цвет спиннера: 'primary', 'secondary', 'white'
 * @param {boolean} props.overlay - Показывать ли полноэкранный оверлей
 * @param {string} props.message - Текст сообщения под спиннером
 * @param {string} props.className - Дополнительные CSS классы
 * @returns {JSX.Element} Loading spinner component
 */

import React from 'react';
import styles from './LoadingSpinner.module.css';

const LoadingSpinner = ({ 
  size = 'medium', 
  color = 'primary', 
  overlay = false, 
  message = '', 
  className = '' 
}) => {
  const spinnerClass = `${styles.spinner} ${styles[size]} ${styles[color]} ${className}`;

  const spinner = (
    <div className={spinnerClass} role="status" aria-label="טוען">
      <div className={styles.spinnerCircle}></div>
    </div>
  );

  if (overlay) {
    return (
      <div className={styles.overlay} aria-busy="true">
        <div className={styles.overlayContent}>
          {spinner}
          {message && <p className={styles.message}>{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {spinner}
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};

export default LoadingSpinner;