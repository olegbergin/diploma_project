import { usePullToRefresh } from '../hooks/usePullToRefresh';
import styles from './PullToRefresh.module.css';

export default function PullToRefresh({ onRefresh, children }) {
  const { isPulling, pullDistance, isRefreshing, pullProgress } = usePullToRefresh({
    onRefresh,
    threshold: 80
  });

  return (
    <div className={styles.container}>
      {/* Pull indicator */}
      <div 
        className={`${styles.pullIndicator} ${isPulling ? styles.visible : ''}`}
        style={{ transform: `translateY(${Math.min(pullDistance - 40, 40)}px)` }}
      >
        <div className={styles.indicatorContent}>
          {isRefreshing ? (
            <>
              <div className={styles.spinner}></div>
              <span className={styles.text}>מרענן...</span>
            </>
          ) : (
            <>
              <div 
                className={`${styles.arrow} ${pullProgress >= 1 ? styles.release : ''}`}
                style={{ transform: `rotate(${pullProgress * 180}deg)` }}
              >
                ↓
              </div>
              <span className={styles.text}>
                {pullProgress >= 1 ? 'שחרר לרענון' : 'משוך לרענון'}
              </span>
            </>
          )}
        </div>
        
        {/* Progress bar */}
        <div className={styles.progressBar}>
          <div 
            className={styles.progress} 
            style={{ width: `${pullProgress * 100}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div 
        className={styles.content}
        style={{ 
          transform: isPulling ? `translateY(${Math.min(pullDistance, 80)}px)` : 'none',
          transition: isPulling ? 'none' : 'transform 0.3s ease'
        }}
      >
        {children}
      </div>
    </div>
  );
}