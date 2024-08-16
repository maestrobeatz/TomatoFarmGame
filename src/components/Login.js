// Login.js
import React from 'react';
import '../styles.css'; // Ensure the correct path to styles.css

const Login = ({ session, login, logout }) => {
  return (
    <div className="login-container">
      {session ? (
        <button className="green-button" onClick={logout}>
          LOGOUT
        </button>
      ) : (
        <button className="green-button" onClick={login}>
          LOGIN
        </button>
      )}
    </div>
  );
};

export default Login;
