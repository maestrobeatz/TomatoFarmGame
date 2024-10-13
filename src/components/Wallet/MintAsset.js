// MintAsset.js

import React, { useState } from 'react';
import { mintAsset } from '../../services/walletApi'; // Removed unused imports

const MintAsset = ({ accountName }) => {
  const [templateId, setTemplateId] = useState('');

  const handleMint = async () => {
    try {
      await mintAsset(accountName, templateId);
      alert('Asset minted successfully');
    } catch (error) {
      alert('Error minting asset: ' + error.message);
    }
  };

  return (
    <div className="mint-asset">
      <h3>Mint Asset</h3>
      <input
        type="text"
        placeholder="Enter template ID"
        value={templateId}
        onChange={(e) => setTemplateId(e.target.value)}
      />
      <button onClick={handleMint}>Mint Asset</button>
    </div>
  );
};

export default MintAsset;
