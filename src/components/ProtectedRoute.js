import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
