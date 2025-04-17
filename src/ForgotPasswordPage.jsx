import React, { useState } from 'react';
import '../src/styles/AuthPages.css';
import { Link } from 'react-router-dom';
import { supabase } from './supabase-client'; // update this path as needed

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:5173/update-password"
    });

    if (error) {
      setError("❌ " + error.message);
    } else {
      setError("Password reset link sent! Check your email.");
    }

    setLoading(false);
  };

  return (
    <div className="auth-page-container">
      <h2 className="auth-title">Forgot Password</h2>
      <p className="auth-description">Enter your email to receive reset instructions.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <input
          type="email"
          value={email}
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
