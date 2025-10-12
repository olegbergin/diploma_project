import { useState, useRef, useEffect } from 'react';
import styles from './LazyImage.module.css';

export default function LazyImage({ 
  src, 
  alt, 
  className = '', 
  placeholder = '/images/placeholder_business.png',
  ...props 
}) {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isInView && src && src !== placeholder) {
      const img = new Image();
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
      };
      img.onerror = () => {
        setImageSrc(placeholder);
        setIsLoaded(true);
      };
      img.src = src;
    }
  }, [isInView, src, placeholder]);

  return (
    <div className={`${styles.imageContainer} ${className}`} ref={imgRef}>
      <img
        src={imageSrc}
        alt={alt}
        className={`${styles.image} ${isLoaded ? styles.loaded : styles.loading}`}
        {...props}
      />
      {!isLoaded && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingSpinner}></div>
        </div>
      )}
    </div>
  );
}