import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import walletApi from './walletApi/walletApi'; // Use walletApi for creating the Maestro Wallet

const AccountCreation = ({ blockchainAccountName, publicKey, privateKey, setBlockchainAccountName, setResult, isLoading }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const createMaestroWallet = async () => {
    if (password !== confirmPassword) {
      setResult('Passwords do not match.');
      return;
    }
    try {
      // Sending privateKey, publicKey, and accountName to backend using walletApi
      const response = await walletApi.createMaestroWallet(blockchainAccountName, publicKey, privateKey, password);
      setResult(`Maestro Wallet account created: ${response.message}`);
    } catch (error) {
      setResult(`Error creating Maestro Wallet: ${error.message}`);
    }
  };

  return (
    <div className="wallet-modal-section">
      <h3>Create Maestro Wallet</h3>
      <input
        type="text"
        placeholder="Blockchain account name"
        value={blockchainAccountName}
        onChange={(e) => setBlockchainAccountName(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Enter password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="password"
        placeholder="Confirm password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={createMaestroWallet} className="create-wallet-button" disabled={isLoading}>
        {isLoading ? 'Creating Maestro Wallet...' : 'Create Maestro Wallet'}
      </Button>
    </div>
  );
};

export default AccountCreation;
