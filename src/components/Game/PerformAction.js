import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import '../../styles/PerformAction.css';
import PlantSeeds from '../actionComponents/PlantSeeds';
import WaterPlants from '../actionComponents/WaterPlants';
import HarvestCrops from '../actionComponents/HarvestCrops';
import SellCrops from '../actionComponents/SellCrops';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const PerformAction = ({ session, action, userPlots = [], selectedNFTs, setSelectedNFTs }) => {
  const [nftDetails, setNftDetails] = useState([]);
  const [plotStatus, setPlotStatus] = useState([]);
  const [loadingPlots, setLoadingPlots] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the user's NFTs
  const fetchUserNFTs = useCallback(async () => {
    if (!session?.actor) return;
    try {
      const response = await fetch(`${API_BASE_URL}/nfts/${session.actor}`);
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setNftDetails(data.nfts || []);
    } catch (error) {
      console.error('Error fetching NFTs:', error);
    }
  }, [session]);

  // Fetch the user's plots
  const fetchUserPlots = useCallback(async () => {
    if (!session?.actor) return;

    setLoadingPlots(true);
    try {
      const response = await fetch(`${API_BASE_URL}/plots/${session.actor}`);
      if (!response.ok) {
        if (response.status === 404) {
          setPlotStatus([]); // No plots found, return empty array
          return;
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }

      const data = await response.json();
      setPlotStatus(data.plots || []);
    } catch (error) {
      setError(error.message);
      console.error("Error fetching plot status:", error);
    } finally {
      setLoadingPlots(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      fetchUserNFTs();
      fetchUserPlots();
    }
  }, [session, fetchUserNFTs, fetchUserPlots]);

  // Function to render NFT selection dropdown
  const renderNFTSelect = (type, title, templateId) => {
    const relevantNFTs = nftDetails.filter(nft => nft.template.template_id === templateId);
    const selectedNFT = nftDetails.find(nft => nft.asset_id === selectedNFTs[type]);

    const handleNFTChange = (e) => {
      const selectedValue = e.target.value;
      setSelectedNFTs(prev => ({ ...prev, [type]: selectedValue }));
    };

    return (
      <Card className="nft-display">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            onChange={handleNFTChange}
            value={selectedNFTs[type] || ''}  // Default to empty string (No pre-selection)
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>Select {title}</option>
            {relevantNFTs.map(nft => (
              <option key={nft.asset_id} value={nft.asset_id}>
                Issue: {nft.template_mint || 'Unknown'}
              </option>
            ))}
          </select>

          {selectedNFT && (
            <>
              <img
                src={`https://ipfs.io/ipfs/${selectedNFT?.data?.img}`}
                alt={`Selected ${title}`}
                className="nft-image"
              />
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Render plot selection dropdown
  const renderPlotSelect = () => {
    const handlePlotChange = (e) => {
      const selectedValue = e.target.value;
      setSelectedNFTs(prev => ({ ...prev, plotId: selectedValue }));
    };

    return (
      <div className="plot-select">
        <label>Select Plot</label>
        <select
          onChange={handlePlotChange}
          value={selectedNFTs.plotId || ''}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select Plot</option>
          {plotStatus.length > 0 ? (
            plotStatus.map(plot => (
              <option key={plot.plot_id} value={plot.plot_id}>
                Plot ID: {plot.plot_id} {plot.has_planted_seeds ? "(Seeds Planted)" : ""} {plot.has_watered_plants ? "(Watered)" : ""} {plot.has_harvested_crops ? "(Harvested)" : ""}
              </option>
            ))
          ) : (
            <option value="" disabled>No plots available</option>
          )}
        </select>
      </div>
    );
  };

  // Render the action component based on the selected action
  const renderActionComponent = () => {
    switch (action) {
      case 'plantseeds':
        return (
          <>
            {renderPlotSelect()}
            <div className="nft-select-row flex-row">
              {renderNFTSelect('seed', 'Beatz Seeds', '653266')}
              {renderNFTSelect('compost', 'Compost Soil', '653267')}
            </div>
            <PlantSeeds session={session} plotId={selectedNFTs.plotId} selectedNFTs={selectedNFTs} />
          </>
        );
      case 'waterplants':
        return (
          <>
            {renderPlotSelect()}
            <div className="nft-select-row flex-row">
              {renderNFTSelect('wateringCan', 'Watering Can', '653268')}
            </div>
            <WaterPlants session={session} plotId={selectedNFTs.plotId} selectedNFTs={selectedNFTs} />
          </>
        );
      case 'harvest':
        return (
          <>
            {renderPlotSelect()}
            <HarvestCrops session={session} plotId={selectedNFTs.plotId} />
          </>
        );
      case 'sellcrops':
        return (
          <>
            {renderPlotSelect()}
            <SellCrops session={session} plotId={selectedNFTs.plotId} />
          </>
        );
      default:
        return <p>No valid action selected.</p>;
    }
  };

  return (
    <div className="perform-action">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {action ? `Performing: ${action.charAt(0).toUpperCase() + action.slice(1)}` : 'Select an Action'}
      </h2>
      {renderActionComponent()}
    </div>
  );
};

export default PerformAction;
