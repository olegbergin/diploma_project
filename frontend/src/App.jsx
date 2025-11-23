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
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";
import BusinessEditPage from "./components/BusinessEditPage/BusinessEditPage";
import BusinessPublicProfile from "./components/BusinessPublicProfile/BusinessPublicProfile";
import NewBusinessDashboard from "./components/BusinessDashboard/NewBusinessDashboard";
import ServiceManagement from "./components/ServiceManagement/ServiceManagement";
import CalendarPage from "./components/CalendarPage/CalendarPage";
import AppointmentHistory from "./components/AppointmentHistory/AppointmentHistory";
import ReportsPage from "./components/ReportsPage/ReportsPage";
import UserDashboard from "./components/UserDashboard/UserDashboard";
import FavoritesPage from "./components/FavoritesPage/FavoritesPage";
import SearchPage from "./components/SearchPage/SearchPage";
import BookingPageSingleScreen from "./components/BookingPage/BookingPageSingleScreen";
import AdminPanel from "./components/AdminPanel/AdminPanel";
import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
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
        const userData = JSON.parse(storedUserInfo);
        // Normalize user data to ensure consistent field names
        const normalizedUserData = {
          ...userData,
          id: userData.id || userData.userId // Ensure we have an 'id' field
        };
        setCurrentUser(normalizedUserData);
        // Update localStorage with normalized data
        localStorage.setItem("userInfo", JSON.stringify(normalizedUserData));
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
    // Normalize user data to ensure consistent field names
    const normalizedUserData = {
      ...userData,
      id: userData.id || userData.userId // Ensure we have an 'id' field
    };
    
    setCurrentUser(normalizedUserData);
    localStorage.setItem("userInfo", JSON.stringify(normalizedUserData));
    
    // Use the normalized id for navigation
    const userId = normalizedUserData.id;
    
    // Redirect to role-specific dashboard
    switch (normalizedUserData.role) {
      case "customer":
        navigate(`/user/${userId}/dashboard`);
        break;
      case "business":
        navigate(`/business/${normalizedUserData.businessId || userId}/dashboard`);
        break;
      case "admin":
        navigate("/admin");
        break;
      default:
        navigate("/search"); // Fallback to search for unknown roles
    }
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
    <UserProvider value={{ currentUser, setCurrentUser }}>
      <ToastProvider>
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
                  <BookingPageSingleScreen />
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
            {/* Favorites page - accessible to logged in users */}
            <Route
              path="/favorites"
              element={
                currentUser ? (
                  <FavoritesPage user={currentUser} />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            {/* Public business profile - accessible to all users */}
            <Route
              path="/business/:id"
              element={<BusinessPublicProfile />}
            />
            {/* Redirect to appropriate dashboard */}
            <Route
              path="/"
              element={
                currentUser ? (
                  currentUser.role === "customer" ? (
                    <Navigate replace to={`/user/${currentUser.id || currentUser.userId}/dashboard`} />
                  ) : currentUser.role === "business" ? (
                    <Navigate replace to={`/business/${currentUser.businessId || currentUser.id || currentUser.userId}/dashboard`} />
                  ) : currentUser.role === "admin" ? (
                    <Navigate replace to="/admin" />
                  ) : (
                    <Navigate replace to="/search" />
                  )
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
                  <Navigate replace to={`/user/${currentUser.id || currentUser.userId}/dashboard`} />
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
            {/* Service management for businesses */}
            <Route
              path="/services"
              element={
                currentUser && currentUser.role === "business" ? (
                  <ServiceManagement />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            {/* Calendar for businesses */}
            <Route
              path="/calendar"
              element={
                currentUser && currentUser.role === "business" ? (
                  <CalendarPage />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            {/* Appointment History for businesses */}
            <Route
              path="/appointments/history"
              element={
                currentUser && currentUser.role === "business" ? (
                  <AppointmentHistory user={currentUser} />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            {/* Reports page for businesses */}
            <Route
              path="/reports"
              element={
                currentUser && currentUser.role === "business" ? (
                  <ReportsPage user={currentUser} />
                ) : (
                  <Navigate replace to="/login" />
                )
              }
            />
            {/* Business profile management interface */}
            <Route
              path="/business/:id/edit"
              element={
                currentUser && currentUser.role === "business" ? (
                  <BusinessEditPage />
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
      </ToastProvider>
    </UserProvider>
  );
}

export default App;
