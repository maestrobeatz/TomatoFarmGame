import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { signTransaction } from './path-to-signing-method'; // Import your actual signing method

const SignTransaction = ({ walletSession, onTransactionSigned, onConfirm, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showTransactionModal, setShowTransactionModal] = useState(true);

  const handleCloseTransactionModal = () => setShowTransactionModal(false);

  const handleAcceptTransaction = async () => {
    try {
      setIsLoading(true);
      console.log('Transaction accepted by user:', walletSession);

      // Prepare session data dynamically
      const sessionData = {
        actor: walletSession.actor,  // Ensure actor is dynamically pulled from session
        permission: walletSession.permission,
        publicKey: walletSession.publicKey,
        privateKey: walletSession.privateKey, // Ensure private key is dynamically pulled from walletSession
        chain: {
          id: walletSession.chainId,  // Use the correct chain ID from session
          url: process.env.REACT_APP_RPC,
        },
        walletPlugin: {
          id: walletSession.walletPluginId || 'default-plugin',  // Dynamically set plugin ID
          data: {
            key: walletSession.publicKey,
          },
        },
      };

      // Ensure all necessary components are present
      if (!sessionData.actor || !sessionData.permission || !sessionData.publicKey || !sessionData.privateKey || !sessionData.chain.id) {
        throw new Error('Missing required session data. Please ensure all fields are provided.');
      }

      // Call the signing function using the session data
      const signedTransaction = await signTransaction(sessionData);  // Use the actual signing method

      // Notify parent component that the transaction has been signed
      if (onTransactionSigned) {
        onTransactionSigned(signedTransaction);
      }

      // Optionally confirm the session
      if (onConfirm) {
        onConfirm(sessionData);
      }

      setResult('Transaction signed successfully.');
    } catch (error) {
      setResult(`Error processing transaction: ${error.message}`);
      if (onError) {
        onError(error);
      }
      console.error('Transaction signing error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectTransaction = () => {
    handleCloseTransactionModal();
    if (onError) {
      onError(new Error('Transaction rejected by user.'));
    }
  };

  return (
    <div className="transaction-signing-section">
      <h3>Sign Transaction</h3>
      {result && <p className="result-message">{result}</p>}

      {/* Transaction Modal */}
      <Modal show={showTransactionModal} onHide={handleCloseTransactionModal} backdrop="static" centered>
        <Modal.Header closeButton>
          <Modal.Title>Transaction Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Do you want to proceed with this transaction?</p>
          <p><strong>Actor:</strong> {walletSession.actor}</p>
          <p><strong>Public Key:</strong> {walletSession.publicKey}</p>
          <p><strong>Chain ID:</strong> {walletSession.chainId}</p>
          <p><strong>Permission:</strong> {walletSession.permission}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleRejectTransaction} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Reject'}
          </Button>
          <Button variant="primary" onClick={handleAcceptTransaction} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Accept'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default SignTransaction;
