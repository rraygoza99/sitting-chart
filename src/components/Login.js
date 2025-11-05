import React from "react";
import { useAuth } from "react-oidc-context";
import { Navigate } from "react-router-dom";

const clientId = "5p565e420hon8ith2m655n0krh";
const logoutUri = "https://master.d3mmpbz9sdxh3s.amplifyapp.com/login";
const cognitoDomain = "https://sitting-chart.auth.us-east-2.amazoncognito.com";

const Login = () => {
  const auth = useAuth();

  const signOutRedirect = () => {
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
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
