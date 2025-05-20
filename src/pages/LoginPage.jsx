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
        e.preventDefault();
        setLoading(true);
        setError(""); // Clear previous errors

        try {
            const result = await signInUser(email, password);

            if (result.success){
                const userRole = result.role;
                const isAttemptingAdminLogin = isAdmin; // Role being attempted via UI

                if (isAttemptingAdminLogin && userRole === 'admin') {
                    navigate("/dashboard");
                } else if (!isAttemptingAdminLogin && userRole === 'user') {
                    navigate("/dashboard");
                } else {
                    // Role mismatch
                    const expectedPortal = userRole === 'admin' ? 'Admin' : 'User';
                    setError(`Incorrect login portal. Your role is "${userRole}". Please use the ${expectedPortal} Login.`);
                    // Optionally, sign them out if you logged them in before checking role in AuthContext
                    // This is handled in AuthContext now by signing out if role fetch fails or role not found.
                }
            } else {
                setError(result.error || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            console.error("Login page error: ", err); // Log the actual error for debugging
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="login-container">
            {/* Left Side - Branding & Welcome Message */}
            <div className="login-left">
                <img src={logo} alt="Logo" className="login-logo" />
                <h2 className="welcome-title" data-text="Welcome to GrantFinder">
                    Welcome to <span className="highlight">GrantFinder</span>
                </h2>

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
