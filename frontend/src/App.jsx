import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import CreateAccountPage from './CreateAccountPage';
import ForgotPasswordPage from './ForgotPasswordPage';
import DashboardPage from './DashboardPage';
import AdminDashboard from "./AdminDashboard";
import ProtectedAdminRoute from "./ProtectedAdminRoute";

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
