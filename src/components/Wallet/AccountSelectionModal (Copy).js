import React, { useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { getAllAccounts } from './indexedDB';  // Import your indexedDB functions
import walletFacade from './walletApi/walletApi';  // Import walletFacade for signing

const AccountSelectionModal = ({ onSelect, onClose }) => {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [sessionResult, setSessionResult] = useState('');
  const [isStartingSession, setIsStartingSession] = useState(false);

  // Fetch accounts from IndexedDB on mount
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
      setSessionResult('No account selected.');
      return;
    }
    if (!password) {
      setSessionResult('Password is required.');
      return;
    }

    setIsStartingSession(true); // Start session process
    try {
      console.log('Attempting to start session with selected account:', selectedAccount);
      
      // Use walletFacade to decrypt the private key
      const privateKey = await walletFacade.decryptPrivateKey(selectedAccount.publicKey, password);
      if (!privateKey) {
        throw new Error('Failed to decrypt private key');
      }

      // Pass the necessary account information and decrypted private key to WalletPluginMaestro
      const sessionData = {
        actor: selectedAccount.accountName,
        permission: 'active',
        publicKey: selectedAccount.publicKey,
        privateKey: privateKey,
      };

      console.log('Account selected and information passed:', sessionData);

      onSelect(sessionData);  // Notify parent component of session data
      onClose();  // Close the modal
    } catch (error) {
      console.error('Error starting session:', error);
      setSessionResult(`Error starting session: ${error.message}`);
    } finally {
      setIsStartingSession(false);
      setPassword('');  // Clear the password input
    }
  };

  return (
    <>
      <Modal show={true} onHide={onClose} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Select an Account</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loading ? (
            <p>Loading accounts...</p>
          ) : accounts.length > 0 ? (
            <>
              <select onChange={handleAccountSelection} value={selectedAccount?.publicKey || ''} className="account-dropdown">
                <option value="">-- Select an Account --</option>
                {accounts.map(account => (
                  <option key={account.publicKey} value={account.publicKey}>
                    {account.accountName || account.publicKey}
                  </option>
                ))}
              </select>
              <input
                type="password"
                className="form-control mt-3"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </>
          ) : (
            <p>No accounts available</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!selectedAccount || isStartingSession}>
            {isStartingSession ? 'Starting Session...' : 'Confirm'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Result Message */}
      {sessionResult && (
        <div className="result-message mt-3">
          <p>{sessionResult}</p>
        </div>
      )}
    </>
  );
};

export default AccountSelectionModal;
