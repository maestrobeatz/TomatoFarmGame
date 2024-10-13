import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CryptoJS from 'crypto-js';
import AccountSelectionModal from './AccountSelectionModal'; // Modal component for account selection
import { getAllAccounts } from './indexedDB'; // IndexedDB functions to fetch accounts
import SignTransaction from './SignTransaction'; // Import SignTransaction to handle signing
import './WalletModal.css';

const MaestroWalletLogin = ({ handleLoginSuccess, isLoading, result }) => {
  const [blockchainAccountName, setBlockchainAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [storedAccounts, setStoredAccounts] = useState([]);
  const [walletSession, setWalletSession] = useState(null); // For holding wallet session data
  const [isSigning, setIsSigning] = useState(false); // Control for SignTransaction

  // Load the session on component mount
  useEffect(() => {
    const storedAccount = sessionStorage.getItem('blockchainAccountName');
    if (storedAccount) {
      setBlockchainAccountName(storedAccount);
      setLoggedIn(true);
    }
  }, []);

  // Handle login logic (decrypt the stored password and validate)
  const handleLogin = async () => {
    if (!password) {
      setErrorMessage('Please enter a valid password');
      return;
    }

    try {
      const encryptedPassword = localStorage.getItem('encryptedPassword');
      if (!encryptedPassword) {
        setErrorMessage('No password found. Please set up the wallet.');
        return;
      }

      const decryptedStoredPassword = CryptoJS.AES.decrypt(encryptedPassword, 'maestro_wallet_key').toString(CryptoJS.enc.Utf8);
      if (decryptedStoredPassword !== password) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      const accounts = await getAllAccounts(); // Fetch stored accounts

      console.log('Fetched accounts:', accounts); // Log fetched accounts

      if (accounts.length > 1) {
        console.log('Multiple accounts found, opening modal'); // Log when multiple accounts found
        setStoredAccounts(accounts);  // Set the accounts to the state
        setIsModalOpen(true);  // Open the modal
      } else if (accounts.length === 1) {
        console.log('One account found, directly selecting:', accounts[0]);
        handleAccountSelect(accounts[0]);  // Directly select the only available account
      } else {
        setErrorMessage('No accounts found. Please set up an account.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    }
  };

  // Handle account selection from modal
  const handleAccountSelect = async (selectedAccount) => {
    try {
      console.log('Selected account:', selectedAccount); // Log selected account
      setBlockchainAccountName(selectedAccount.accountName);
      setLoggedIn(true);

      sessionStorage.setItem('blockchainAccountName', selectedAccount.accountName);
      setWalletSession({
        accountName: selectedAccount.accountName,
        publicKey: selectedAccount.publicKey,
      });

      // Trigger SignTransaction component for login challenge
      setIsSigning(true);  // This will trigger the SignTransaction component to appear

      setIsModalOpen(false);  // Close the modal
      setErrorMessage('');
    } catch (error) {
      console.error('Error during account selection:', error);
      setErrorMessage('Error selecting account.');
    }
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setBlockchainAccountName('');
    setPassword('');
    sessionStorage.removeItem('blockchainAccountName');
  };

  // Handle signing of the login challenge
  const handleTransactionSigned = (signedTransaction) => {
    // Handle success after transaction is signed
    console.log('Signed Transaction:', signedTransaction);
    // Proceed to log in or any next step after signing
    handleLoginSuccess(walletSession.accountName);
    setIsSigning(false);  // Close the signing interface
  };

  return (
    <div className="wallet-modal-section">
      <h3>{loggedIn ? `Welcome, ${blockchainAccountName}` : 'Login to Maestro Wallet'}</h3>
      {!loggedIn ? (
        <>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
          />
          <Button onClick={handleLogin} className="login-button" disabled={isLoading || !password.trim()}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
          {errorMessage && <p className="result-message">{errorMessage}</p>}
        </>
      ) : (
        <>
          <Button onClick={handleLogout} className="logout-button" disabled={isLoading}>
            Logout
          </Button>
        </>
      )}
      {result && <p className="result-message">{result}</p>}

      {/* Modal for account selection */}
      {isModalOpen && (
        <AccountSelectionModal
          accounts={storedAccounts}
          onSelect={handleAccountSelect}
          onClose={() => setIsModalOpen(false)}
        />
      )}

      {/* Show the SignTransaction component for signing login challenge */}
      {isSigning && (
        <SignTransaction
          walletSession={walletSession}
          isLogin={true}
          onTransactionSigned={handleTransactionSigned}
        />
      )}
    </div>
  );
};

export default MaestroWalletLogin;
