import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { AuthProvider } from "react-oidc-context";

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

const cognitoAuthConfig = isLocalhost
  ? {
      authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_QhE4pJXfb",
      client_id: "j75nvli3clvui9enpuc21isi6",
      redirect_uri: `${window.location.origin}/`,
      response_type: "code",
      scope: "phone openid email",
      automaticSilentRenew: true,
      loadUserInfo: true,
    }
  : {
      authority: "https://cognito-idp.us-east-2.amazonaws.com/us-east-2_7dND3Q5QD",
      client_id: "5p565e420hon8ith2m655n0krh",
      redirect_uri: "https://master.d3mmpbz9sdxh3s.amplifyapp.com/",
      response_type: "code",
      scope: "email openid phone",
      automaticSilentRenew: true,
      loadUserInfo: true,
    };

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
