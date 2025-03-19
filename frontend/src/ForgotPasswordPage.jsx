import React from 'react';
import '../src/styles/AuthPages.css';
import { Link } from 'react-router-dom';

function ForgotPasswordPage() {
    return (
        <div className="auth-page-container">
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-description">Enter your email to receive reset instructions.</p>
            <form className="auth-form">
                <input type="email" placeholder="Email" className="auth-input" />
                <button type="submit" className="auth-button">Send Reset Link</button>
            </form>
            <p className="auth-link">
                Remember your password? <Link to="/">Sign In</Link>
            </p>
        </div>
    );
}

export default ForgotPasswordPage;