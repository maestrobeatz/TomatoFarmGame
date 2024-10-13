import React, { useState, useEffect, useCallback } from 'react';

const RefillCan = ({ session, selectedNFTs }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Memoized handleRefill function to avoid re-creation on every render
  const handleRefill = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
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
        name: 'refillcan',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          watering_can_nft_id: selectedNFTs.wateringCan,
        }
      };
      await session.transact({ actions: [actionData] });
      setStatus('Watering can refilled successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, selectedNFTs]);

  // UseEffect to set initial status or check if the necessary data is available
  useEffect(() => {
    if (!selectedNFTs.wateringCan) {
      setStatus('Please select a watering can to refill.');
    } else {
      setStatus('Ready to refill the watering can.');
    }
  }, [selectedNFTs.wateringCan]);

  return (
    <div>
      <button onClick={handleRefill} disabled={isLoading}>
        {isLoading ? 'Refilling...' : 'Refill Watering Can'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default RefillCan;
