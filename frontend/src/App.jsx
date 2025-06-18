// src/App.jsx

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";
import UserProfilePage from "./components/UserProfilePage/UserProfilePage";
import "./App.css";

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const navigate = useNavigate();

  // Decide home path based on user role
  const getHomePath = (user) => {
    if (!user) return "/login";
    switch (user.role) {
      case "business":
        return `/business/${user.businessId || user.id}`;
      case "customer":
        return "/profile";
      default:
        return "/login";
    }
  };

  useEffect(() => {
    const storedUserInfo = localStorage.getItem("userInfo");
    if (storedUserInfo) {
      try {
        setCurrentUser(JSON.parse(storedUserInfo));
      } catch (error) {
        console.error("Failed to parse user info", error);
        localStorage.clear();
      }
    }
    setAuthChecked(true);
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    navigate(getHomePath(userData));
  };

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
          {/* Login */}
          <Route
            path="/login"
            element={<Login onLoginSuccess={handleLoginSuccess} />}
          />
          {/* Signup */}
          <Route path="/signup" element={<SignUp />} />
          {/* Redirect home */}
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate replace to={getHomePath(currentUser)} />
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
          {/* 404 */}
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
