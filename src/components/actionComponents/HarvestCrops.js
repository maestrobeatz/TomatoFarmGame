import React, { useState, useEffect, useCallback } from 'react';

const HarvestCrops = ({ session, plotId, userPlots }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleHarvest = async () => {
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
        name: 'harvest',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
        }
      };
      await session.transact({ actions: [actionData] });
      setStatus('Crops harvested successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleHarvest} disabled={isLoading}>
        {isLoading ? 'Harvesting...' : 'Harvest Crops'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default HarvestCrops;
