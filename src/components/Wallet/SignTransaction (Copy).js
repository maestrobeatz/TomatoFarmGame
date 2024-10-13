import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import walletFacade from './walletApi/walletApi';  // Use walletFacade for signing transactions

const SignTransaction = ({ transactionToSign, walletSession, onTransactionSigned }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const password = localStorage.getItem('encryptionPassword'); // Get the password from local storage

  const handleSignTransaction = async () => {
    if (!walletSession || !walletSession.publicKey || !transactionToSign) {
      setResult('Unable to sign transaction. Please ensure you are logged in.');
      return;
    }

    setIsLoading(true);
    try {
      // Fetch the account's public key and decrypt the private key from IndexedDB
      const account = await walletFacade.getAccountByPublicKey(walletSession.publicKey); // Get by public key
      if (!account) {
        throw new Error('Account not found in IndexedDB');
      }

      // Decrypt private key
      const privateKey = await walletFacade.decryptPrivateKey(walletSession.publicKey, password);

      // Sign the transaction using the decrypted private key
      const signedTransaction = await walletFacade.signTransaction(walletSession.accountName, transactionToSign, privateKey);
      setResult('Transaction signed successfully');
      onTransactionSigned(signedTransaction);
    } catch (error) {
      setResult(`Error signing transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="transaction-signing-section">
      <h3>Sign Transaction</h3>
      <p>{transactionToSign ? `Transaction: ${transactionToSign.actions[0].name}` : 'No transaction to sign'}</p>
      <Button onClick={handleSignTransaction} disabled={isLoading}>
        {isLoading ? 'Signing...' : 'Sign Transaction'}
      </Button>
      {result && <p className="result-message">{result}</p>}
    </div>
  );
};

export default SignTransaction;
