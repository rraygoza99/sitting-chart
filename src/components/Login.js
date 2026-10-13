import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

const Login = () => {
  const auth = useAuth();

  const signOutRedirect = async () => {
    try {
      await auth.removeUser();
    } catch (e) {
      console.error('Error removing user:', e);
    }
    sessionStorage.clear();
    window.location.href = "/login";
  };

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Encountering error... {auth.error.message}</div>;
  }

  if (auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <h2>Login</h2>
      <button onClick={() => auth.signinRedirect()}>Sign in</button>
      <button onClick={signOutRedirect} style={{ marginTop: '10px' }}>Sign out</button>
    </div>
  );
};

export default Login;
