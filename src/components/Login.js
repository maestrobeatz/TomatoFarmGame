import React, { useState } from 'react';
import './Login.css'; // Import the enhanced Login.css
import Onboarding from './Onboarding'; // Import the Onboarding component

const Login = ({ session, login, logout }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  const handleOnboarding = () => {
    setShowOnboarding(true);
  };

  return (
    <div className={`login-container ${session ? 'logged-in' : ''}`}>
      {session ? (
        <button className="green-button logout-button" onClick={logout}>
          LOGOUT
        </button>
      ) : (
        <>
          <button className="green-button" onClick={login}>
            LOGIN
          </button>
          <button className="blue-button" onClick={handleOnboarding}>
            New User? Start Here
          </button>
        </>
      )}

      {!session && showOnboarding && <Onboarding />}
    </div>
  );
};

export default Login;
