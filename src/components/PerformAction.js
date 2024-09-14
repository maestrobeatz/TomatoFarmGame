import React, { useState, useEffect, useCallback } from 'react';
import PlantSeeds from './actionComponents/PlantSeeds';
import WaterPlants from './actionComponents/WaterPlants';
import HarvestCrops from './actionComponents/HarvestCrops';
import SellCrops from './actionComponents/SellCrops';
import RefillCan from './actionComponents/RefillCan';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import './PerformAction.css';

const PerformAction = ({ session, action, userPlots = [], selectedNFTs, setSelectedNFTs }) => {
  const [plotId, setPlotId] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState([]); // Hold NFT details

  // Fetch user NFTs for selection
  const fetchUserNFTs = useCallback(async () => {
    if (!session?.actor) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/nfts/${session.actor}`);
      if (!response.ok) {
        setStatus('Error fetching NFTs');
        return;
      }
      const data = await response.json();
      setNftDetails(data.nfts || []); // Store NFT details
      console.log("Fetched NFTs for selection: ", data.nfts); // Log to check the NFTs
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setStatus('Error fetching NFTs');
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUserNFTs();
    }
  }, [session, fetchUserNFTs]);

  // Render plot selection
  const renderPlotSelect = () => (
    <Card className="plot-select">
      <CardHeader>
        <CardTitle>Select Plot</CardTitle>
      </CardHeader>
      <CardContent>
        <select
          onChange={(e) => setPlotId(e.target.value)}
          value={plotId || ''}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select Plot</option>
          {userPlots.length > 0 ? (
            userPlots.map(plot => (
              <option key={plot.plot_id} value={plot.plot_id}>
                Plot ID: {plot.plot_id} {plot.has_planted_seeds ? "(Seeds Planted)" : ""} {plot.has_watered_plants ? "(Watered)" : ""} {plot.has_harvested_crops ? "(Harvested)" : ""}
              </option>
            ))
          ) : (
            <option value="" disabled>No plots available</option>
          )}
        </select>
      </CardContent>
    </Card>
  );

  // Render NFT dropdown
  const renderNFTSelect = (type, title, templateId) => (
    <Card className="nft-display">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <select 
          onChange={(e) => setSelectedNFTs(prev => ({ ...prev, [type]: e.target.value }))}
          value={selectedNFTs[type]} 
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select {title}</option>
          {nftDetails.filter(nft => nft.template.template_id === templateId).map(nft => (
            <option key={nft.asset_id} value={nft.asset_id}>
              Issued: {nft.data.issued} - Asset ID: {nft.asset_id}
            </option>
          ))}
        </select>
        {selectedNFTs[type] && (
          <img
            src={nftDetails.find(nft => nft.asset_id === selectedNFTs[type])?.data.img}
            alt={`Selected ${title}`}
            className="nft-image"
          />
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="perform-action">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {action ? action.charAt(0).toUpperCase() + action.slice(1) : ''}
      </h2>

      {/* Render plot selection for actions */}
      {['plantseeds', 'waterplants', 'harvest', 'sellcrops'].includes(action) && renderPlotSelect()}

      <div className="nft-display-container">
        {action === 'plantseeds' && (
          <>
            {renderNFTSelect('seed', 'Beatz Seeds', '653266')}
            {renderNFTSelect('compost', 'Compost Soil', '653267')}
          </>
        )}
        {action === 'waterplants' && renderNFTSelect('wateringCan', 'Watering Can', '653268')}
      </div>

      <div className="action-container">
        {action === 'plantseeds' && (
          <PlantSeeds
            session={session}
            plotId={plotId}
            selectedNFTs={selectedNFTs}
            setSelectedNFTs={setSelectedNFTs}
            userPlots={userPlots}
          />
        )}
        {action === 'waterplants' && (
          <WaterPlants
            session={session}
            plotId={plotId}
            selectedNFTs={selectedNFTs}
            userPlots={userPlots}
          />
        )}
        {action === 'harvest' && (
          <HarvestCrops
            session={session}
            plotId={plotId}
            userPlots={userPlots}
          />
        )}
        {action === 'sellcrops' && (
          <SellCrops
            session={session}
            plotId={plotId}
            userPlots={userPlots}
          />
        )}
        {action === 'refillcan' && (
          <RefillCan
            session={session}
            selectedNFTs={selectedNFTs}
          />
        )}
      </div>
    </div>
  );
};

export default PerformAction;
