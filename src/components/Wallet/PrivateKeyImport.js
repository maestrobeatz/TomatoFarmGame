import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import { PrivateKey } from 'eosjs-ecc';
import walletFacade from './walletApi/walletApi'; // Import walletFacade

const PrivateKeyImport = ({ password, handleNextStep }) => {
  const [importedPrivateKey, setImportedPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [accountName, setAccountName] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImportedPrivateKeyChange = (e) => setImportedPrivateKey(e.target.value);

  const derivePublicKeyAndAccount = async () => {
    if (!importedPrivateKey.trim()) {
      setResult('Please enter a valid private key.');
      return;
    }

    setIsLoading(true);
    try {
      const privateKey = PrivateKey.fromString(importedPrivateKey);
      const derivedPublicKey = privateKey.toPublic().toString();

      setPublicKey(derivedPublicKey);

      // Fetch account name from the blockchain
      const derivedAccountName = await walletFacade.fetchAccountName(derivedPublicKey);
      if (derivedAccountName) {
        setAccountName(derivedAccountName);
        setResult(`Account found: ${derivedAccountName}`);
      } else {
        setResult('No blockchain account found for this public key.');
      }
    } catch (error) {
      setResult(`Invalid private key or error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const confirmImport = async () => {
    try {
      // Encrypt and store the private key and account info
      await walletFacade.encryptAndStorePrivateKey(importedPrivateKey, password, publicKey, accountName);
      setResult('Key imported successfully!');
      handleNextStep(); // Move to the next step in the flow
    } catch (error) {
      setResult(`Failed to store key: ${error.message}`);
    }
  };

  return (
    <div>
      <h3>Import Private Key</h3>
      <input
        type="text"
        placeholder="Enter your private key"
        value={importedPrivateKey}
        onChange={handleImportedPrivateKeyChange}
        disabled={isLoading}
      />
      <Button onClick={derivePublicKeyAndAccount} disabled={isLoading || !importedPrivateKey.trim()}>
        {isLoading ? 'Processing...' : 'Import Key'}
      </Button>
      {publicKey && <p>Public Key: {publicKey}</p>}
      {accountName && (
        <div>
          <h4>Account Name: {accountName}</h4>
          <Button onClick={confirmImport} disabled={isLoading}>Confirm Import</Button>
        </div>
      )}
      {result && <p>{result}</p>}
    </div>
  );
};

export default PrivateKeyImport;
