import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from '../src/LoginPage';
import CreateAccountPage from '../src/CreateAccountPage';
import ForgotPasswordPage from '../src/ForgotPasswordPage';
import DashboardPage from '../src/DashboardPage';
import AdminDashboard from "../src/AdminDashboard";
import ProtectedAdminRoute from "../src/ProtectedAdminRoute";

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/create-account" element={<CreateAccountPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/" element={<LoginPage />} />
                <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
            </Routes>
        </Router>
    );
}

export default App;
