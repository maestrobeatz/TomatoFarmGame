import React, { useState, useEffect, useCallback } from 'react';

const HarvestCrops = ({ session, plotId }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle the harvest action
  const handleHarvest = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
      return;
    }
    if (!plotId) {
      setStatus('No plot selected or available.');
      return;
    }

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
      console.error('Transaction failed:', error); // Log the error for debugging
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, plotId]);

  // Check plot status on component mount
  useEffect(() => {
    if (!plotId) {
      setStatus('No plot selected or available.');
    } else {
      setStatus('Ready to harvest crops.');
    }
  }, [plotId]);

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
