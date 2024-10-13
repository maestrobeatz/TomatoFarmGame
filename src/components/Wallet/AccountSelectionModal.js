// AccountSelectionModal.js (as you provided it)

import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getAllAccounts } from './indexedDB';  // Import your indexedDB functions
import CryptoJS from 'crypto-js';  // For decryption

const AccountSelectionModal = ({ onSelect, onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');  // For user-entered password

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const fetchedAccounts = await getAllAccounts();  // Get all accounts from IndexedDB
        setAccounts(fetchedAccounts);
        if (fetchedAccounts.length > 0) {
          setSelectedAccount(fetchedAccounts[0]); // Auto-select the first account
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching accounts:', error);
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  const handleAccountSelection = (event) => {
    const selected = accounts.find(account => account.publicKey === event.target.value);
    setSelectedAccount(selected);
  };

  const handleConfirm = async () => {
    if (!selectedAccount) {
      alert('No account selected.');
      return;
    }

    if (!password) {
      alert('Please enter your password.');
      return;
    }

    try {
      // Decrypt the private key using the provided password
      const decryptedBytes = CryptoJS.AES.decrypt(selectedAccount.encryptedPrivateKey, password);
      const decryptedPrivateKey = decryptedBytes.toString(CryptoJS.enc.Utf8);

      // Pass the necessary account information, including encryptedPrivateKey and password, to the parent component
      onSelect({
        accountName: selectedAccount.accountName,
        publicKey: selectedAccount.publicKey,
        encryptedPrivateKey: selectedAccount.encryptedPrivateKey,
        password: password, // Pass the entered password
      });

      onClose();  // Close the modal
    } catch (error) {
      console.error('Error decrypting private key:', error);
    }
  };

  return (
    <Modal show={true} onHide={onClose} backdrop="static" centered>
      <Modal.Header closeButton>
        <Modal.Title>Select an Account</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Loading accounts...</p>
        ) : (
          <>
            <select onChange={handleAccountSelection} value={selectedAccount?.publicKey || ''}>
              {accounts.map(account => (
                <option key={account.publicKey} value={account.publicKey}>
                  {account.accountName}
                </option>
              ))}
            </select>
            <div>
              <label htmlFor="password">Enter Password to Decrypt Private Key:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AccountSelectionModal;
