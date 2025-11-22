import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";

const Login = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            console.log(`Sending to backend:\nUsername: ${username}\nPassword: ${password}`); 
            const response = await axios.post('http://localhost:8000/auth/login', { 
                username, 
                password
            });
            console.log('Login successful:', response.data);
            localStorage.setItem('token', response.data.access_token);
            if (onLoginSuccess) onLoginSuccess();
            navigate('/'); 
        } catch (error) {
            if (error.response) {
                console.error('Login failed:', error.response.data);
                setErrorMessage(error.response.data.detail || 'Login failed.');
            } else {
                console.error('Network error:', error.message);
                setErrorMessage('Network error. Please try again later.');
            }
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h1 className="text-center">🍽️ Welcome Back!</h1>
                <p className="text-center" style={{color: 'var(--text-light)', marginBottom: '2rem'}}>
                    Sign in to access your recipe collection
                </p>
                
                {errorMessage && (
                    <div className="error-message">
                        ⚠️ {errorMessage}
                    </div>
                )}
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>👤 Username</label>
                        <input
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>🔒 Password</label>
                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="mb-3" style={{width: '100%'}}>
                        🚀 Sign In
                    </button>
                </form>
                
                <div className="auth-links">
                    <p>
                        New to Recipe Generator? <Link to="/register">🎆 Create Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;