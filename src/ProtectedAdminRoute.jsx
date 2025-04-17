import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedAdminRoute = ({ children }) => {
    const userType = localStorage.getItem("userType");

    console.log("ProtectedAdminRoute check:", userType);

    return userType === "admin" ? children : <Navigate to="/" />;
};

export default ProtectedAdminRoute;
