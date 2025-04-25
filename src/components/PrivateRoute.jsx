import React from "react";
import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
    const auth = UserAuth();

    if (!auth) {
        return <p>Loading auth context...</p>;
    }

    const { session } = auth;

    if (session === undefined) {
        return <p>Loading session...</p>;
    }

    return session ? <>{children}</> : <Navigate to="/signup" />;
};

export default PrivateRoute;
