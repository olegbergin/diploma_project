// src/App.jsx (Refactored and Simplified)

// --- Imports ---
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// --- Page & Layout Components ---
// Use the new Header component
import Header from './components/layout/Header/Header';
import Footer from './components/layout/Footer/Footer';
import HomePage from './components/HomePage/HomePage';
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import BusinessProfile from './components/BusinessProfile/BusinessProfile';
import UserProfilePage from './components/UserProfilePage/UserProfilePage';

// --- Styles ---
import './App.css';

function App() {
  // --- State Hooks (no change) ---
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // --- Effect to check for existing session on initial load ---
  // This is perfect, no changes needed here.
  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      try {
        setCurrentUser(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Failed to parse user info", error);
        localStorage.clear();
      }
    }
    setAuthChecked(true);
  }, []); // Runs only once

  // --- Handler Functions ---

  // NEW: This function will be called by the Login component on success
  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    // After setting the user, we can navigate them to their profile.
    // The navigation logic is now centralized here.
    navigate('/profile');
  };

  // The logout function is perfect as is.
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  // Loading state (perfect as is)
  if (!authChecked) {
    return <div>Loading...</div>;
  }

  // --- JSX for Rendering ---
  return (
    <div className="AppContainer">
      {/* Our new Header component works perfectly here! */}
      <Header user={currentUser} onLogout={handleLogout} />

      <div className="content">
        <Routes>
          {/* --- Public Routes --- */}
          {/* We now pass the handleLoginSuccess function to the Login component */}
          <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/signup" element={<SignUp />} />

          {/* --- Protected Routes --- */}
          {/* The logic for protecting routes is perfect as is. */}
          <Route
            path="/"
            element={currentUser ? <Navigate replace to="/profile" /> : <Navigate replace to="/login" />}
          />
          <Route
            path="/home"
            element={currentUser ? <HomePage user={currentUser} /> : <Navigate replace to="/login" />}
          />
          <Route
            path="/business/:id"
            element={currentUser ? <BusinessProfile user={currentUser} /> : <Navigate replace to="/login" />}
          />
          <Route
            path="/profile"
            element={currentUser ? <UserProfilePage user={currentUser} onLogout={handleLogout} /> : <Navigate replace to="/login" />}
          />

          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;