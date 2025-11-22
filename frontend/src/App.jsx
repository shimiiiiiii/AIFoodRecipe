import React, { useState, useEffect } from "react";
import RecipeList from "./components/RecipeList";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import "./App.css";

function Navigation({ isLoggedIn, onLogout }) {
  const location = useLocation();
  
  // Don't show navigation on auth pages
  if (location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1>🍽️ Recipe Generator</h1>
        </Link>
        <div>
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link to="/">🏠 Home</Link>
              <Link to="/recipes">📚 My Recipes</Link>
              <button 
                onClick={onLogout}
                style={{ 
                  background: 'rgba(255, 255, 255, 0.2)', 
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem'
                }}
              >
                🚪 Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link to="/login">🚀 Login</Link>
              <Link to="/register">🎯 Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in on component mount
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

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
