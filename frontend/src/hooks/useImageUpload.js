import { useState, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export const useImageUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    if (!file) {
      throw new Error('לא נבחר קובץ / No file selected');
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new Error('קובץ גדול מדי, מקסימום 5MB / File too large, maximum 5MB');
    }

    if (!ALLOWED_TYPES.includes(file.mimetype || file.type)) {
      throw new Error('סוג קובץ לא נתמך. רק JPG, PNG, GIF ו-WebP מותרים / Unsupported file type. Only JPG, PNG, GIF and WebP allowed');
    }

    return true;
  }, []);

  const uploadSingle = useCallback(async (file) => {
    try {
      setIsUploading(true);
      setError(null);
      setUploadProgress(0);

      validateFile(file);

      const formData = new FormData();
      formData.append('image', file);

      const response = await axiosInstance.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploadProgress(100);
      return {
        id: Date.now() + Math.random(),
        url: response.data.url,
        filename: response.data.filename,
        size: response.data.size
      };

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'העלאה נכשלה / Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateFile]);

  const uploadMultiple = useCallback(async (files) => {
    try {
      setIsUploading(true);
      setError(null);

      const fileArray = Array.from(files);
      
      // Validate all files first
      fileArray.forEach(validateFile);

      const uploadPromises = fileArray.map(async (file, index) => {
        const formData = new FormData();
        formData.append('image', file);
        
        const response = await axiosInstance.post('/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            // Update progress for multiple files (average)
            const totalProgress = ((index * 100) + percentCompleted) / fileArray.length;
            setUploadProgress(Math.round(totalProgress));
          },
        });
        
        return {
          id: Date.now() + Math.random() + index,
          url: response.data.url,
          filename: response.data.filename,
          size: response.data.size
        };
      });

      const uploadedImages = await Promise.all(uploadPromises);
      setUploadProgress(100);
      return uploadedImages;

    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || 'העלאה נכשלה / Upload failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [validateFile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress(0);
  }, []);

  return {
    isUploading,
    uploadProgress,
    error,
    uploadSingle,
    uploadMultiple,
    clearError,
    resetProgress,
    validateFile
  };
};

export default useImageUpload;