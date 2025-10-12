// src/components/SearchPage/SearchPage.jsx

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import BusinessCard from "../BusinessCard/BusinessCard.jsx";
import ErrorMessage from "../shared/ErrorMessage/ErrorMessage.jsx";
import LoadingSpinner from "../shared/LoadingSpinner/LoadingSpinner.jsx";
import styles from "./SearchPage.module.css";
import axiosInstance from "../../api/axiosInstance.js";
import useErrorHandler from "../../hooks/useErrorHandler.js";

// Debounce utility function with cleanup
function debounce(func, delay) {
  let timeoutId;
  const debouncedFunction = function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };

  debouncedFunction.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debouncedFunction;
}

function SearchPage({ user }) {
  const navigate = useNavigate();
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState([]);
  const { error, isLoading, clearError, executeWithRetry } = useErrorHandler();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [orderBy, setOrderBy] = useState("name");
  const [categories, setCategories] = useState([]);
  const [cities, setCities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const [userFavorites, setUserFavorites] = useState([]);

  const fetchAllBusinesses = useCallback(async () => {
    try {
      await executeWithRetry(async () => {
        const response = await axiosInstance.get("/businesses");
        const businesses = response.data || [];

        setAllBusinesses(businesses);
        setFilteredBusinesses(businesses);
        setTotalItems(businesses.length);
      }, { maxRetries: 2 });
    } catch (err) {
      console.error("Error fetching businesses:", err);
      setAllBusinesses([]);
      setFilteredBusinesses([]);
      setTotalItems(0);
    }
  }, [executeWithRetry]);

  const filterBusinesses = useCallback(() => {
    let filtered = [...allBusinesses];

    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(
        (business) =>
          (business.name || "").toLowerCase().includes(searchLower) ||
          (business.description || "").toLowerCase().includes(searchLower) ||
          (business.category || "").toLowerCase().includes(searchLower)
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (business) => business.category === selectedCategory
      );
    }

    if (selectedCity) {
      filtered = filtered.filter(
        (business) => (business.location || business.city || "").toLowerCase().includes(selectedCity.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      switch (orderBy) {
        case "category":
          return (
            (a.category || "").localeCompare(b.category || "") ||
            (a.name || "").localeCompare(b.name || "")
          );
        case "rating":
          return (b.average_rating || 0) - (a.average_rating || 0);
        case "newest":
          return (b.business_id || 0) - (a.business_id || 0);
        default:
          return (a.name || "").localeCompare(b.name || "");
      }
    });

    setFilteredBusinesses(filtered);
    setTotalItems(filtered.length);
    setCurrentPage(1);
  }, [allBusinesses, searchTerm, selectedCategory, selectedCity, orderBy]);

  const debouncedFilter = useCallback(() => {
    const debounced = debounce(filterBusinesses, 150);
    debounced();
  }, [filterBusinesses]);

  useEffect(() => {
    fetchAllBusinesses();

    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get("/businesses/categories");
        setCategories(response.data || []);
      } catch {
        setCategories([]);
      }
    };
    fetchCategories();
  }, [fetchAllBusinesses]);

  // Extract unique cities from businesses
  useEffect(() => {
    if (allBusinesses.length > 0) {
      const uniqueCities = [...new Set(
        allBusinesses
          .map(business => {
            // Try to extract city from location field
            const location = business.location || business.city || "";
            // Simple city extraction - you might want to make this more sophisticated
            return location.trim();
          })
          .filter(city => city.length > 0)
      )].sort();
      setCities(uniqueCities);
    }
  }, [allBusinesses]);

  // Fetch user favorites if logged in
  useEffect(() => {
    const fetchUserFavorites = async () => {
      if (user?.id) {
        try {
          const response = await axiosInstance.get(`/users/${user.id}/favorites`);
          const favoriteIds = response.data.map(fav => fav.businessId || fav.business_id);
          setUserFavorites(favoriteIds);
        } catch (error) {
          console.error('Error fetching user favorites:', error);
          setUserFavorites([]);
        }
      }
    };
    fetchUserFavorites();
  }, [user?.id]);

  useEffect(() => {
    if (allBusinesses.length > 0) {
      filterBusinesses();
    }
  }, [selectedCategory, selectedCity, orderBy, allBusinesses.length, filterBusinesses]);

  useEffect(() => {
    if (allBusinesses.length > 0) {
      debouncedFilter();
    }
  }, [searchTerm, allBusinesses.length, debouncedFilter]);

  const handleSearchInputChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleCategoryChange = useCallback((event) => {
    setSelectedCategory(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleCityChange = useCallback((event) => {
    setSelectedCity(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleOrderByChange = useCallback((event) => {
    setOrderBy(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleFormSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (debouncedFilter.cancel) {
        debouncedFilter.cancel();
      }
      filterBusinesses();
    },
    [debouncedFilter, filterBusinesses]
  );


  const handleUpdateBusiness = useCallback((updatedBusiness) => {
    setAllBusinesses((prev) =>
      prev.map((business) =>
        business.businessId === updatedBusiness.business_id
          ? updatedBusiness
          : business
      )
    );
  }, []);

  const handleDeleteBusiness = useCallback((businessId) => {
    setAllBusinesses((prev) =>
      prev.filter((business) => business.businessId !== businessId)
    );
  }, []);


  const handleNavigateToProfile = useCallback((businessId) => {
    navigate(`/business/${businessId}`);
  }, [navigate]);

  const handleToggleFavorite = useCallback(async (businessId, isFavorite) => {
    if (!user?.id) {
      navigate('/login');
      return;
    }

    try {
      if (isFavorite) {
        // Remove from favorites
        await axiosInstance.delete(`/users/${user.id}/favorites/${businessId}`);
        setUserFavorites(prev => prev.filter(id => id !== businessId));
      } else {
        // Add to favorites
        await axiosInstance.post(`/users/${user.id}/favorites`, { businessId });
        setUserFavorites(prev => [...prev, businessId]);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [user, navigate]);


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

  return (
    <div className={styles.searchPageContainer}>
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
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={handleCityChange}
              className={styles.filterSelect}
              aria-label="Select city"
            >
              <option value="">כל הערים</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
            <select
              value={orderBy}
              onChange={handleOrderByChange}
              className={styles.filterSelect}
              aria-label="Order by"
            >
              <option value="name">סדר לפי שם</option>
              <option value="category">סדר לפי קטגוריה</option>
              <option value="newest">חדשים ראשון</option>
            </select>
          </div>
        </form>
      </header>

      {/* Error Display */}
      {error && (
        <ErrorMessage 
          error={error} 
          onRetry={fetchAllBusinesses}
          onClose={clearError}
          className={styles.errorMessage}
        />
      )}

      {/* Loading Display */}
      {isLoading && !error && (
        <LoadingSpinner 
          message="טוען עסקים..."
          className={styles.loadingSpinner}
        />
      )}


      {isLoading && (
        <div className={styles.loadingIndicator}>טוען עסקים...</div>
      )}
      {!isLoading && error && (
        <div className={styles.errorMessage}>
          <p>אופס! משהו השתבש:</p>
          <p>{error}</p>
          <button
            onClick={() => fetchAllBusinesses()}
            className={styles.retryButton}
          >
            נסה שוב
          </button>
        </div>
      )}
      {!isLoading &&
        !error &&
        filteredBusinesses.length === 0 &&
        allBusinesses.length > 0 && (
          <p className={styles.noResultsMessage}>
            לא נמצאו עסקים התואמים את חיפושך.
          </p>
        )}
      {!isLoading && !error && allBusinesses.length === 0 && (
        <p className={styles.noResultsMessage}>אין עסקים זמינים.</p>
      )}

      {!isLoading && !error && filteredBusinesses.length > 0 && (
        <BusinessList
          businesses={filteredBusinesses.slice(
            (currentPage - 1) * itemsPerPage,
            currentPage * itemsPerPage
          )}
          onUpdate={handleUpdateBusiness}
          onDelete={handleDeleteBusiness}
          onNavigateToProfile={handleNavigateToProfile}
          userRole={user?.role}
          userFavorites={userFavorites}
          onToggleFavorite={handleToggleFavorite}
        />
      )}
      {!isLoading &&
        !error &&
        filteredBusinesses.length > 0 &&
        renderPagination()}

    </div>
  );
}

const BusinessList = React.memo(
  ({ businesses, onUpdate, onDelete, onNavigateToProfile, userRole, userFavorites, onToggleFavorite }) => {
    return (
      <main className={styles.businessesGrid}>
        {businesses.map((business) => {
          const businessId = business.businessId || business.business_id;
          const isFavorite = userFavorites.includes(businessId);
          
          
          return (
            <BusinessCard
              key={businessId}
              business={business}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onNavigateToProfile={onNavigateToProfile}
              userRole={userRole}
              isFavorite={isFavorite}
              onToggleFavorite={onToggleFavorite}
            />
          );
        })}
      </main>
    );
  }
);

BusinessList.displayName = "BusinessList";

export default SearchPage;