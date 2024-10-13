import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import PrivateKeyImport from './PrivateKeyImport';
import WalletBalance from './WalletBalance';
import TransferTokens from './TransferTokens';
import CryptoJS from 'crypto-js';

import './WalletModal.css';

const WalletModal = ({ show, handleClose }) => {
  const [masterPassword, setMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [view, setView] = useState('password-setup'); // default to password setup
  const [accountsInfo, setAccountsInfo] = useState([]); // To store fetched accounts
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Check for existing wallet session in localStorage on modal open
  useEffect(() => {
    const savedWalletSession = localStorage.getItem('walletSession');
    if (savedWalletSession) {
      const { masterPassword } = JSON.parse(savedWalletSession);
      setMasterPassword(masterPassword);
      setView('account-info'); // Skip login and go directly to account info
    } else {
      const storedEncryptedPassword = localStorage.getItem('encryptedPassword');
      if (storedEncryptedPassword) {
        setView('login'); // If password is already set, show login screen
      } else {
        setView('password-setup'); // Show password setup if no session or password exists
      }
    }
  }, [show]);

  // Encrypt the password with dynamic key, potentially based on the account
  const encryptPassword = (password, account) => {
    const dynamicKey = `${account}_wallet_key`; // Use account info to generate a unique key
    return CryptoJS.AES.encrypt(password, dynamicKey).toString();
  };

  // Verify the password entered by the user
  const verifyPassword = (enteredPassword, account) => {
    const storedEncryptedPassword = localStorage.getItem('encryptedPassword');
    if (!storedEncryptedPassword) return false;
    const dynamicKey = `${account}_wallet_key`; // Use dynamic key for decryption
    const decryptedPassword = CryptoJS.AES.decrypt(storedEncryptedPassword, dynamicKey).toString(CryptoJS.enc.Utf8);
    return decryptedPassword === enteredPassword;
  };

  // Set up the password
  const handleSetPassword = () => {
    if (masterPassword !== confirmPassword) {
      setResult('Passwords do not match. Please try again.');
      return;
    }
    if (masterPassword.trim()) {
      // Use dynamic account-based key
      const account = accountsInfo.length > 0 ? accountsInfo[0].accountName : 'default';
      const encryptedPassword = encryptPassword(masterPassword, account);
      localStorage.setItem('encryptedPassword', encryptedPassword); // Store the encrypted password
      localStorage.setItem('encryptionPassword', masterPassword); // Store the plain password for decrypting keys later
      localStorage.setItem('walletSession', JSON.stringify({ masterPassword, account })); // Save the wallet session
      setView('account-info');
    } else {
      setResult('Please enter a valid password.');
    }
  };

  // Unlock the wallet
  const handleUnlockWallet = () => {
    const account = accountsInfo.length > 0 ? accountsInfo[0].accountName : 'default';
    if (verifyPassword(masterPassword, account)) {
      localStorage.setItem('walletSession', JSON.stringify({ masterPassword, account })); // Save the wallet session
      setView('account-info');
    } else {
      setResult('Incorrect password. Please try again.');
    }
  };

  // Show/hide password
  const handleShowPassword = (type) => {
    if (type === 'password') {
      setPasswordVisible(true);
      setTimeout(() => setPasswordVisible(false), 3000);
    } else if (type === 'confirmPassword') {
      setConfirmPasswordVisible(true);
      setTimeout(() => setConfirmPasswordVisible(false), 3000);
    }
  };

  // Function to get accounts info
  const handleAccountInfo = (info) => {
    setAccountsInfo(info); // Pass account info from WalletBalance to TransferTokens
  };

  const renderView = () => {
    switch (view) {
      case 'login':
        return (
          <div>
            <h3>Login to Your Wallet</h3>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter your password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={() => handleShowPassword('password')}>Show</Button>
            <Button onClick={handleUnlockWallet} disabled={isLoading || !masterPassword.trim()}>
              Unlock Wallet
            </Button>
            {result && <p className="result-message">{result}</p>}
          </div>
        );
      case 'password-setup':
        return (
          <div>
            <h3>Set up your Wallet</h3>
            <input
              type={passwordVisible ? 'text' : 'password'}
              placeholder="Enter a master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={() => handleShowPassword('password')}>Show</Button>
            <input
              type={confirmPasswordVisible ? 'text' : 'password'}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={() => handleShowPassword('confirmPassword')}>Show</Button>
            <Button onClick={handleSetPassword} disabled={isLoading || !masterPassword.trim() || !confirmPassword.trim()}>
              Set Password
            </Button>
            {result && <p className="result-message">{result}</p>}
          </div>
        );
      case 'account-info':
        return (
          <div className="wallet-account-info">
            <WalletBalance passAccountInfo={handleAccountInfo} />
            <Button onClick={() => setView('import-private-key')}>Import Private Key</Button>
            <Button onClick={() => setView('transfer-tokens')} variant="primary">
              Transfer Tokens
            </Button>
          </div>
        );
      case 'import-private-key':
        return (
          <PrivateKeyImport
            password={masterPassword}
            handleNextStep={() => setView('account-info')} // Return to account info after importing
          />
        );
      case 'transfer-tokens':
        return (
          <TransferTokens accountsInfo={accountsInfo} />  // Pass accounts info for token transfer
        );
      default:
        return null;
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <div className="wallet-modal-container">
        <Modal.Header>
          <Modal.Title>Maestro Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderView()}
          {isLoading && <p>Loading...</p>}
          {result && <p className="result-message">{result}</p>}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={isLoading}>
            Close
          </Button>
        </Modal.Footer>
      </div>
    </Modal>
  );
};

export default WalletModal;
	
