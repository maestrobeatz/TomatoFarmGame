// NFTModal.js
import React from 'react';
import './NFTModal.css';

const NFTModal = ({ nft, onClose }) => {
  if (!nft) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{nft.data.name}</h2>
        <img src={`https://ipfs.io/ipfs/${nft.data.img}`} alt={nft.data.name} />
        <div className="nft-details">
          <p><strong>Template ID:</strong> {nft.template.template_id}</p>
          <p><strong>Count:</strong> {nft.count}</p>
          {/* Add other details as needed */}
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
