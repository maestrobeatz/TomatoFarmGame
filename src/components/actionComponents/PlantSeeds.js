import React, { useState } from 'react';

const PlantSeeds = ({ session, plotId, selectedNFTs }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlantSeeds = async () => {
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
      setStatus('Seeds planted successfully.');
    } catch (error) {
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button onClick={handlePlantSeeds} disabled={isLoading}>
        {isLoading ? 'Planting...' : 'Plant Seeds'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default PlantSeeds;
