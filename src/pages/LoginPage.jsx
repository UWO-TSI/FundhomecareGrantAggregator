import React, { useState } from "react";
import '../styles/LoginPage.css'; // Keep the original CSS file
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import logo from "../assets/fundhomecarelogo.png";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); // Toggle between Admin & User
    const [rememberMe, setRememberMe] = useState(false);

    const { session, signInUser } = UserAuth();
    const navigate = useNavigate();

    const handleSignIn = async (e) => {
        e.preventDefault()

        setLoading(true);
        setError(null);

        try {
            const result = await signInUser(email, password)

            if (result.success){
                navigate('/dashboard')
            }
        } catch (err) {
            setError("an error occurred")
        } finally {
            setLoading(false);
        }
    }

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
                <h2 className="form-title">{isAdmin ? "Admin Login" : "User Login"}</h2>

                {/* Toggle Between User/Admin Login */}
                <button 
                    type="button" 
                    className="switch-button" 
                    onClick={() => setIsAdmin(!isAdmin)}
                >
                    {isAdmin ? "Switch to User Login" : "Switch to Admin Login"}
                </button>

                {error && <p className="error-text">{error}</p>}

                <form onSubmit={handleSignIn} className="login-form">
                    <input
                        type="email"
                        placeholder={isAdmin ? "Admin Email" : "Email"}
                        className="form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <div className="password-container">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="form-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="show-password-button"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>

                    <div className="remember-me">
                        <input
                            type="checkbox"
                            id="rememberMe"
                            checked={rememberMe}
                            onChange={() => setRememberMe(!rememberMe)}
                        />
                        <label htmlFor="rememberMe">Remember Me</label>
                    </div>

                    <button 
                        type="submit" 
                        className="form-button"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : isAdmin ? "Login as Admin" : "Login as User"}
                    </button>
                </form>

                <div className="form-footer">
                    <Link to="/signup" className="form-link">Create Account</Link>
                    <Link to="/forgot-password" className="form-link">Forgot Password</Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;