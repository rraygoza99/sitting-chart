import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();

  // While the auth library is resolving (processing redirect callback, checking session),
  // don't redirect to login immediately — wait for the loading to finish.
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
