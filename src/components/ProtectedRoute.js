import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";
import { isClientUser } from "../utils/userRoleService";

const ProtectedRoute = ({ children, requirePlanner = false }) => {
  const auth = useAuth();

  if (auth.isLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requirePlanner && isClientUser(auth.user?.profile)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
