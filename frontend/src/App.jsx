// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // Import routing components
import Login from './components/Login/Login';
import SignUp from './components/SignUp/SignUp';
import './App.css'; // You might have App specific styles here, or just rely on index.css

function App() {
  return (
    // The centering logic might be in App.css or index.css
    // If in index.css targeting #root, this div might not be needed for layout
    // If in App.css, keep a container class like below
    <div className="AppContainer">
      <Routes>
        {/* Default route redirects to login */}
        <Route path="/" element={<Navigate replace to="/login" />} />

        {/* Login route */}
        <Route path="/login" element={<Login />} />

        {/* SignUp route */}
        <Route path="/signup" element={<SignUp />} />

        {/* Optional: Add a 404 Not Found Route */}
        {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
      </Routes>
    </div>
  );
}

export default App;