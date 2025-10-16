import { useEffect, useRef, useState } from 'react';

export function useSwipeGestures({ onSwipeLeft, onSwipeRight, threshold = 50 }) {
  const elementRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof document === 'undefined') {
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    let touchStartX = 0;
    let touchStartY = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      setStartX(touchStartX);
      setStartY(touchStartY);
      setIsDragging(true);
    };

    const handleTouchMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.touches[0].clientX;
      const diffX = touchStartX - currentX;
      const diffY = Math.abs(touchStartY - e.touches[0].clientY);

      // Prevent scrolling if horizontal swipe is detected
      if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e) => {
      if (!isDragging) return;
      
      const touchEndX = e.changedTouches[0].clientX;
      const touchEndY = e.changedTouches[0].clientY;
      const diffX = startX - touchEndX;
      const diffY = Math.abs(startY - touchEndY);

      setIsDragging(false);

      // Only trigger if horizontal movement is greater than vertical
      if (Math.abs(diffX) > diffY && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    };

    const handleMouseDown = (e) => {
      touchStartX = e.clientX;
      touchStartY = e.clientY;
      setStartX(touchStartX);
      setStartY(touchStartY);
      setIsDragging(true);
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const currentX = e.clientX;
      const diffX = touchStartX - currentX;
      const diffY = Math.abs(touchStartY - e.clientY);

      if (Math.abs(diffX) > diffY && Math.abs(diffX) > 10) {
        e.preventDefault();
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      
      const mouseEndX = e.clientX;
      const mouseEndY = e.clientY;
      const diffX = startX - mouseEndX;
      const diffY = Math.abs(startY - mouseEndY);

      setIsDragging(false);

      if (Math.abs(diffX) > diffY && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }
    };

    // Touch events
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd);

    // Mouse events for desktop testing
    element.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [onSwipeLeft, onSwipeRight, threshold, startX, startY, isDragging]);

  return elementRef;
}