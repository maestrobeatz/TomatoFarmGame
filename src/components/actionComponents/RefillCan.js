import React, { useState, useEffect, useCallback } from 'react';

const RefillCan = ({ session, selectedNFTs }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleRefill = async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
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
  };

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
