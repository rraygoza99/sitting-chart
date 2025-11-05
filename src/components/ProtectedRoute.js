import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  console.log(auth);
  if (auth.isLoading) {
    return <div>Checking authentication...</div>;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
