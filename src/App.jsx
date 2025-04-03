import supabase from './supabase-client';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Link } from "react-router-dom";
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from "./pages/AdminDashboard";
// import ProtectedAdminRoute from "./ProtectedAdminRoute";

function App() {
    return (
      <>
        <CreateAccountPage />
        <p>Already have an account? <Link to="/signin"> Sign in! </Link></p>
      </>
        // <Router>
        //     <Routes>
        //         <Route path="/" element={<LoginPage />} />
        //         <Route path="/create-account" element={<CreateAccountPage />} />
        //         <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        //         <Route path="/dashboard" element={<DashboardPage />} />
        //         <Route path="/admin-dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
        //     </Routes>
        // </Router>
    );
}

export default App;
