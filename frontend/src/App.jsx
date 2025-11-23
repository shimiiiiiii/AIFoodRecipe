import React, { useState, useEffect } from "react";
import RecipeList from "./components/RecipeList";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import { ChefHat, Home as HomeIcon, BookOpen, LogOut, LogIn, UserPlus } from "lucide-react";
import "./assets/css/App.css";

function Navigation({ isLoggedIn, onLogout }) {
  const location = useLocation();
  
  // Don't show navigation on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <ChefHat size={32} />
          <span>Recipe Generator</span>
        </Link>
        <div className="nav-links">
          {isLoggedIn ? (
            <>
              <Link to="/" className="nav-link">
                <HomeIcon size={18} />
                Home
              </Link>
              <Link to="/recipes" className="nav-link">
                <BookOpen size={18} />
                My Recipes
              </Link>
              <button onClick={onLogout} className="nav-button">
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <LogIn size={18} />
                Login
              </Link>
              <Link to="/register" className="nav-link-primary">
                <UserPlus size={18} />
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  // Initialize state based on localStorage
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const token = localStorage.getItem('token');
    return !!token;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  return (
    <div className="app">
      <Navigation isLoggedIn={isLoggedIn} onLogout={handleLogout} />
      <div className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/login"
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLoginSuccess={() => setIsLoggedIn(true)} />
              )
            }
          />
          <Route 
            path="/register" 
            element={
              isLoggedIn ? (
                <Navigate to="/" replace />
              ) : (
                <Register />
              )
            } 
          />
          <Route
            path="/recipes"
            element={
              isLoggedIn ? (
                <RecipeList />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;