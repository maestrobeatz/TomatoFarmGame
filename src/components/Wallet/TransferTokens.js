import React, { useState, useCallback } from 'react';
import Button from 'react-bootstrap/Button';
import walletFacade from './walletApi/walletApi'; // Import the wallet API
import SignatureRequestModal from './SignatureRequestModal';

const TransferTokens = ({ accountsInfo }) => {
  const [selectedAccount, setSelectedAccount] = useState('');
  const [recipientAccount, setRecipientAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMemo, setTransferMemo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState('');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState(null);
  const password = localStorage.getItem('encryptionPassword'); // Fetch stored password for decryption

  // Prepare the transaction details before showing the modal
  const handlePrepareTransaction = useCallback(() => {
    if (!selectedAccount) {
      setResult('Please select an account to transfer from.');
      return;
    }

    // Get account information from accountsInfo using the selected public key
    const selectedAccountInfo = accountsInfo.find(account => account.publicKey === selectedAccount);
    if (!selectedAccountInfo) {
      setResult('Selected account not found.');
      return;
    }

    // Prepare transaction details
    const details = {
      from: selectedAccountInfo.accountName, // Use the account name for the transaction
      to: recipientAccount.trim(),
      amount: transferAmount.trim(),
      memo: transferMemo.trim(),
    };

    setTransactionDetails(details);
    setShowSignatureModal(true); // Show the signature request modal
  }, [selectedAccount, recipientAccount, transferAmount, transferMemo, accountsInfo]);

  // Approve the transaction and sign it with the decrypted private key
  const handleApproveTransaction = async () => {
    setShowSignatureModal(false); // Close modal
    setIsLoading(true);
    setResult('');

    try {
      // Fetch the account from IndexedDB by public key (not private key)
      const account = await walletFacade.getAccountByPublicKey(selectedAccount);
      if (!account) {
        setResult('Error: Account information not found.');
        return;
      }

      // Decrypt the private key using the password
      const privateKey = await walletFacade.decryptPrivateKey(account.publicKey, password); // Decrypt the private key

      // Perform the transfer using the decrypted private key and account name
      const transactionResult = await walletFacade.transferTokens(
        account.accountName, // Use the account name
        transactionDetails.to, // Recipient account name
        transactionDetails.amount, // Amount to transfer
        transactionDetails.memo, // Memo for the transaction
        privateKey // Decrypted private key, used for signing
      );

      // Display the transaction result
      setResult(`Token transfer successful. Transaction ID: ${transactionResult.transaction_id}`);
    } catch (error) {
      setResult(`Error transferring tokens: ${error.message || 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Reject the transaction
  const handleRejectTransaction = () => {
    setShowSignatureModal(false); // Close modal
    setResult('Transaction rejected.');
  };

  return (
    <div className="token-transfer-section">
      <h3>Transfer Tokens</h3>

      <select
        value={selectedAccount}
        onChange={(e) => setSelectedAccount(e.target.value)}
        disabled={isLoading}
      >
        <option value="">Select an account to transfer from</option>
        {accountsInfo.map((account, index) => (
          <option key={index} value={account.publicKey}>
            {account.accountName}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Recipient Account"
        value={recipientAccount}
        onChange={(e) => setRecipientAccount(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="text"
        placeholder="Amount (e.g., 1.0000 WAX)"
        value={transferAmount}
        onChange={(e) => setTransferAmount(e.target.value)}
        disabled={isLoading}
      />
      <input
        type="text"
        placeholder="Memo (optional)"
        value={transferMemo}
        onChange={(e) => setTransferMemo(e.target.value)}
        disabled={isLoading}
      />
      <Button onClick={handlePrepareTransaction} disabled={isLoading || !recipientAccount || !transferAmount}>
        {isLoading ? 'Preparing...' : 'Prepare Transfer'}
      </Button>
      {result && <p className="result-message">{result}</p>}

      {/* Signature Request Modal */}
      {transactionDetails && (
        <SignatureRequestModal
          show={showSignatureModal}
          onApprove={handleApproveTransaction}
          onReject={handleRejectTransaction}
          transactionDetails={transactionDetails}
        />
      )}
    </div>
  );
};

export default TransferTokens;
