import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "react-oidc-context";
import { redirect } from 'react-router-dom';

const cognitoAuthConfig = {
  // Use the Cognito Hosted UI domain (so the provider's .well-known endpoints are available)
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_7dND3Q5QD",
  client_id: "5p565e420hon8ith2m655n0krh",
  redirect_uri: "https://master.d3mmpbz9sdxh3s.amplifyapp.com/",
  //redirect_uri: "http://localhost:3000",
  response_type: "code",
  // include openid and profile for standard claims; remove uncommon 'phone' unless required
  scope: "email openid phone",
  // helpful defaults
  automaticSilentRenew: true,
  loadUserInfo: true,
};

//DEV
/*const cognitoAuthConfig = {
  authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_QhE4pJXfb",
  client_id: "j75nvli3clvui9enpuc21isi6",
  redirect_uri: "http://localhost:3000",
  response_type: "code",
  scope: "phone openid email",
};*/


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(

  <React.StrictMode>
    <link
  rel="stylesheet"
  href="https://fonts.googleapis.com/icon?family=Material+Icons"
/>
<AuthProvider {...cognitoAuthConfig}>
      <App />
    </AuthProvider>
  </React.StrictMode>
);

reportWebVitals();
