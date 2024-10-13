import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { QRCodeSVG } from 'qrcode.react';
import { PrivateKey } from 'eosjs-ecc';  // Correctly importing PrivateKey
import api from '../api';
import './WalletModal.css'; // Importing the CSS

const WalletModal = ({ show, handleClose }) => {
  const [importedPrivateKey, setImportedPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [blockchainAccountName, setBlockchainAccountName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [result, setResult] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState(''); // Determine whether user is importing or creating account
  const [view, setView] = useState('login'); // views: login, create, create-blockchain

  const handleImportedPrivateKeyChange = (e) => setImportedPrivateKey(e.target.value);
  const handleUsernameChange = (e) => setBlockchainAccountName(e.target.value);
  const handlePasswordChange = (e) => setPassword(e.target.value);
  const handleConfirmPasswordChange = (e) => setConfirmPassword(e.target.value);

  // Function to derive public key from the imported private key
  const derivePublicKey = async () => {
    setIsLoading(true);
    try {
      const privateKey = PrivateKey.fromString(importedPrivateKey);
      const derivedPublicKey = privateKey.toPublic().toString();
      setPublicKey(derivedPublicKey);
      setResult(`Public key derived successfully: ${derivedPublicKey}`);

      // Now fetch blockchain account info
      const accountInfo = await api.getAccountInfo(derivedPublicKey);
      if (accountInfo && accountInfo.accountNames && accountInfo.accountNames.length > 0) {
        setBlockchainAccountName(accountInfo.accountNames[0]);
        setResult(`Account found: ${accountInfo.accountNames[0]}`);
      } else {
        setBlockchainAccountName('');
        setResult('No account found for this public key.');
      }
    } catch (error) {
      setResult(`Error deriving public key: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a blockchain account (WAX Test Account)
  const createBlockchainAccount = async () => {
    setIsLoading(true);
    try {
      const response = await api.createWaxAccount(blockchainAccountName, publicKey, password);
      setResult(`Blockchain account created successfully: ${response.accountName}`);
      setPublicKey(response.publicKey);  // Set the public key received from the API
      setBlockchainAccountName(response.accountName);  // Set the blockchain account name
    } catch (error) {
      setResult(`Error creating blockchain account: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create a Maestro Wallet account
  const createMaestroWallet = async () => {
    if (password !== confirmPassword) {
      setResult('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await api.createMaestroWallet(blockchainAccountName, publicKey, password);
      setResult(`Maestro Wallet account created successfully: ${response.message}`);
    } catch (error) {
      setResult(`Error creating Maestro Wallet account: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Search for Maestro Wallet account based on the blockchain account name
  const searchMaestroWalletAccount = async () => {
    setIsLoading(true);
    try {
      setResult('Searching for Maestro Wallet account...');
      const response = await api.getMaestroWalletAccount(blockchainAccountName); // Adjust API as needed

      if (response && response.accountFound) {
        setResult(`Maestro Wallet account found for ${blockchainAccountName}. Please enter your password.`);
        setShowPasswordFields(true); // Show password field after account is found
      } else {
        setResult(`No Maestro Wallet account found for ${blockchainAccountName}.`);
        setShowPasswordFields(false);
      }
    } catch (error) {
      setResult(`Error searching for Maestro Wallet account: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle login
  const handleLogin = async () => {
    if (!blockchainAccountName || !password) {
      setResult('Please provide both the account name and password.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await api.loginMaestroWallet(blockchainAccountName, password);
      setResult(`Login successful: ${result.message}`);
    } catch (error) {
      setResult(`Error during login: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} backdrop="static" centered>
      <div className="wallet-modal-container">
        <Modal.Header>
          <Modal.Title>Maestro Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="wallet-modal-options">
            <button className="wallet-option-button" onClick={() => setView('login')}>
              Login
            </button>
            <button className="wallet-option-button" onClick={() => setView('create')}>
              Create Account
            </button>
          </div>

          {/* Login Section */}
          {view === 'login' && (
            <div className="wallet-modal-section">
              <h3>Login to Maestro Wallet</h3>
              <input
                type="text"
                placeholder="Enter blockchain account name"
                value={blockchainAccountName}
                onChange={handleUsernameChange}
                disabled={isLoading || showPasswordFields}
              />
              <Button
                onClick={searchMaestroWalletAccount}
                className="search-account-button"
                disabled={isLoading || showPasswordFields}
              >
                {isLoading ? 'Searching...' : 'Search Maestro Wallet Account'}
              </Button>

              {showPasswordFields && (
                <>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                  <Button onClick={handleLogin} className="login-button" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </>
              )}
              {result && <p className="result-message">{result}</p>}
            </div>
          )}

          {/* Create Account Section */}
          {view === 'create' && (
            <div className="wallet-modal-section">
              <h3>Create Maestro Wallet</h3>
              <div className="wallet-modal-options">
                <button className="wallet-option-button" onClick={() => setMode('import')}>
                  Import Private Key
                </button>
                <button className="wallet-option-button" onClick={() => setMode('create-blockchain')}>
                  Create WAX Test Account
                </button>
              </div>

              {/* Import Keys section */}
              {mode === 'import' && !publicKey && (
                <>
                  <h4>Import Private Key</h4>
                  <input
                    type="text"
                    placeholder="Enter existing private key"
                    value={importedPrivateKey}
                    onChange={handleImportedPrivateKeyChange}
                    disabled={isLoading}
                  />
                  <Button onClick={derivePublicKey} className="derive-public-key-button" disabled={isLoading}>
                    {isLoading ? 'Processing...' : 'Derive Public Key'}
                  </Button>
                  {publicKey && (
                    <>
                      <p>Derived Public Key: {publicKey}</p>
                      <p>Blockchain Account: {blockchainAccountName || 'No account found'}</p>
                    </>
                  )}
                  {result && <p className="result-message">{result}</p>}
                </>
              )}

              {/* Blockchain account creation */}
              {mode === 'create-blockchain' && (
                <>
                  <h4>Create WAX Test Account</h4>
                  <input
                    type="text"
                    placeholder="Blockchain account name"
                    value={blockchainAccountName}
                    onChange={handleUsernameChange}
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={isLoading}
                  />
                  <Button onClick={createBlockchainAccount} className="create-blockchain-account-button" disabled={isLoading}>
                    {isLoading ? 'Creating Blockchain Account...' : 'Create WAX Test Account'}
                  </Button>
                  {result && <p className="result-message">{result}</p>}
                </>
              )}

              {/* Create Wallet after Blockchain Account is Created */}
              {blockchainAccountName && !showPasswordFields && publicKey && (
                <>
                  <input
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={handlePasswordChange}
                    disabled={isLoading}
                  />
                  <input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    disabled={isLoading}
                  />
                  <Button onClick={createMaestroWallet} className="create-wallet-button" disabled={isLoading}>
                    {isLoading ? 'Creating Maestro Wallet...' : 'Create Maestro Wallet'}
                  </Button>
                </>
              )}
              {result && <p className="result-message">{result}</p>}
            </div>
          )}
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
