import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate for navigation
import Onboarding from './Onboarding';  // Import the Onboarding component
import '../styles/Login.css';  // Import the Login CSS styles

const Login = ({ session, login, logout }) => {
  const [showOnboarding, setShowOnboarding] = useState(false);  // State to toggle onboarding
  const navigate = useNavigate();  // useNavigate for navigation

  // Show onboarding for new users
  const handleOnboarding = () => {
    setShowOnboarding(true);
  };

  // Handle logout and navigate back to login screen
  const handleLogout = () => {
    logout();  // Call the logout function (clears session)
    setTimeout(() => {
      navigate('/');  // Navigate back to login screen after session is cleared
    }, 500);  // Added slight delay to ensure session clears before navigating
  };

  return (
    <div className={`login-container ${session ? 'logged-in' : ''}`}>
      {session ? (
        <button className="logout-button" onClick={handleLogout}>
          LOGOUT
        </button>
      ) : (
        <>
          <button className="login-button" onClick={login}>
            LOGIN
          </button>
          <button className="blue-button" onClick={handleOnboarding}>
            New User? Start Here
          </button>
        </>
      )}

      {/* Display the onboarding process when the user clicks "New User" */}
      {!session && showOnboarding && (
        <div style={{ marginTop: '20px' }}>
          <Onboarding />
        </div>
      )}
    </div>
  );
};

export default Login;
