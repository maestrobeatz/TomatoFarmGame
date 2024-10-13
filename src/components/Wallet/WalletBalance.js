import React, { useEffect, useState } from 'react';
import walletFacade from './walletApi/walletApi'; // Ensure correct wallet API import
import './WalletBalance.css';

const WalletBalance = ({ passAccountInfo }) => {
  const [accountsInfo, setLocalAccountsInfo] = useState([]); // Local state for accounts
  const [loading, setLoading] = useState(true); // Loading state
  const [errors, setErrors] = useState([]); // Error handling

  // Fetch account resources for all stored accounts
  const fetchAccounts = async () => {
    try {
      // Fetch all accounts (this can be from IndexedDB or a local array)
      const allAccounts = await walletFacade.getAllAccounts();

      // Fetch resources for each account using the fetchAccountResources method
      const accountResources = await Promise.all(
        allAccounts.map(async (account) => {
          try {
            const resources = await walletFacade.fetchAccountResources(account.accountName);
            return {
              ...account,  // Existing account information
              ...resources // Add CPU, NET, RAM, and balance information
            };
          } catch (error) {
            console.error(`Error fetching resources for ${account.accountName}:`, error);
            return {
              ...account,
              balance: 'Error fetching balance',
              cpu: { used: 0, max: 0 },
              net: { used: 0, max: 0 },
              ram: { usage: 0, quota: 0 }
            };
          }
        })
      );

      setLocalAccountsInfo(accountResources); // Set local state with all account details
      passAccountInfo(accountResources); // Pass to parent (WalletModal)
    } catch (error) {
      console.error('Error fetching account resources:', error);
      setErrors((prevErrors) => [...prevErrors, 'Error fetching account resources.']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  if (loading) {
    return <p>Loading account information...</p>;
  }

  if (errors.length > 0) {
    return (
      <div className="error-list">
        <h3>Errors:</h3>
        {errors.map((error, index) => (
          <p key={index}>{error}</p>
        ))}
      </div>
    );
  }

  return (
    <div className="wallet-balance">
      <h2>Total Accounts: {accountsInfo.length}</h2>
      {accountsInfo.length > 0 ? (
        accountsInfo.map((info, index) => (
          <div key={index} className="account-info-item">
            <h2>Account Name: {info.accountName || 'Not available'}</h2>
            <p>Balance: {info.balance || '0.0000 WAX'}</p>
            <p>CPU: {info.cpu?.used || '0'} / {info.cpu?.max || '0'}</p>
            <p>NET: {info.net?.used || '0'} / {info.net?.max || '0'}</p>
            <p>RAM: {info.ram?.usage || '0'} / {info.ram?.quota || '0'}</p>
          </div>
        ))
      ) : (
        <p>No accounts available</p>
      )}
    </div>
  );
};

export default WalletBalance;
