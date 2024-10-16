import React, { useState, useEffect, useCallback } from 'react';
import PlantSeeds from '../actionComponents/PlantSeeds';
import WaterPlants from '../actionComponents/WaterPlants';
import HarvestCrops from '../actionComponents/HarvestCrops';
import SellCrops from '../actionComponents/SellCrops';
import RefillCan from '../actionComponents/RefillCan';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import '../../styles/PerformAction.css';

const PerformAction = ({ session, action, userPlots = [], selectedNFTs, setSelectedNFTs }) => {
  const [plotId, setPlotId] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState([]);

  const fetchUserNFTs = useCallback(async () => {
    if (!session?.actor) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/nfts/${session.actor}`);
      if (!response.ok) {
        setStatus('Error fetching NFTs');
        return;
      }
      const data = await response.json();
      setNftDetails(data.nfts || []);
      console.log("Fetched NFTs for selection: ", data.nfts);

      // Automatically select the first NFT if only one is available
      if (data.nfts.length === 1) {
        setSelectedNFTs({
          seed: data.nfts[0].asset_id,
          compost: data.nfts[0].asset_id, // Adjust based on the role of the NFT
        });
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setStatus('Error fetching NFTs');
    }
  }, [session, setSelectedNFTs]);

  useEffect(() => {
    if (session) {
      fetchUserNFTs();
    }
  }, [session, fetchUserNFTs]);

  useEffect(() => {
    const relevantSeeds = nftDetails.filter(nft => nft.template.template_id === '653266');
    const relevantCompost = nftDetails.filter(nft => nft.template.template_id === '653267');
    
    if (relevantSeeds.length === 1) {
      setSelectedNFTs(prev => ({ ...prev, seed: relevantSeeds[0].asset_id }));
    }
    if (relevantCompost.length === 1) {
      setSelectedNFTs(prev => ({ ...prev, compost: relevantCompost[0].asset_id }));
    }
  }, [nftDetails, setSelectedNFTs]);

  const handlePlantSeeds = async () => {
    setIsLoading(true);
    setStatus('Planting seeds, please wait...');

    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'plantseeds',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
          seed_nft_id: selectedNFTs.seed,
          compost_nft_id: selectedNFTs.compost
        }
      };

      await session.transact({ actions: [actionData] });
      setStatus('Seeds planted successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatus(`Action failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async () => {
    switch (action) {
      case 'plantseeds':
        await handlePlantSeeds();
        break;
      case 'waterplants':
        await WaterPlants({ session, plotId, selectedNFTs });
        setStatus('Plants watered successfully!');
        break;
      case 'harvest':
        await HarvestCrops({ session, plotId });
        setStatus('Crops harvested successfully!');
        break;
      case 'sellcrops':
        await SellCrops({ session, plotId });
        setStatus('Crops sold successfully!');
        break;
      case 'refillcan':
        await RefillCan({ session, selectedNFTs });
        setStatus('Watering can refilled successfully!');
        break;
      default:
        setStatus('No action selected.');
    }
  };

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

  const renderNFTSelect = (type, title, templateId) => {
    const relevantNFTs = nftDetails.filter(nft => nft.template.template_id === templateId);
    const selectedNFT = nftDetails.find(nft => nft.asset_id === selectedNFTs[type]);

    const issueNumber = selectedNFT?.template_mint || 'Unknown'; // Use 'template_mint' for issue number

    return (
      <Card className="nft-display">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            onChange={(e) => setSelectedNFTs(prev => ({ ...prev, [type]: e.target.value }))}
            value={selectedNFTs[type] || (relevantNFTs.length === 1 && relevantNFTs[0].asset_id)}  // Automatically set if only one NFT
            className="w-full p-2 border rounded"
          >
            <option value="" disabled>Select {title}</option>
            {relevantNFTs.map(nft => (
              <option key={nft.asset_id} value={nft.asset_id}>
                Issue: {nft.template_mint || 'Unknown'}
              </option>
            ))}
          </select>

          {/* Render image if the NFT is selected */}
          {selectedNFT && (
            <img
              src={`https://ipfs.io/ipfs/${selectedNFT?.data?.img}`}
              alt={`Selected ${title}`}
              className="nft-image"
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="perform-action">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {action ? `Performing: ${action.charAt(0).toUpperCase() + action.slice(1)}` : 'Select an Action'}
      </h2>

      {isLoading && <p>Loading...</p>}
      {status && <p>{status}</p>}

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
        <button onClick={handleAction} className="action-button">
          Execute {action}
        </button>
      </div>
    </div>
  );
};

export default PerformAction;
