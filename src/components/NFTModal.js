// NFTModal.js
import React from 'react';
import './NFTModal.css';

const NFTModal = ({ nft, onClose }) => {
  if (!nft || !nft.metadata || !nft.metadata.deserialized) return null;

  const { name, image, description } = nft.metadata.deserialized;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-button" onClick={onClose}>&times;</span>
        <h2>{name || 'Unknown Name'}</h2>
        <img src={image ? `https://ipfs.io/ipfs/${image}` : 'fallback_image_url'} alt={name || 'Unknown'} />
        <div className="nft-details">
          <p><strong>Template ID:</strong> {nft.template_id}</p>
          <p><strong>Count:</strong> {nft.count}</p>
          <p><strong>Description:</strong> {description || 'No description available'}</p>
        </div>
      </div>
    </div>
  );
};

export default NFTModal;
