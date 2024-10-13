import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const QRCodeDisplay = ({ publicKey, blockchainAccountName }) => {
  const qrData = `PublicKey: ${publicKey}\nBlockchain Account: ${blockchainAccountName}`;

  return (
    <div className="wallet-modal-section">
      <h3>Scan to save your public key and blockchain account</h3>
      <QRCodeSVG value={qrData} size={256} />
      <p>{`Public Key: ${publicKey}`}</p>
      <p>{`Blockchain Account: ${blockchainAccountName}`}</p>
    </div>
  );
};

export default QRCodeDisplay;
