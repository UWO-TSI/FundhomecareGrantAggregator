import React, { useState } from 'react';
import '../styles/AuthPages.css';
import { Link } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

function ForgotPasswordPage() {

    const [email, setEmail] = useState("");

    const { session, sendForgotPasswordEmail} = UserAuth();
    const navigate = useNavigate();
    console.log(session);
    console.log(email);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await sendForgotPasswordEmail(email);
            console.log("Forgot password email result:", result); // Debug
            
            if (result.success){
                navigate("/")
            }
        } catch (err) {
            setError("an error occurred")
        } finally {
            setLoading(false)
        }
    }

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
