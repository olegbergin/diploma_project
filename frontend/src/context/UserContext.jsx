// src/context/UserContext.jsx
import React, { createContext } from 'react';

// Define the shape of the context data
// We'll store the user object which can include id, name, email, and role
export const UserContext = createContext(null);

export const UserProvider = ({ children, value }) => {
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};