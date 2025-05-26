// src/context/UserContext.jsx
import React, { createContext, useState, useContext } from 'react';

// Define the shape of the context data
// We'll store the user object which can include id, name, email, and role
const UserContext = createContext({
  currentUser: null, // Initially, no user is logged in
  loginUser: () => {}, // Function to simulate login
  logoutUser: () => {} // Function to simulate logout
});

// Custom hook to easily consume the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component that will wrap parts of our app
export const UserProvider = ({ children }) => {
  // State to hold the current "logged-in" user's information
  // For now, role is the most important part for this exercise.
  // In a real app, this would come from an API after login.
  const [currentUser, setCurrentUser] = useState(null); // e.g., { id: 1, name: 'Gleb', role: 'business_owner' }

  // Function to simulate a user logging in with a specific role
  const loginUser = (userData) => {
    // In a real app, userData would come from your auth API response (token decoded)
    // For simulation, we expect an object like: { id, name, email, role }
    console.log("Simulating login for user:", userData);
    setCurrentUser(userData);
    // Later, you would also store the JWT token here or in localStorage
  };

  // Function to simulate a user logging out
  const logoutUser = () => {
    console.log("Simulating logout");
    setCurrentUser(null);
    // Later, you would also clear the JWT token from localStorage
  };

  // The value provided to consuming components
  const value = {
    currentUser,
    loginUser,
    logoutUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};