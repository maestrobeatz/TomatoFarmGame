import React, { useEffect, useState } from 'react';
import './NFTList.css';
import NFTModal from './NFTModal';

const NFTList = ({ actor }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedName, setSelectedName] = useState('');

  // Log the received actor
  useEffect(() => {
    console.log('Actor received in NFTList:', actor); // Log actor

    const fetchNFTs = async () => {
      if (!actor) {
        setError('Actor is not defined');
        return;
      }

      setLoading(true);
      setError(null); // Reset error state

      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/nfts/${actor}`);
        console.log('API Call URL:', `${process.env.REACT_APP_API_BASE_URL}/nfts/${actor}`); // Log API call
        if (!response.ok) {
          throw new Error(`Error fetching NFTs: ${response.statusText}`);
        }
        const data = await response.json();
        console.log('NFT Data Received:', data); // Log the received data
        if (data && Array.isArray(data.nfts)) {
          setNfts(data.nfts);
        } else {
          setError('No NFTs found');
        }
      } catch (e) {
        console.error('Error fetching NFTs:', e);
        setError('Failed to fetch NFTs');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [actor]);

  const handleNFTClick = (nft) => {
    setSelectedNFT(nft);
  };

  const closeModal = () => {
    setSelectedNFT(null);
  };

  // Group NFTs by name and count them
  const groupedNFTs = nfts.reduce((acc, nft) => {
    const name = nft.data.name;
    if (!acc[name]) {
      acc[name] = { ...nft, count: 0 };
    }
    acc[name].count += 1;
    return acc;
  }, {});

  const filteredNFTs = Object.values(groupedNFTs).filter(nft =>
    selectedName === '' || nft.data.name === selectedName
  );

  const uniqueNames = Object.keys(groupedNFTs);

  return (
    <div className="nft-list">
      <h2>Your NFTs from the maestrobeatz collection:</h2>
      <div className="nft-filters">
        <select value={selectedName} onChange={e => setSelectedName(e.target.value)}>
          <option value="">All NFTs</option>
          {uniqueNames.map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      {loading ? (
        <p>Loading NFTs...</p>
      ) : error ? (
        <p>{error}</p>
      ) : filteredNFTs.length > 0 ? (
        <div className="nft-grid">
          {filteredNFTs.map(nft => (
            <div key={nft.asset_id} className="nft-card" onClick={() => handleNFTClick(nft)}>
              <img src={`https://ipfs.io/ipfs/${nft.data.img}`} alt={nft.data.name} />
              <div className="nft-details">
                <h3>{nft.data.name}</h3>
                <p>Template ID: {nft.template.template_id}</p>
                <p>Count: {nft.count}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No NFTs found in the maestrobeatz collection.</p>
      )}
      {selectedNFT && <NFTModal nft={selectedNFT} onClose={closeModal} />}
    </div>
  );
};

export default NFTList;

