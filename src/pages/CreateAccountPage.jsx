import React, { useState } from 'react';
import '../styles/AuthPages.css';
import { Link, useNavigate } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';

function CreateAccountPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState("");

    const { session, signUpNewUser} = UserAuth();
    const navigate = useNavigate();
    console.log(session);
    console.log(email,password);

    const handleSignUp = async (e) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError("Passwords do not match!")
            return
        }

        setLoading(true);
        setError(null);

        try {
            const result = await signUpNewUser(email, password)

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
        <div className="auth-page-container">
            <h2 className="auth-title">Create Account</h2>
            <form onSubmit={handleSignUp} className="auth-form">
                <input type="text" placeholder="Full Name" className="auth-input" />
                <input 
                    type="email" 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Email" 
                    className="auth-input" 
                />
                <input 
                    type="password" 
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password" 
                    className="auth-input" 
                />
                <input 
                    type="password" 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password" 
                    className="auth-input" 
                />
                <button type="submit" disabled={loading} className="auth-button">Create Account</button>

            </form>
            <p className="auth-link">
                Already have an account? <Link to="/signin">Sign In</Link>
            </p>
        </div>
    );
}

export default CreateAccountPage;