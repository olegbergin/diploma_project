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
import BusinessRegistration from "./components/BusinessRegistration/BusinessRegistration";
import HomePage from "./components/HomePage/HomePage";
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";
import NewBusinessDashboard from "./components/BusinessDashboard/NewBusinessDashboard";
import UserDashboard from "./components/UserDashboard/UserDashboard";
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

  if (!authChecked) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f8f4ff'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(201, 178, 245, 0.3)',
            borderTop: '3px solid var(--primary-purple)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1rem',
            margin: 0
          }}>טוען...</p>
        </div>
      </div>
    );
  }

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
          {/* Business Registration */}
          <Route
            path="/register-business"
            element={<BusinessRegistration onRegistrationSuccess={() => {
              // Delay navigation to allow user to see success message
              setTimeout(() => navigate('/login'), 3000);
            }} />}
          />
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
          {/* User dashboard */}
          <Route
            path="/user/:id/dashboard"
            element={
              currentUser && currentUser.role === "customer" ? (
                <UserDashboard user={currentUser} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* User profile (legacy - redirect to dashboard) */}
          <Route
            path="/profile/*"
            element={
              currentUser && currentUser.role === "customer" ? (
                <Navigate replace to={`/user/${currentUser.id}/dashboard`} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Business dashboard (new modern dashboard) */}
          <Route
            path="/business/:id/dashboard"
            element={
              currentUser && currentUser.role === "business" ? (
                <NewBusinessDashboard user={currentUser} />
              ) : (
                <Navigate replace to="/login" />
              )
            }
          />
          {/* Business profile (legacy - redirect to dashboard) */}
          <Route
            path="/business/:id"
            element={
              currentUser && currentUser.role === "business" ? (
                <Navigate replace to={`/business/${currentUser.businessId || currentUser.id}/dashboard`} />
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
