// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";

import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";

import "./App.css";
import HomePage from './components/HomePage/HomePage';

function App() {
  return (
    // The centering logic might be in App.css or index.css
    // If in index.css targeting #root, this div might not be needed for layout
    // If in App.css, keep a container class like below
    <div className="AppContainer">
      <Header />
      <div className="content">
        {" "}
        {/* עטיפה שמקבלת flex:1 */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/business/:id" element={<BusinessProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/home" element={<HomePage />} />
          {/* <Route path="*" element={<div>Page Not Found</div>} /> */}
        </Routes>
      </div>
      <Footer /> {/* יידבק למטה בזכות flex-column */}
    </div>
  );
}

export default App;
