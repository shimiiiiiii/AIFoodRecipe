import React, { useState } from "react";
import { Link } from 'react-router-dom';
import axios from "axios";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    full_name: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/auth/register", formData);
      setMessage(response.data.message);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || "Registration failed. Please try again.";
      setMessage(errorMsg);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h1 className="text-center">🎉 Join Recipe Generator!</h1>
        <p className="text-center" style={{color: 'var(--text-light)', marginBottom: '2rem'}}>
          Create your account and start discovering amazing recipes
        </p>
        
        {message && (
          <div className={message.includes('successfully') || message.includes('created') ? "success-message" : "error-message"}>
            {message.includes('successfully') || message.includes('created') ? '✅' : '⚠️'} {typeof message === "string" ? message : JSON.stringify(message)}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>👤 Username</label>
            <input
              type="text"
              name="username"
              placeholder="Choose a unique username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>📧 Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>👨‍🍳 Full Name</label>
            <input
              type="text"
              name="full_name"
              placeholder="Enter your full name"
              value={formData.full_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>🔒 Password</label>
            <input
              type="password"
              name="password"
              placeholder="Create a secure password"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="mb-3" style={{width: '100%'}}>
            🎆 Create Account
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">🚀 Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;