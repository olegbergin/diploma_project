// src/components/HomePage/HomePage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import BusinessCard from '../BusinessCard/BusinessCard.jsx';
import styles from './HomePage.module.css';
// It's good practice to have a dedicated config file or use environment variables for API endpoints
const API_SEARCH_URL = import.meta.env.VITE_API_SEARCH_URL || 'http://localhost:3000/api/search';

// A simple debounce utility function
// This prevents the API from being called on every keystroke
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    // If there's an existing timeout, clear it
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    // Set a new timeout to execute the function after the delay
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function HomePage() {
  // --- State Management ---
  // Stores the list of businesses fetched from the API
  const [businesses, setBusinesses] = useState([]);
  // Tracks if data is currently being fetched
  const [isLoading, setIsLoading] = useState(true);
  // Stores any error object or message if an API call fails
  const [error, setError] = useState(null);

  // --- Filter States ---
  // Holds the current value of the search input field
  const [searchTerm, setSearchTerm] = useState('');
  // Holds the selected category for filtering (example)
  const [selectedCategory, setSelectedCategory] = useState('');
  // Holds the current minimum rating filter (example)
  const [minRating, setMinRating] = useState(0); // 0 means no rating filter

  // --- Pagination States (Example - to be expanded) ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Could be configurable
  const [totalItems, setTotalItems] = useState(0); // To calculate total pages

  // --- API Call Function ---
  // useCallback is used to memoize the function, preventing unnecessary re-creations
  // if its dependencies (API_SEARCH_URL, itemsPerPage) haven't changed.
  // This is particularly useful if fetchBusinesses is passed down to child components.
  const fetchBusinesses = useCallback(async (searchQuery = searchTerm, category = selectedCategory, rating = minRating, page = currentPage) => {
    setIsLoading(true);
    setError(null);

    const queryParams = new URLSearchParams({
      limit: itemsPerPage.toString(),
      offset: ((page - 1) * itemsPerPage).toString(),
    });

    if (searchQuery) queryParams.set('searchTerm', searchQuery);
    if (category) queryParams.set('category', category);
    if (rating > 0) queryParams.set('min_rating', rating.toString());

    try {
      const response = await fetch(`${API_SEARCH_URL}/businesses?${queryParams.toString()}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown server error" }));
        throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
      }
      const data = await response.json(); // data is now { results: [...], total: ... }

      setBusinesses(data.results || []); // Use data.results
      setTotalItems(data.total || 0);   // Use data.total

    } catch (err) {
      console.error("Failed to fetch businesses:", err);
      setError(err.message);
      setBusinesses([]);
      setTotalItems(0); // Reset total on error
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedCategory, minRating, currentPage, itemsPerPage]);

  // --- Debounced Search ---
  // We create a debounced version of fetchBusinesses specifically for the search input.
  // This ensures that fetchBusinesses is not called on every keystroke, but only
  // after the user has paused typing for 500ms.
  // useCallback ensures the debounced function is not recreated on every render unless fetchBusinesses changes.
  const debouncedFetchBusinesses = useCallback(debounce((currentSearchTerm) => {
    // When debounced function fires, it uses the latest filter values from state
    // but the triggering search term comes from its argument.
    // Reset to page 1 when search term changes.
    setCurrentPage(1);
    fetchBusinesses(currentSearchTerm, selectedCategory, minRating, 1);
  }, 500), [selectedCategory, minRating, fetchBusinesses]); // fetchBusinesses is a dep

  // --- Effects ---
  // useEffect to fetch businesses when the component mounts or when critical filter/pagination states change.
  // The initial fetch is handled here. Subsequent fetches due to direct filter changes (not searchTerm)
  // can also trigger this if those dependencies are included.
  useEffect(() => {
    // Don't run the initial fetch if searchTerm is being handled by debouncing
    // (i.e., if searchTerm is not empty, it means the user is typing or has typed).
    // The debounced function will handle the fetch.
    // This initial fetch is for component mount or when filters like category/rating change directly.
    // Or, if you want searchTerm to trigger an immediate fetch on mount if pre-filled, adjust logic.
    fetchBusinesses(searchTerm, selectedCategory, minRating, currentPage);
  }, [selectedCategory, minRating, currentPage, fetchBusinesses]); // `searchTerm` is intentionally omitted here to let debounce handle it. `fetchBusinesses` is stable due to useCallback.


  // --- Event Handlers ---
  const handleSearchInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm); // Update the state immediately for a responsive input field
    debouncedFetchBusinesses(newSearchTerm); // Call the debounced fetch function
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1); // Reset to page 1 when category changes
    // fetchBusinesses will be triggered by the useEffect due to selectedCategory change
  };

  const handleRatingChange = (event) => {
    setMinRating(Number(event.target.value));
    setCurrentPage(1); // Reset to page 1 when rating changes
    // fetchBusinesses will be triggered by the useEffect due to minRating change
  };

  const handleFormSubmit = (event) => {
    event.preventDefault(); // Prevent default form submission which causes a page reload
    // Clearing timeout for debouncedFetch is important if user submits form manually
    // and there was a pending debounced call.
    // (Although with current setup, debouncedFetchBusinesses fires with latest searchTerm anyway)
    setCurrentPage(1);
    fetchBusinesses(searchTerm, selectedCategory, minRating, 1); // Trigger an immediate search
  };

  // Placeholder for pagination controls
  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className={styles.pagination}>
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
          קודם {/* Previous */}
        </button>
        <span>עמוד {currentPage} מתוך {totalPages}</span> {/* Page X of Y */}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
          הבא {/* Next */}
        </button>
      </div>
    );
  };

  // --- Render Logic ---
  return (
    <div className={styles.homePageContainer}>
      <header className={styles.header}>
        {/* Consistent title style from your designs */}
        <h1 className={styles.pageTitle}>גלה עסקים</h1> {/* Discover Businesses */}

        {/* Search and Filter Form */}
        <form onSubmit={handleFormSubmit} className={styles.filterForm}>
          <div className={styles.searchInputContainer}>
            <input
              type="text"
              placeholder="חפש שם עסק, שירות..." // Search business name, service...
              value={searchTerm}
              onChange={handleSearchInputChange}
              className={styles.searchInput}
              aria-label="Search businesses" // Accessibility: label for screen readers
            />
            {/* Optionally, add a search icon button if the form submit button is elsewhere or less obvious */}
          </div>

          <div className={styles.filterControls}>
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles.filterSelect}
              aria-label="Select category"
            >
              <option value="">כל הקטגוריות</option> {/* All Categories */}
              <option value="מספרה">מספרות</option> {/* Hair Salons */}
              <option value="מסעדה">מסעדות</option> {/* Restaurants */}
              <option value="סלון יופי">סלוני יופי</option> {/* Beauty Salons */}
              {/* Add more categories as needed */}
            </select>

            <select
              value={minRating}
              onChange={handleRatingChange}
              className={styles.filterSelect}
              aria-label="Select minimum rating"
            >
              <option value="0">כל הדירוגים</option> {/* All Ratings */}
              <option value="1">★☆☆☆☆+</option>
              <option value="2">★★☆☆☆+</option>
              <option value="3">★★★☆☆+</option>
              <option value="4">★★★★☆+</option>
              <option value="5">★★★★★</option>
            </select>
          </div>
          {/* The form submission can be triggered by pressing Enter in the input field
              or by a dedicated submit button if you add one.
              <button type="submit" className={styles.searchButton}>חפש</button> */}
        </form>
      </header>

      {/* Conditional Rendering for Loading, Error, and Content */}
      {isLoading && <div className={styles.loadingIndicator}>טוען עסקים...</div>} {/* Loading businesses... */}

      {!isLoading && error && (
        <div className={styles.errorMessage}>
          <p>אופס! משהו השתבש:</p> {/* Oops! Something went wrong: */}
          <p>{error}</p>
          <button onClick={() => fetchBusinesses(searchTerm, selectedCategory, minRating, currentPage)} className={styles.retryButton}>
            נסה שוב {/* Try Again */}
          </button>
        </div>
      )}

      {!isLoading && !error && businesses.length === 0 && (
        <p className={styles.noResultsMessage}>לא נמצאו עסקים התואמים את חיפושך.</p> // No businesses found matching your search.
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