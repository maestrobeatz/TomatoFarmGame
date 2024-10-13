import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import CryptoJS from 'crypto-js';  // Import CryptoJS for encryption/decryption

const MaestroWalletLogin = ({ handleLoginSuccess, isLoading, result }) => {
  const [blockchainAccountName, setBlockchainAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      // Retrieve the encrypted password from localStorage
      const encryptedPassword = localStorage.getItem('encryptedPassword');
      if (!encryptedPassword) {
        setErrorMessage('No password found. Please set up the wallet.');
        return;
      }

      // Encrypt the entered password for comparison
      console.log('Verifying the password...');
      const key = CryptoJS.enc.Utf8.parse('maestro_wallet_key');
      const iv = CryptoJS.enc.Utf8.parse('1234567812345678');
      const enteredEncryptedPassword = CryptoJS.AES.encrypt(password, key, { iv: iv }).toString();

      console.log('Stored encrypted password:', encryptedPassword);
      console.log('Entered encrypted password:', enteredEncryptedPassword);

      // Validate the password
      if (enteredEncryptedPassword !== encryptedPassword) {
        setErrorMessage('Incorrect password. Please try again.');
        return;
      }

      // Password is correct, log the user in
      setLoggedIn(true);

      // Call handleLoginSuccess to notify the parent component
      await handleLoginSuccess(blockchainAccountName);

      // Clear any error messages
      setErrorMessage('');

      // Clear password field after successful login
      setPassword('');

    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred during login. Please try again.');
    }
  };

  // Handle logout logic
  const handleLogout = () => {
    setLoggedIn(false);
    setBlockchainAccountName('');
    setPassword('');
    sessionStorage.removeItem('blockchainAccountName');  // Clear session storage
    sessionStorage.removeItem('decryptedPrivateKey');    // Clear private key from session
    sessionStorage.removeItem('encryptedPassword');      // Clear encrypted password
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
    </div>
  );
};

export default MaestroWalletLogin;
