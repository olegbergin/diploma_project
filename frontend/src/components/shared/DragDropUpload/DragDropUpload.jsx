import React, { useState, useCallback, useRef } from 'react';
import useImageUpload from '../../../hooks/useImageUpload';
import styles from './DragDropUpload.module.css';

const DragDropUpload = ({ 
  onUploadComplete, 
  multiple = true, 
  className = '',
  disabled = false,
  children 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef(null);
  
  const { 
    isUploading, 
    uploadProgress, 
    error, 
    uploadSingle, 
    uploadMultiple, 
    clearError,
    validateFile 
  } = useImageUpload();

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setDragCounter(prev => {
      const newCounter = prev - 1;
      if (newCounter === 0) {
        setIsDragOver(false);
      }
      return newCounter;
    });
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsDragOver(false);
    setDragCounter(0);
    
    if (disabled || isUploading) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) {
      return;
    }

    try {
      clearError();
      let uploadedImages;
      
      if (multiple) {
        uploadedImages = await uploadMultiple(imageFiles);
      } else {
        const uploadedImage = await uploadSingle(imageFiles[0]);
        uploadedImages = [uploadedImage];
      }
      
      onUploadComplete?.(uploadedImages);
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [disabled, isUploading, multiple, uploadSingle, uploadMultiple, clearError, onUploadComplete]);

  const handleFileInputChange = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    try {
      clearError();
      let uploadedImages;
      
      if (multiple) {
        uploadedImages = await uploadMultiple(files);
      } else {
        const uploadedImage = await uploadSingle(files[0]);
        uploadedImages = [uploadedImage];
      }
      
      onUploadComplete?.(uploadedImages);
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }, [multiple, uploadSingle, uploadMultiple, clearError, onUploadComplete]);

  const handleClick = useCallback(() => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  }, [disabled, isUploading]);

  const dropzoneClasses = [
    styles.dropzone,
    className,
    isDragOver ? styles.dragOver : '',
    disabled ? styles.disabled : '',
    isUploading ? styles.uploading : ''
  ].filter(Boolean).join(' ');

  return (
    <div
      className={dropzoneClasses}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={multiple ? "גרור קבצים כאן או לחץ לבחירה" : "גרור קובץ כאן או לחץ לבחירה"}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
        disabled={disabled || isUploading}
      />
      
      {error && (
        <div className={styles.error}>
          {error}
          <button onClick={clearError} className={styles.closeError}>×</button>
        </div>
      )}
      
      {isUploading && (
        <div className={styles.uploadProgress}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <span className={styles.progressText}>מעלה: {uploadProgress}%</span>
        </div>
      )}
      
      {children ? (
        children
      ) : (
        <div className={styles.defaultContent}>
          <div className={styles.icon}>
            {isUploading ? '⏳' : isDragOver ? '📂' : '📁'}
          </div>
          <div className={styles.text}>
            {isUploading 
              ? 'מעלה קבצים...' 
              : isDragOver 
                ? 'שחרר כאן' 
                : multiple 
                  ? 'גרור תמונות כאן או לחץ לבחירה'
                  : 'גרור תמונה כאן או לחץ לבחירה'
            }
          </div>
          <div className={styles.hint}>
            תמונות בפורמט JPG, PNG, GIF או WebP עד 5MB
          </div>
        </div>
      )}
    </div>
  );
};

export default DragDropUpload;