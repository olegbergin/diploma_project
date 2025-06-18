// src/components/HomePage/HomePage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import BusinessCard from "../BusinessCard/BusinessCard.jsx";
import BusinessPublicProfile from "../BusinessPublicProfile/BusinessPublicProfile.jsx";
import styles from "./HomePage.module.css";
import axiosInstance from "../../api/axiosInstance.js";

// Debounce utility function
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

function HomePage({ user }) {
  const navigate = useNavigate();

  // --- State Hooks ---
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // --- API Call Function ---
  const fetchBusinesses = useCallback(
    async (page = 1, currentFilters) => {
      setIsLoading(true);
      setError(null);
      const params = {
        limit: itemsPerPage,
        offset: (page - 1) * itemsPerPage,
        searchTerm: currentFilters?.searchTerm ?? searchTerm,
        category: currentFilters?.category ?? selectedCategory,
        min_rating: currentFilters?.minRating ?? minRating,
      };
      if (!params.searchTerm) delete params.searchTerm;
      if (!params.category) delete params.category;
      if (!params.min_rating) delete params.min_rating;

      try {
        const response = await axiosInstance.get("/search/businesses", {
          params,
        });
        setBusinesses(response.data.results || []);
        setTotalItems(response.data.total || 0);
      } catch (err) {
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
    },
    [itemsPerPage, searchTerm, selectedCategory, minRating]
  );

  // Debounced Search
  const debouncedFetch = useCallback(
    debounce((newSearchTerm) => {
      setCurrentPage(1);
      fetchBusinesses(1, { searchTerm: newSearchTerm });
    }, 500),
    [fetchBusinesses]
  );

  // Effects
  useEffect(() => {
    fetchBusinesses(currentPage);
  }, [selectedCategory, minRating, currentPage, fetchBusinesses]);

  // --- Event Handlers ---
  const handleSearchInputChange = (event) => {
    const newSearchTerm = event.target.value;
    setSearchTerm(newSearchTerm);
    debouncedFetch(newSearchTerm);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  };

  const handleRatingChange = (event) => {
    setMinRating(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    fetchBusinesses(1, { searchTerm });
  };

  // When clicking a card, navigate to /profile/home/business/:id
  const handleBusinessCardClick = (business_id) => {
    navigate(`business/${business_id}`);
  };

  // --- Pagination ---
  const renderPagination = () => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;
    return (
      <div className={styles.pagination}>
        <button
          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          disabled={currentPage === 1}
        >
          קודם
        </button>
        <span>
          עמוד {currentPage} מתוך {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
          disabled={currentPage === totalPages}
        >
          הבא
        </button>
      </div>
    );
  };

  // --- Default Home Page (businesses grid) ---
  const DefaultHomeContent = () => (
    <>
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
            <select
              value={selectedCategory}
              onChange={handleCategoryChange}
              className={styles.filterSelect}
              aria-label="Select category"
            >
              <option value="">כל הקטגוריות</option>
              <option value="מספרה">מספרות</option>
              <option value="מסעדה">מסעדות</option>
              <option value="סלון יופי">סלוני יופי</option>
            </select>
            <select
              value={minRating}
              onChange={handleRatingChange}
              className={styles.filterSelect}
              aria-label="Select minimum rating"
            >
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

      {isLoading && (
        <div className={styles.loadingIndicator}>טוען עסקים...</div>
      )}
      {!isLoading && error && (
        <div className={styles.errorMessage}>
          <p>אופס! משהו השתבש:</p>
          <p>{error}</p>
          <button
            onClick={() => fetchBusinesses(currentPage)}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
      {!isLoading && !error && businesses.length === 0 && (
        <p className={styles.noResultsMessage}>
          לא נמצאו עסקים התואמים את חיפושך.
        </p>
      )}
      {!isLoading && !error && businesses.length > 0 && (
        <main className={styles.businessesGrid}>
          {businesses.map((business) => (
            <div
              key={business.business_id}
              onClick={() => handleBusinessCardClick(business.business_id)}
              style={{ cursor: "pointer" }}
            >
              <BusinessCard business={business} />
            </div>
          ))}
        </main>
      )}
      {!isLoading && !error && businesses.length > 0 && renderPagination()}
    </>
  );

  // --- Main Render: Nested routes for business profile ---
  return (
    <div className={styles.homePageContainer}>
      <Routes>
        <Route path="/" element={<DefaultHomeContent />} />
        <Route path="business/:id" element={<BusinessPublicProfile />} />
      </Routes>
    </div>
  );
}

export default HomePage;
