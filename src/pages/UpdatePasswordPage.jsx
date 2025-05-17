import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserAuth } from '../context/AuthContext';
import '../styles/UpdatePasswordPage.css';


function UpdatePasswordPage() {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { session, otpSignIn, updatePassword } = UserAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(null);
    console.log(session);

    useEffect(() => {
        const resetToken = searchParams.get('token');
        if (resetToken) {
            setToken(resetToken);
        } else {
            setError("Invalid or missing password reset token.");
        }
        const resetEmail = searchParams.get('email');
    }, [searchParams]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            const verify = await otpSignIn(token);
            console.log("OTP Sign In result: ", verify); // Debug

            if (verify && verify.success) {
                setError('User authenticated!');
                
                const result = await updatePassword(newPassword);
                console.log("Update password result: ", result); // Debug

                if (result && result.success) {
                    setError('Password updated successfully! You will be redirected to the login page.');
                    setTimeout(() => {
                        navigate('/');
                    }, 2000);
                }

            }

        } catch (err) {
            console.error('An unexpected error occurred:', err);
            setError('An unexpected error occurred. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page-container">
            <h2 className="auth-title">Update Your Password</h2>
            <p className="auth-description">Enter your new password.</p>
            {error && <p className={error.includes('successfully') ? 'success-message' : 'error-message'}>{error}</p>}
            {token && (
                <form onSubmit={handleSubmit} className="auth-form">
                    <input
                        type="password"
                        placeholder="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="auth-input"
                    />
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="auth-input"
                    />
                    <button type="submit" disabled={loading} className="auth-button">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            )}
            {!token && !error && <p>Please click the link in your email to reset your password.</p>}
        </div>
    );
}

export default UpdatePasswordPage;
