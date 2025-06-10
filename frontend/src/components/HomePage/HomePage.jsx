// src/components/HomePage/HomePage.jsx

// --- Imports ---
import React, { useState, useEffect, useCallback } from 'react';
import BusinessCard from '../BusinessCard/BusinessCard.jsx';
import styles from './HomePage.module.css';
// --- ИЗМЕНЕНИЕ 1: Импортируем наш инстанс axios ---
import axiosInstance from '../../api/axiosInstance.js'; // Adjust path if needed

// Debounce utility function (остается без изменений)
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

/**
 * HomePage component to display and filter businesses.
 */
function HomePage({ user }) { // Assuming user is passed as a prop
  // --- State Hooks (без изменений) ---
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // --- API Call Function (РЕФАКТОРИНГ ЗДЕСЬ) ---
  // useCallback memoizes the function to prevent re-creation on every render.
  const fetchBusinesses = useCallback(async (page = 1, currentFilters) => {
    setIsLoading(true);
    setError(null);

    // Construct the parameters object for axios
    const params = {
      limit: itemsPerPage,
      offset: (page - 1) * itemsPerPage,
      // Use values from the passed filters object or current state
      searchTerm: currentFilters?.searchTerm ?? searchTerm,
      category: currentFilters?.category ?? selectedCategory,
      min_rating: currentFilters?.minRating ?? minRating,
    };

    // Clean up params: remove any keys with empty or zero values (except for pagination)
    if (!params.searchTerm) delete params.searchTerm;
    if (!params.category) delete params.category;
    if (!params.min_rating) delete params.min_rating;

    try {
      // --- ИЗМЕНЕНИЕ 2: Используем axios.get ---
      // The endpoint is relative to our baseURL in axiosInstance.
      // Axios handles query string creation from the 'params' object.
      const response = await axiosInstance.get('/search/businesses', { params });

      // Data is directly in response.data, which should be { results: [...], total: ... }
      setBusinesses(response.data.results || []);
      setTotalItems(response.data.total || 0);

    } catch (err) {
      // --- ИЗМЕНЕНИЕ 3: Улучшенная обработка ошибок ---
      console.error("Failed to fetch businesses:", err);
      let errorMessage = "Could not load businesses. Please try again.";
      if (err.response && err.response.data && err.response.data.error) {
        errorMessage = err.response.data.error;
      }
      setError(errorMessage);
      setBusinesses([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, [itemsPerPage, searchTerm, selectedCategory, minRating]); // Dependencies for useCallback

  // --- Debounced Search ---
  // The debounce logic itself doesn't change.
  const debouncedFetch = useCallback(debounce((newSearchTerm) => {
    // When the debounced function fires, we call fetchBusinesses
    // with the new search term and reset to page 1.
    setCurrentPage(1);
    fetchBusinesses(1, { searchTerm: newSearchTerm });
  }, 500), [fetchBusinesses]); // It depends on the memoized fetchBusinesses function.


  // --- Effects ---
  // This useEffect is now much simpler. It runs when filters (other than search) or page change.
  useEffect(() => {
    // We call fetchBusinesses with the current page.
    // The function will use the latest state values for filters due to its dependencies.
    fetchBusinesses(currentPage);
  }, [selectedCategory, minRating, currentPage, fetchBusinesses]);
  // `searchTerm` is intentionally omitted, as it's handled by the debounced function.


  // --- Event Handlers ---
  const handleSearchInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedFetch(newSearchTerm);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to page 1
  };

  const handleRatingChange = (event) => {
    setMinRating(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1
  };

  // This handler is now only for explicit form submission (e.g., pressing Enter)
  // It cancels any pending debounced call and fetches immediately.
  const handleFormSubmit = (event) => {
    event.preventDefault();
    // Since debouncedFetch has its own internal timer, we can't easily cancel it from here.
    // But we can just trigger an immediate fetch.
    fetchBusinesses(1, { searchTerm });
  };


  // --- Render Functions (без изменений) ---
  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>קודם</button>
        <span>עמוד {currentPage} מתוך {totalPages}</span>
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>הבא</button>
      </div>
    );
  };

  // --- Main Render (без изменений в JSX) ---
  return (
    <div className={styles.homePageContainer}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>גלה עסקים</h1>
        <form onSubmit={handleFormSubmit} className={styles.filterForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="חפש שם עסק, שירות..."
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
              aria-label="Search businesses"
            />
          </div>
          <div className={styles.filterControls}>
            <select value={selectedCategory} onChange={handleCategoryChange} className={styles.filterSelect} aria-label="Select category">
              <option value="">כל הקטגוריות</option>
              <option value="מספרה">מספרות</option>
              <option value="מסעדה">מסעדות</option>
              <option value="סלון יופי">סלוני יופי</option>
            </select>
            <select value={minRating} onChange={handleRatingChange} className={styles.filterSelect} aria-label="Select minimum rating">
              <option value="0">כל הדירוגים</option>
              <option value="1">★☆☆☆☆+</option>
              <option value="2">★★☆☆☆+</option>
              <option value="3">★★★☆☆+</option>
              <option value="4">★★★★☆+</option>
              <option value="5">★★★★★</option>
            </select>
          </div>
        </form>
      </header>

      {isLoading && <div className={styles.loadingIndicator}>טוען עסקים...</div>}
      {!isLoading && error && (
        <div className={styles.errorMessage}>
          <p>אופס! משהו השתבש:</p>
          <p>{error}</p>
          <button onClick={() => fetchBusinesses(currentPage)} className={styles.retryButton}>נסה שוב</button>
        </div>
      )}
      {!isLoading && !error && businesses.length === 0 && (
        <p className={styles.noResultsMessage}>לא נמצאו עסקים התואמים את חיפושך.</p>
      )}
      {!isLoading && !error && businesses.length > 0 && (
        <main className={styles.businessesGrid}>
          {businesses.map(business => (
            <BusinessCard key={business.business_id} business={business} />
          ))}
        </main>
      )}
      {!isLoading && !error && businesses.length > 0 && renderPagination()}
    </div>
  );
}

export default HomePage;