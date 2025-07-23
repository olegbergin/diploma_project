/**
 * Main Application Component
 * Handles authentication, routing, and global state management
 * 
 * @component
 * @returns {JSX.Element} Main application with routing and layout
 */

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import AuthPage from "./components/AuthPage/AuthPage";
import HomePage from "./components/HomePage/HomePage";
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";
import SearchPage from "./components/SearchPage/SearchPage";
import BookingPage from "./components/BookingPage/BookingPage";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import "./App.css";

function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  /**
   * Determines the appropriate home path based on user role
   * @param {Object|null} user - User object with role information
   * @returns {string} Path to redirect user to based on their role
   */
  const getHomePath = (user) => {
    if (!user) return "/login";
    switch (user.role) {
      case "business":
        return `/business/${user.businessId || user.id}`;
      case "customer":
        return "/profile";
      case "admin":
        return "/admin";
      default:
        return "/login";
    }
  };

  /**
   * Initialize authentication state from localStorage on app startup
   */
  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        setCurrentUser(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Failed to parse user info from localStorage:", error);
        localStorage.clear();
      }
    }
    setAuthChecked(true);
  }, []);

  /**
   * Handles successful user login
   * @param {Object} userData - User data returned from authentication
   */
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    navigate("/home"); // Navigate to home page after login
  };

  /**
   * Handles user logout by clearing state and localStorage
   */
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  if (!authChecked) return <div>Loading...</div>;

  return (
    <div className="AppContainer">
      <Header user={currentUser} onLogout={handleLogout} />
      <div className="content">
        <Routes>
          {/* Auth (Login/Signup) */}
          <Route
            path="/login"
            element={<AuthPage onLoginSuccess={handleLoginSuccess} />}
          />
          {/* Redirect signup to login (now handled by AuthPage) */}
          <Route path="/signup" element={<Navigate replace to="/login" />} />
          {/* Booking page - accessible to logged in users */}
          <Route
            path="/booking/:businessId/:serviceId"
            element={
              currentUser ? (
                <BookingPage />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Search page - accessible to all users */}
          <Route
            path="/search"
            element={<SearchPage user={currentUser} />}
          />
          {/* Redirect home */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate replace to="/home" />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Home page - accessible to all logged in users */}
          <Route
            path="/home/*"
            element={
              currentUser ? (
                <HomePage user={currentUser} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* User profile: contains all sub-pages (inc. HomePage) */}
          <Route
            path="/profile/*"
            element={
              currentUser && currentUser.role === "customer" ? (
                <UserProfilePage
                  user={currentUser}
                  setUser={setCurrentUser}
                  onLogout={handleLogout}
                />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Business profile (for business owners) */}
          <Route
            path="/business/:id"
            element={
              currentUser && currentUser.role === "business" ? (
                <BusinessProfile user={currentUser} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Admin panel (for administrators) */}
          <Route
            path="/admin/*"
            element={
              currentUser && currentUser.role === "admin" ? (
                <AdminPanel user={currentUser} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* 404 */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
