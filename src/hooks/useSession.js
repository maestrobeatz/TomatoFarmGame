import { useState, useEffect } from 'react';
import sessionKit, { saveSession, restoreSession } from '../sessionConfig'; // Corrected path

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
        setError(err.message);
      }
    };
    initSession();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await sessionKit.login();
      const newSession = result.session;
      setSession(newSession);
      saveSession(newSession);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await sessionKit.logout(session);
      setSession(null);
      localStorage.removeItem('userSession');
    } catch (err) {
      setError(err.message);
    }
  };

  return { session, handleLogin, handleLogout, error };
};

export default useSession;
