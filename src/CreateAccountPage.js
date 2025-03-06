import React from 'react';
import './AuthPages.css';
import { Link } from 'react-router-dom';

function CreateAccountPage() {
    return (
        <div className="auth-page-container">
            <h2 className="auth-title">Create Account</h2>
            <form className="auth-form">
                <input type="text" placeholder="Full Name" className="auth-input" />
                <input type="email" placeholder="Email" className="auth-input" />
                <input type="password" placeholder="Password" className="auth-input" />
                <input type="password" placeholder="Confirm Password" className="auth-input" />
                <button type="submit" className="auth-button">Create Account</button>
            </form>
            <p className="auth-link">
                Already have an account? <Link to="/">Sign In</Link>
            </p>
        </div>
    );
}

export default CreateAccountPage;
