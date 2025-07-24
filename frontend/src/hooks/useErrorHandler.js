/**
 * useErrorHandler Hook - Универсальный хук для обработки ошибок
 * 
 * Provides consistent error handling across the application
 * @returns {Object} Error handling utilities
 */

import { useState, useCallback } from 'react';

const useErrorHandler = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * Извлекает сообщение об ошибке из различных форматов
   * @param {*} error - Ошибка в любом формате
   * @returns {string|Object} Обработанное сообщение об ошибке
   */
  const extractErrorMessage = useCallback((error) => {
    // Если ошибка уже строка
    if (typeof error === 'string') {
      return error;
    }

    // Axios error с server response
    if (error?.response?.data) {
      const data = error.response.data;
      
      // Если есть поле errors (валидация)
      if (data.errors && typeof data.errors === 'object') {
        return data.errors;
      }
      
      // Если есть поле error
      if (data.error) {
        return data.error;
      }
      
      // Если есть поле message
      if (data.message) {
        return data.message;
      }
    }

    // Обычная Error instance
    if (error?.message) {
      return error.message;
    }

    // Network errors
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      return 'Ошибка подключения к серверу. Проверьте интернет-соединение / Network connection error';
    }

    // Timeout errors
    if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
      return 'Превышено время ожидания. Попробуйте позже / Request timeout';
    }

    // HTTP status codes
    if (error?.response?.status) {
      switch (error.response.status) {
        case 400:
          return 'Неверные данные запроса / Bad request';
        case 401:
          return 'Необходима авторизация / Unauthorized';
        case 403:
          return 'Доступ запрещен / Forbidden';
        case 404:
          return 'Ресурс не найден / Not found';
        case 409:
          return 'Конфликт данных / Conflict';
        case 422:
          return 'Ошибка валидации данных / Validation error';
        case 429:
          return 'Слишком много запросов. Попробуйте позже / Too many requests';
        case 500:
          return 'Внутренняя ошибка сервера / Internal server error';
        case 502:
          return 'Сервер недоступен / Bad gateway';
        case 503:
          return 'Сервис временно недоступен / Service unavailable';
        default:
          return `Ошибка сервера (${error.response.status}) / Server error`;
      }
    }

    // Default fallback
    return 'Произошла неизвестная ошибка / Unknown error occurred';
  }, []);

  /**
   * Обрабатывает ошибку и устанавливает состояние
   * @param {*} error - Ошибка для обработки
   */
  const handleError = useCallback((error) => {
    console.error('Error caught by useErrorHandler:', error);
    const processedError = extractErrorMessage(error);
    setError(processedError);
    setIsLoading(false);
  }, [extractErrorMessage]);

  /**
   * Очищает ошибку
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Wrapper для async операций с автоматической обработкой ошибок
   * @param {Function} asyncFunction - Async функция для выполнения
   * @param {Object} options - Опции выполнения
   * @returns {Promise} Результат выполнения функции
   */
  const executeWithErrorHandling = useCallback(async (asyncFunction, options = {}) => {
    const { 
      showLoading = true, 
      clearPreviousError = true,
      onSuccess,
      onError
    } = options;

    try {
      if (clearPreviousError) {
        setError(null);
      }
      
      if (showLoading) {
        setIsLoading(true);
      }

      const result = await asyncFunction();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      handleError(error);
      
      if (onError) {
        onError(error);
      }
      
      throw error; // Re-throw чтобы calling code мог обработать если нужно
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [handleError]);

  /**
   * Wrapper для API вызовов с retry механизмом
   * @param {Function} apiCall - API функция
   * @param {Object} options - Опции retry
   * @returns {Promise} Результат API вызова
   */
  const executeWithRetry = useCallback(async (apiCall, options = {}) => {
    const { 
      maxRetries = 3, 
      retryDelay = 1000,
      retryCondition = (error) => error?.response?.status >= 500
    } = options;

    let lastError;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await executeWithErrorHandling(apiCall, {
          showLoading: attempt === 0, // Показываем loading только для первой попытки
          clearPreviousError: attempt === 0
        });
      } catch (error) {
        lastError = error;
        
        // Если это последняя попытка или ошибка не подходит для retry
        if (attempt === maxRetries || !retryCondition(error)) {
          throw error;
        }
        
        // Ждем перед следующей попыткой
        await new Promise(resolve => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
      }
    }
    
    throw lastError;
  }, [executeWithErrorHandling]);

  /**
   * Проверяет является ли ошибка критической (требует перезагрузки страницы)
   * @param {*} error - Ошибка для проверки
   * @returns {boolean} True если ошибка критическая
   */
  const isCriticalError = useCallback((error) => {
    const status = error?.response?.status;
    return status === 500 || status === 502 || status === 503;
  }, []);

  /**
   * Проверяет требует ли ошибка повторной авторизации
   * @param {*} error - Ошибка для проверки
   * @returns {boolean} True если нужна повторная авторизация
   */
  const requiresReauth = useCallback((error) => {
    const status = error?.response?.status;
    return status === 401 || status === 403;
  }, []);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeWithErrorHandling,
    executeWithRetry,
    extractErrorMessage,
    isCriticalError,
    requiresReauth,
    
    // Utility methods
    hasError: !!error,
    isNetworkError: error?.code === 'NETWORK_ERROR',
    isValidationError: typeof error === 'object' && error !== null && !Array.isArray(error)
  };
};

export default useErrorHandler;