import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Alert, AlertDescription, AlertTitle } from './Alert';
import { Progress } from './Progress';
import './PerformAction.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

const TEMPLATE_IDS = {
  SEED: '653266',
  COMPOST: '653267',
  WATERINGCAN: '653268',
};

const PerformAction = ({ session, action, onActionComplete, refreshTrigger }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [nftDetails, setNftDetails] = useState([]);
  const [selectedNFTs, setSelectedNFTs] = useState({
    seed: '',
    compost: '',
    wateringCan: '',
  });
  const [wateringCanUses, setWateringCanUses] = useState(null);
  const [plotId, setPlotId] = useState('');
  const [userPlots, setUserPlots] = useState([]);
  const [completedActions, setCompletedActions] = useState({});

  const fetchUserPlots = useCallback(async () => {
    if (!session?.actor) return;

    try {
      const response = await fetch(`${API_BASE_URL}/plots/${session.actor}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('No plots found for this user.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      setUserPlots(data.plots);

      if (data.plots.length > 0 && !plotId) {
        setPlotId(data.plots[0].plot_id);
      }
    } catch (error) {
      console.error('Error fetching user plots:', error);
      setStatus(error.message);
    }
  }, [session, plotId]);

  const fetchNFTs = useCallback(async () => {
    if (!session?.actor) {
      setStatus('Error: Please login first');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/nfts/${session.actor}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();

      if (Array.isArray(result.nfts) && result.nfts.length > 0) {
        const userNFTs = result.nfts.map(nft => {
          const imageUrl = nft.data.img ? `${IPFS_GATEWAY}${nft.data.img}` : '/path/to/placeholder-image.png';
          return {
            templateId: nft.template.template_id,
            image: imageUrl,
            assetId: nft.asset_id,
            name: nft.name,
            issued: nft.template_mint,
            uses: parseInt(nft.data.uses, 10) || 10,
          };
        });
        setNftDetails(userNFTs);
      } else {
        setNftDetails([]);
        setStatus('No NFTs available');
      }
    } catch (error) {
      console.error('Error fetching NFTs:', error);
      setStatus(error.message);
    }
  }, [session]);

  const fetchWateringCanStatus = useCallback(async () => {
    if (!selectedNFTs.wateringCan) return;

    try {
      const response = await fetch(`${API_BASE_URL}/nftStatus/${selectedNFTs.wateringCan}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Watering can not found. Please make sure you have selected the correct NFT.');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      const data = await response.json();
      setWateringCanUses(data.uses);
    } catch (error) {
      console.error('Error fetching watering can status:', error);
      setStatus(error.message);
      setWateringCanUses(null);
    }
  }, [selectedNFTs.wateringCan]);

  useEffect(() => {
    fetchUserPlots();
    fetchWateringCanStatus();
  }, [fetchUserPlots, fetchWateringCanStatus, action, refreshTrigger]);

  useEffect(() => {
    if (session) {
      fetchNFTs();
    }
  }, [session, fetchNFTs]);

  const handleError = (defaultMessage, error) => {
    console.error(defaultMessage, error);
    let errorMessage = `${defaultMessage}: ${error.message || 'Unknown error occurred'}`;
    setStatus(errorMessage);
  };

  const handleNFTChange = (type) => (e) => {
    const value = e.target.value;
    setSelectedNFTs(prev => ({
      ...prev,
      [type]: value,
    }));
    if (type === 'wateringCan') {
      setWateringCanUses(null);
      fetchWateringCanStatus();
    }
  };

  const performAction = async (actionType = action) => {
    if (!session?.actor) {
      setStatus('Error: Please login first');
      return;
    }

    setIsLoading(true);
    setStatus('');

    if (!plotId) {
      setStatus('No plot selected or available.');
      setIsLoading(false);
      return;
    }

    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: actionType,
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: parseInt(plotId, 10),
          seed_nft_id: selectedNFTs.seed ? parseInt(selectedNFTs.seed, 10) : undefined,
          compost_nft_id: selectedNFTs.compost ? parseInt(selectedNFTs.compost, 10) : undefined,
          watering_can_nft_id: selectedNFTs.wateringCan ? parseInt(selectedNFTs.wateringCan, 10) : undefined,
        },
      };

      if (actionType === 'plantseeds' && (!actionData.data.seed_nft_id || !actionData.data.compost_nft_id)) {
        throw new Error("Both Seed and Compost NFTs must be selected.");
      }

      if (['waterplants', 'harvest', 'sellcrops'].includes(actionType) && !actionData.data.plot_id) {
        throw new Error("Plot is not selected or invalid.");
      }

      if (actionType === 'harvest') {
        const currentPlot = userPlots.find(plot => plot.plot_id === plotId);
        if (!currentPlot.has_watered_plants) {
          throw new Error("You need to water the plants before harvesting.");
        }
      }

      if (actionType === 'sellcrops') {
        const currentPlot = userPlots.find(plot => plot.plot_id === plotId);
        if (!currentPlot.has_harvested_crops) {
          throw new Error("You need to harvest the crops before selling.");
        }
      }

      await session.transact({
        actions: [actionData],
      });

      setStatus(`${actionType} action performed successfully`);
      setCompletedActions(prev => ({ ...prev, [actionType]: true }));

      fetchNFTs();
      fetchUserPlots();
      fetchWateringCanStatus();

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      if (error.message.includes("The watering can has no water left")) {
        setStatus("Error: The watering can is empty. Please refill it before use.");
        setWateringCanUses(0);
      } else {
        handleError(`Error performing ${actionType} action`, error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getActionStatus = () => {
    const currentPlot = userPlots.find(plot => plot.plot_id === plotId);

    if (!currentPlot) {
      return { disabled: true, message: 'No plot selected or available.' };
    }

    switch (action) {
      case 'plantseeds':
        if (!selectedNFTs.seed || !selectedNFTs.compost) {
          return { disabled: true, message: 'Please select both seed and compost NFTs.' };
        }
        if (currentPlot.has_planted_seeds) {
          return { disabled: true, message: 'Seeds already planted on this plot.' };
        }
        return { disabled: false, message: 'Ready to plant seeds.' };

      case 'waterplants':
        if (!plotId || !currentPlot.has_planted_seeds) {
          return { disabled: true, message: 'You need to plant seeds first.' };
        }
        if (currentPlot.has_watered_plants) {
          return { disabled: true, message: 'Plants already watered on this plot.' };
        }
        if (!selectedNFTs.wateringCan) {
          return { disabled: true, message: 'Please select a watering can NFT.' };
        }
        if (wateringCanUses === 0) {
          return { disabled: true, message: 'The watering can is empty. Please refill it.' };
        }
        return { disabled: false, message: 'Ready to water plants.' };

      case 'harvest':
        if (!plotId || !currentPlot.has_planted_seeds || !currentPlot.has_watered_plants) {
          return { disabled: true, message: 'You need to plant and water seeds first.' };
        }
        if (currentPlot.has_harvested_crops) {
          return { disabled: true, message: 'Crops already harvested on this plot.' };
        }
        return { disabled: false, message: 'Ready to harvest crops.' };

      case 'sellcrops':
        if (!plotId || !currentPlot.has_harvested_crops) {
          return { disabled: true, message: 'You need to harvest crops first.' };
        }
        return { disabled: false, message: 'Ready to sell crops.' };

      case 'refillcan':
        if (!selectedNFTs.wateringCan) {
          return { disabled: true, message: 'Please select a watering can NFT.' };
        }
        if (wateringCanUses === 10) {
          return { disabled: true, message: 'The watering can is already full.' };
        }
        return { disabled: false, message: 'Ready to refill watering can.' };

      default:
        return { disabled: true, message: 'Unknown action.' };
    }
  };

  const actionStatus = getActionStatus();

  const renderNFTSelect = (type, title, templateId) => (
    <Card className="nft-display">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <select 
          onChange={handleNFTChange(type)} 
          value={selectedNFTs[type]} 
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select {title}</option>
          {nftDetails.filter(nft => nft.templateId === templateId).map(nft => (
            <option key={nft.assetId} value={nft.assetId}>
              Issued: {nft.issued}
            </option>
          ))}
        </select>
        {selectedNFTs[type] && (
          <img
            src={nftDetails.find(nft => nft.assetId === selectedNFTs[type])?.image}
            alt={`Selected ${title}`}
            className="nft-image"
          />
        )}
        {type === 'wateringCan' && selectedNFTs.wateringCan && (
          <div className="progress-container">
            {wateringCanUses !== null ? (
              <>
                <Progress value={(wateringCanUses / 10) * 100} className="mt-2" />
                <p className="progress-label">{wateringCanUses} uses left</p>
              </>
            ) : (
              <p className="progress-label">Loading watering can status...</p>
            )}
            <Button
              onClick={() => performAction('refillcan')}
              disabled={wateringCanUses === 10 || isLoading}
              className="refill-button mt-2"
            >
              Refill Watering Can
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderPlotSelect = () => (
    <Card className="plot-select">
      <CardHeader>
        <CardTitle>Select Plot</CardTitle>
      </CardHeader>
      <CardContent>
        <select
          onChange={(e) => {
            setPlotId(e.target.value);
            setStatus('');  // Reset the status when changing plots
            setCompletedActions({});  // Reset completed actions when changing plots
          }}
          value={plotId || ''}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select Plot</option>
          {userPlots.map(plot => (
            <option key={plot.plot_id} value={plot.plot_id}>
              Plot ID: {plot.plot_id} {plot.has_planted_seeds ? "(Seeds Planted)" : ""} {plot.has_watered_plants ? "(Watered)" : ""} {plot.has_harvested_crops ? "(Harvested)" : ""}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );

  return (
    <div className="perform-action">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {action ? action.charAt(0).toUpperCase() + action.slice(1) : ''}
      </h2>

      {['waterplants', 'harvest', 'sellcrops'].includes(action) && renderPlotSelect()}

      <div className="nft-display-container">
        {action === 'plantseeds' && (
          <>
            {renderNFTSelect('seed', 'Beatz Seeds', TEMPLATE_IDS.SEED)}
            {renderNFTSelect('compost', 'Compost Soil', TEMPLATE_IDS.COMPOST)}
          </>
        )}

        {(action === 'waterplants' || action === 'refillcan') && renderNFTSelect('wateringCan', 'Watering Can', TEMPLATE_IDS.WATERINGCAN)}
      </div>

      <Button
        onClick={() => performAction()}
        disabled={actionStatus.disabled || isLoading || completedActions[action]}
        className={`w-full mb-4 ${actionStatus.disabled || isLoading || completedActions[action] ? 'bg-red-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isLoading ? <span className="loading-spinner"></span> : action}
      </Button>

      {actionStatus.message && (
        <Alert variant={actionStatus.disabled ? "warning" : "info"} className="mb-4">
          <AlertTitle>Action Status</AlertTitle>
          <AlertDescription>{actionStatus.message}</AlertDescription>
        </Alert>
      )}

      {status && (
        <Alert variant={status.includes('Error') ? 'destructive' : 'default'}>
          <AlertTitle>{status.includes('Error') ? 'Error' : 'Success'}</AlertTitle>
          <AlertDescription>{status}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PerformAction;
