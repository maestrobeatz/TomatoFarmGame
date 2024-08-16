import React, { useEffect, useState } from 'react';
import './NFTList.css';
import NFTModal from './NFTModal';

const NFTList = ({ actor }) => {
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [selectedName, setSelectedName] = useState('');

  useEffect(() => {
    const fetchNFTs = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/nftCounts/${actor}`);
        if (!response.ok) {
          throw new Error(`Error fetching NFTs: ${response.statusText}`);
        }
        const data = await response.json();
        if (data && data.nfts) {
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

  const filteredNFTs = nfts.filter(nft => 
    selectedName === '' || nft.nft.data.name === selectedName
  );

  const uniqueNames = [...new Set(nfts.map(nft => nft.nft.data.name))];

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
          {filteredNFTs.map(({ nft, count }) => (
            <div key={nft.asset_id} className="nft-card" onClick={() => handleNFTClick(nft)}>
              <img src={`https://ipfs.io/ipfs/${nft.data.img}`} alt={nft.data.name} />
              <div className="nft-details">
                <h3>{nft.data.name}</h3>
                <p>Template ID: {nft.template.template_id}</p>
                <p>Count: {count}</p>
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
