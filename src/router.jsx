import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import CreateAccountPage from "./pages/CreateAccountPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PrivateRoute from "./components/PrivateRoute";

export const router = createBrowserRouter([
    { path: "/", element: <App />}, 
    { path: "/signup", element: <CreateAccountPage />}, 
    { path: "/signin", element: <LoginPage />}, 
    { 
        path: "/dashboard", 
        element: (
            <PrivateRoute>
                <DashboardPage /> 
            </PrivateRoute>
        ),   
    }, 
]) 