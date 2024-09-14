import React, { useState, useEffect, useCallback } from 'react';

const SellCrops = ({ session, plotId, userPlots }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSellCrops = async () => {
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
        name: 'sellcrops',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          plot_id: plotId,
        }
      };
      await session.transact({ actions: [actionData] });
      setStatus('Crops sold successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handleSellCrops} disabled={isLoading}>
        {isLoading ? 'Selling...' : 'Sell Crops'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default SellCrops;
