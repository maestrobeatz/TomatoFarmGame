import React, { useState, useEffect, useCallback } from 'react';

const WaterPlants = ({ session, plotId, selectedNFTs, setSelectedNFTs, userPlots }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoized function to avoid re-creation
  const handleWaterPlants = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
      return;
    }
    if (!plotId) {
      setStatus('No plot selected or available.');
      return;
    }
    if (!selectedNFTs.wateringCan) {
      setStatus('Error: No watering can selected.');
      return;
    }

    try {
      setIsLoading(true);
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
      setStatus('Plants watered successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, plotId, selectedNFTs]);

  // Check the plot and watering can availability on load or change
  useEffect(() => {
    if (!plotId) {
      setStatus('No plot selected or available.');
    } else if (!selectedNFTs.wateringCan) {
      setStatus('Please select a watering can to water the plants.');
    } else {
      setStatus('Ready to water plants.');
    }
  }, [plotId, selectedNFTs]);

  return (
    <div>
      <button onClick={handleWaterPlants} disabled={isLoading}>
        {isLoading ? 'Watering...' : 'Water Plants'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default WaterPlants;
