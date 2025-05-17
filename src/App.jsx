import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import UpdatePasswordPage from './pages/UpdatePasswordPage';
import DashboardPage from './pages/DashboardPage';
import AdminDashboard from "./pages/AdminDashboard";
import SettingsPage from "./pages/Settings"; // if you're routing to settings
import { AuthContextProvider } from './context/AuthContext';

function App() {
  return (
    /* Begin application on login page. */
    <>
      <LoginPage />
    </>
  );
}

export default App;
