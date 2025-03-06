import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import CreateAccountPage from './CreateAccountPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import DashboardPage from './DashboardPage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/create-account" element={<CreateAccountPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
            </Routes>
        </Router>
    );
}

export default App;
