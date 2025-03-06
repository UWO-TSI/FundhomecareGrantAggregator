import React, { useState } from "react";
import "./LoginPage.css";
import { useNavigate } from 'react-router-dom';
import logo from "./assets/fundhomecarelogo.png";

const LoginPage = () => {
    const [formData, setFormData] = useState({
        username: "",
        password: "",
        rememberMe: false,
    });

    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username.trim()) {
            newErrors.username = "Username or Email is required";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            // Simulate successful login for now
            alert("Login successful!");
            navigate("/dashboard");
        }
    };

    return (
        <div className="login-container">
            {/* Left Side - Branding & Welcome Message */}
            <div className="login-left">
                <img src={logo} alt="Logo" className="login-logo" />
                <h1 className="brand-title">FUND HOMECARE Canada</h1>
                <h2 className="welcome-title">Welcome to <span className="highlight">GrantFinder</span></h2>
                <p className="welcome-text">
                    Easily find and apply for grants in one place. Sign in to explore available grants and manage your applications.
                </p>
            </div>

            {/* Right Side - Login Form */}
            <div className="login-right">
                <h2 className="form-title">Sign In</h2>
                <form className="login-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="username"
                        placeholder="Email or Username"
                        className="form-input"
                        value={formData.username}
                        onChange={handleChange}
                    />
                    {errors.username && <p className="error-text">{errors.username}</p>}

                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            className="form-input"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <button
                            type="button"
                            className="show-password-button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {errors.password && <p className="error-text">{errors.password}</p>}

                    <div className="remember-me">
                        <input
                            type="checkbox"
                            name="rememberMe"
                            checked={formData.rememberMe}
                            onChange={handleChange}
                        />
                        <label>Remember Me</label>
                    </div>

                    <button type="submit" className="form-button">
                        Sign In
                    </button>
                </form>
                <div className="form-footer">
                    <a href="/create-account" className="form-link">Create Account</a>
                    <a href="/forgot-password" className="form-link">Forgot Password</a>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
