import React, { useState } from 'react';
import '../styles/AuthPages.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import '../styles/ForgotPasswordPage.css';

function ForgotPasswordPage() {

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { session, sendForgotPasswordEmail} = UserAuth();
    const navigate = useNavigate();
    console.log(session);
    console.log(email);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await sendForgotPasswordEmail(email);
            console.log("Forgot password email result:", result); // Debug
            
            if (result && result.success){
                setError("Password reset link sent to your email address.");
            }
        } catch (err) {
            setError("an error occurred");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page-container">
            <h2 className="auth-title">Forgot Password</h2>
            <p className="auth-description">Enter your email to receive reset instructions.</p>
            <form onSubmit={handleSubmit} className="auth-form">
                <input
                    type="email" 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email" 
                    className="auth-input"
		            required 
                />
                <button type="submit" disabled={loading} className="auth-button">
                    {loading ? "Sending..." : "Send Reset Link"}
                </button>
                {error && <p className="error-message">{error}</p>}
            </form>
            <p className="auth-link">
                Remember your password? <Link to="/">Sign In</Link>
            </p>
        </div>
    );
}

export default ForgotPasswordPage;
