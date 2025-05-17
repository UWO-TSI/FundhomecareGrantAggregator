import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CreateAccountPage from "./pages/CreateAccountPage";
import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import UpdatePasswordPage from "./pages/UpdatePasswordPage";
import DashboardPage from "./pages/DashboardPage";
import AdminDashboard from "./pages/AdminDashboard";
import SettingsPage from './pages/Settings';
import PrivateRoute from "./components/PrivateRoute";
import { Navigate } from "react-router-dom";

export const router = createBrowserRouter([
    { path: "/", element: <LoginPage /> },
    { path: "/create-account", element: <CreateAccountPage />},
    { path: "/forgot-password", element: <ForgotPasswordPage />},
    { path: "/update-password", element: <UpdatePasswordPage />},
    { path: "/settings", element: <SettingsPage />},
    { 
        path: "/dashboard", 
        element: (
            <PrivateRoute>
                <DashboardPage /> 
            </PrivateRoute>
        ),   
    }, 
    { 
        path: "/admin-dashboard", 
        element: (
            <PrivateRoute>
                <AdminDashboard /> 
            </PrivateRoute>
        ),   
    }, 
]);