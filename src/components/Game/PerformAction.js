import React, { useState, useEffect, useCallback } from 'react';
import PlantSeeds from '../actionComponents/PlantSeeds';
import WaterPlants from '../actionComponents/WaterPlants';
import HarvestCrops from '../actionComponents/HarvestCrops';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import '../../styles/PerformAction.css';
import api from '../api';

const PerformAction = ({ session, action, userPlots = [], selectedNFTs, setSelectedNFTs }) => {
  const [plotId, setPlotId] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState([]);
  const [usesLeft, setUsesLeft] = useState(null); // For tracking watering can uses left

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

  // Fetch the uses left for the selected watering can
  useEffect(() => {
    const fetchWateringCanUses = async () => {
      if (selectedNFTs.wateringCan) {
        try {
          const wateringCanData = await api.getWateringCanData(selectedNFTs.wateringCan);
          setUsesLeft(wateringCanData.usesLeft);
        } catch (error) {
          console.error("Failed to fetch uses left for watering can", error);
        }
      } else {
        setUsesLeft(null);
      }
    };
    
    if (action === 'waterplants') {
      fetchWateringCanUses();
    } else {
      setUsesLeft(null);  // Ensure usesLeft is cleared when switching actions
    }
  }, [selectedNFTs.wateringCan, action]);

  // Handle adding a new watering can via backend
  const handleAddWateringCan = async () => {
    setIsLoading(true);
    setStatus('Adding watering can, please wait...');

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/watering/addwatercan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nft_id: selectedNFTs.wateringCan,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Watering can added successfully!');
      } else {
        setStatus(`Failed to add watering can: ${data.message}`);
      }
    } catch (error) {
      console.error('Failed to add watering can:', error);
      setStatus(`Action failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Handle watering plants
  const handleWaterPlants = async () => {
    setIsLoading(true);
    setStatus('Watering plants, please wait...');

    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'waterplants',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
          watering_can_nft_id: selectedNFTs.wateringCan,
        }
      };

      await session.transact({ actions: [actionData] });
      setStatus('Plants watered successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatus(`Action failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle refilling the watering can
  const handleRefillWaterCan = async () => {
    setIsLoading(true);
    setStatus('Refilling watering can, please wait...');

    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'refillcan',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          watering_can_nft_id: selectedNFTs.wateringCan,
        }
      };

      await session.transact({ actions: [actionData] });
      setStatus('Watering can refilled successfully!');
      setUsesLeft(null);  // Reset uses left after refilling
    } catch (error) {
      console.error('Transaction failed:', error);
      setStatus(`Action failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selling crops
  const handleSellCrops = async () => {
    if (!session || !plotId) return;
    setIsLoading(true);
    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'sellcrops',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
        }
      };
      await session.transact({ actions: [actionData] });
      setStatus('Crops sold successfully!');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleHarvestCrops = async () => {
    setIsLoading(true);
    setStatus('Harvesting crops, please wait...');

    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'harvest',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
        }
      };

      await session.transact({ actions: [actionData] });
      setStatus('Crops harvested successfully!');
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
        await handleWaterPlants();
        break;
      case 'harvest':
        await handleHarvestCrops();
        break;
      case 'sellcrops':
        await handleSellCrops();
        break;
      default:
        setStatus('No action selected.');
    }

    await fetchUserNFTs();  // Re-fetch NFT data after actions
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

    // Handle re-checking when an NFT is selected or re-selected
    const handleNFTChange = (e) => {
      const selectedValue = e.target.value;
      setSelectedNFTs(prev => ({ ...prev, [type]: selectedValue }));

      // Re-check if the selected NFT is a watering can and update the button rendering
      if (type === 'wateringCan') {
        if (selectedValue) {
          setUsesLeft(null); // Reset uses left for the new selection
        }
      }
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
            <option value="" disabled>Select {title}</option> {/* Default option */}
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
              {type === 'wateringCan' && usesLeft !== null && (
                <p>Uses left: {usesLeft}</p>
              )}
            </>
          )}
          
          {/* Display the Add Watering Can button only if no usesLeft is available */}
          {type === 'wateringCan' && usesLeft === null && selectedNFTs.wateringCan && (
            <button onClick={handleAddWateringCan} className="add-can-button" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Watering Can'}
            </button>
          )}
          
          {/* Display the Refill Watering Can button only if usesLeft is under 10 */}
          {type === 'wateringCan' && usesLeft !== null && usesLeft < 10 && (
            <button onClick={handleRefillWaterCan} className="refill-button" disabled={isLoading}>
              {isLoading ? 'Refilling...' : 'Refill Watering Can'}
            </button>
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
        {action === 'waterplants' && (
          <>
            {renderNFTSelect('wateringCan', 'Watering Can', '653268')}
          </>
        )}
      </div>

      <div className="action-container">
        <button onClick={handleAction} className="action-button" disabled={isLoading || !plotId || !action}>
          {isLoading ? 'Processing...' : `Execute ${action}`}
        </button>
      </div>
    </div>
  );
};

export default PerformAction;
