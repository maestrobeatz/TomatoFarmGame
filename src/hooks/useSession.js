import { useState, useEffect, useCallback } from 'react';
import sessionKit, { saveSession, clearSession } from '../config/sessionConfig'; 
import { getAllAccounts } from '../components/Wallet/indexedDB';
import { useNavigate } from 'react-router-dom';

export const TAPOS = {
  blocksBehind: 3,
  expireSeconds: 120,
  broadcast: true // Broadcast the transaction to the blockchain
};

// Helper function to initialize and perform a transaction
export const InitTransaction = async (dataTrx) => {
  try {
    const session = await sessionKit.restore(); // Restores the session
    if (!session) {
      throw new Error("No session found");
    }

    const actions = [...dataTrx.actions]; // Spread in actions for the transaction
    
    const transaction = await session.transact({ actions }, TAPOS);
    if (transaction) {
      return {
        transactionId: String(transaction.resolved?.transaction.id),
        actions: actions
      };
    }
  } catch (error) {
    console.error('Transaction error:', error);
    throw new Error('Failed to perform transaction: ' + error.message);
  }
};

// Main hook to manage session
const useSession = () => {
  const [session, setSession] = useState(null);
  const [error, setError] = useState(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [storedAccounts, setStoredAccounts] = useState([]);
  const navigate = useNavigate();

  // Save session to localStorage
  const saveSessionToLocal = useCallback(async (sessionToSave) => {
    try {
      saveSession(sessionToSave); // Save session via sessionKit
      console.log('Session saved to localStorage:', sessionToSave);
    } catch (err) {
      console.error('Error saving session to localStorage:', err);
    }
  }, []);

  // Handle restoring session automatically or switching accounts
  const handleRestoreSession = useCallback(async () => {
    try {
      // Automatically restore the last active session
      const restoredSession = await sessionKit.restore();
      if (restoredSession) {
        setSession(restoredSession);
        console.log('Session restored from SessionKit:', restoredSession);
      } else {
        console.log('No session found. Attempting to restore from localStorage.');
        const storedSession = localStorage.getItem('userSession');
        if (storedSession) {
          const parsedSession = JSON.parse(storedSession);
          const result = await sessionKit.restore(parsedSession); // Try restoring from localStorage
          if (result) {
            setSession(result);
            console.log('Session restored from localStorage:', result);
          }
        }
      }
    } catch (err) {
      console.error('Error restoring session:', err);
      setError('Failed to restore session');
    }
  }, []);

  // Handle the login process
  const handleLogin = useCallback(async () => {
    try {
      const result = await sessionKit.login();

      if (result && result.session) {
        console.log('Session established:', result.session);
        setSession(result.session);
        await saveSessionToLocal(result.session);
      } else if (result && result.context) {
        const accounts = await getAllAccounts();
        if (accounts.length > 0) {
          setStoredAccounts(accounts);
          setModalOpen(true);
        } else {
          console.error('No accounts found.');
          setError('No accounts found in the wallet.');
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed due to an unknown error');
      console.error('Login error:', err);
    }
  }, [saveSessionToLocal]);

  // Handle selecting an account (multi-account support)
  const handleAccountSelect = useCallback(async (selectedAccount) => {
    try {
      const restoredSession = await sessionKit.restore({
        actor: selectedAccount.accountName,
        permission: 'active',
        chainId: selectedAccount.chainId,
      });

      if (restoredSession) {
        setSession(restoredSession);
        await saveSessionToLocal(restoredSession);
        console.log('Account selected and session saved:', restoredSession);
        setModalOpen(false);
      } else {
        console.error('Failed to restore session for selected account.');
        setError('Failed to restore session for selected account.');
      }
    } catch (err) {
      console.error('Error restoring session for selected account:', err);
      setError('Error restoring session for selected account.');
    }
  }, [saveSessionToLocal]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      if (session) {
        await sessionKit.logout(session); // Pass the current session to selectively remove it
        setSession(null);
        clearSession(); // Remove session from localStorage
        console.log('User logged out successfully.');

        // Try navigating using `navigate` first
        navigate('/TomatoFarmGame');

        // Fallback: if navigate doesn't work, force redirect
        setTimeout(() => {
          window.location.href = '/TomatoFarmGame';
        }, 500);
        
      } else {
        console.warn('No active session to log out.');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  }, [session, navigate]);

  // Initialize session on app startup
  useEffect(() => {
    handleRestoreSession();
  }, [handleRestoreSession]);

  return { 
    session, 
    handleLogin, 
    handleLogout, 
    error, 
    isModalOpen, 
    storedAccounts, 
    handleAccountSelect 
  };
};

export default useSession;
