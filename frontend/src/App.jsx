// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import BusinessProfile from "./components/BusinessProfile/BusinessProfile";

import Header from "./components/layout/Header/Header";
import Footer from "./components/layout/Footer/Footer";

import "./App.css";

function App() {
  return (
    <div className="app">
      {" "}
      {/* היה AppContainer */}
      <Header />
      <div className="content">
        {" "}
        {/* עטיפה שמקבלת flex:1 */}
        <Routes>
          <Route path="/" element={<BusinessProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
      </div>
      <Footer /> {/* יידבק למטה בזכות flex-column */}
    </div>
  );
}

export default App;
