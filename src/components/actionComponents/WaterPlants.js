import React, { useState, useEffect, useCallback } from 'react';

const WaterPlants = ({ session, plotId, selectedNFTs, setSelectedNFTs, userPlots }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleWaterPlants = async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
      return;
    }
    if (!plotId) {
      setStatus('No plot selected or available.');
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
          watering_can_nft_id: selectedNFTs.wateringCan
        }
      };
      await session.transact({ actions: [actionData] });
      setStatus('Plants watered successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
