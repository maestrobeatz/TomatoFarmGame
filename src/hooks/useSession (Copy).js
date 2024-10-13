import { useState, useEffect } from 'react';
import sessionKit, { saveSession, restoreSession } from '../config/sessionConfig'; // Importing from sessionConfig

const useSession = () => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initSession = async () => {
      try {
        const restoredSession = await restoreSession();
        if (restoredSession) {
          setSession(restoredSession);
        }
      } catch (err) {
        console.error("Error restoring session:", err.message);
        setError(err.message);
      }
    };
    initSession();
  }, []);

const handleLogin = async () => {
  try {
    console.log('Attempting login...');
    const result = await sessionKit.login();
    console.log('Login result:', result);  // Add this line
    if (result && result.session) {
      const newSession = result.session;
      console.log('Login successful. Session data:', newSession);
      setSession(newSession);
      saveSession(newSession);
    } else {
      throw new Error('Login failed: No session data returned');
    }
  } catch (err) {
    console.error('Login error:', err);  // Log the full error object
    setError(err.message);
  }
};
  const handleLogout = async () => {
    try {
      if (session) {
        await sessionKit.logout(session);
        setSession(null);
        localStorage.removeItem('userSession');
        console.log('Logout successful');
      } else {
        console.warn("No session found to log out from");
      }
    } catch (err) {
      console.error('Logout error:', err.message);
      setError(err.message);
    }
  };

  return { session, handleLogin, handleLogout, error };
};

export default useSession;
