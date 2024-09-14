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
  const [plotId, setPlotId] = useState('');
  const [userPlots, setUserPlots] = useState([]);
  const [completedActions, setCompletedActions] = useState({});

  const fetchUserPlots = useCallback(async () => {
    if (!session?.actor) return;

    try {
      const response = await fetch(`${API_BASE_URL}/plots/${session.actor}`);
      if (!response.ok) {
        if (response.status === 404) {
          setUserPlots([]); // No plots found, initialize with empty array
          setStatus("No plots found for this user.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setUserPlots(data.plots || []); // Ensure it's always an array
        if (data.plots.length > 0 && !plotId) {
          setPlotId(data.plots[0].plot_id);
        }
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
          const imageUrl = nft.data?.img ? `${IPFS_GATEWAY}${nft.data.img}` : '/path/to/placeholder-image.png';
          return {
            templateId: nft.template?.template_id || 'Unknown Template',
            image: imageUrl,
            assetId: nft.asset_id,
            name: nft.name || 'Unknown Name',
            issued: nft.template_mint || 0,
            uses: parseInt(nft.data?.uses, 10) || 10,
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

  useEffect(() => {
    fetchUserPlots();
  }, [fetchUserPlots]);

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
  };

  const performAction = async (actionType = action) => {
    if (!session?.actor) {
      setStatus('Error: Please login first');
      return;
    }

    setIsLoading(true);
    setStatus('');

    if (actionType === 'plantseeds' && !plotId) {
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
        },
      };

      if (actionType === 'plantseeds' && (!actionData.data.seed_nft_id || !actionData.data.compost_nft_id)) {
        throw new Error("Both Seed and Compost NFTs must be selected.");
      }

      await session.transact({
        actions: [actionData],
      });

      setStatus(`${actionType} action performed successfully`);
      setCompletedActions(prev => ({ ...prev, [actionType]: true }));

      fetchNFTs();
      fetchUserPlots();

      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      handleError(`Error performing ${actionType} action`, error);
    } finally {
      setIsLoading(false);
    }
  };

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
              Plot ID: {plot.plot_id} {plot.has_planted_seeds ? "(Seeds Planted)" : ""}
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

      {action === 'plantseeds' && renderPlotSelect()}

      <div className="nft-display-container">
        {action === 'plantseeds' && (
          <>
            <Card className="nft-display">
              <CardHeader>
                <CardTitle>Beatz Seeds</CardTitle>
              </CardHeader>
              <CardContent>
                <select 
                  onChange={handleNFTChange('seed')} 
                  value={selectedNFTs.seed} 
                  className="w-full p-2 border rounded"
                >
                  <option value="" disabled>Select Seed</option>
                  {nftDetails.filter(nft => nft.templateId === TEMPLATE_IDS.SEED).map(nft => (
                    <option key={nft.assetId} value={nft.assetId}>
                      Issued: {nft.issued}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>

            <Card className="nft-display">
              <CardHeader>
                <CardTitle>Compost Soil</CardTitle>
              </CardHeader>
              <CardContent>
                <select 
                  onChange={handleNFTChange('compost')} 
                  value={selectedNFTs.compost} 
                  className="w-full p-2 border rounded"
                >
                  <option value="" disabled>Select Compost</option>
                  {nftDetails.filter(nft => nft.templateId === TEMPLATE_IDS.COMPOST).map(nft => (
                    <option key={nft.assetId} value={nft.assetId}>
                      Issued: {nft.issued}
                    </option>
                  ))}
                </select>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Button
        onClick={() => performAction()}
        disabled={isLoading || completedActions[action]}
        className={`w-full mb-4 ${isLoading || completedActions[action] ? 'bg-red-500 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
      >
        {isLoading ? <span className="loading-spinner"></span> : action}
      </Button>

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
