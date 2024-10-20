import React, { useState, useEffect, useCallback } from 'react';

const PlantSeeds = ({ session, plotId, selectedNFTs }) => {
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePlantSeeds = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first');
      return;
    }
    if (!plotId) {
      setStatus('Error: No plot selected or available.');
      return;
    }
    if (!selectedNFTs.seed || !selectedNFTs.compost) {
      setStatus('Error: Seed or compost not selected.');
      return;
    }

    setIsLoading(true);
    setStatus('Planting seeds, please wait...');

    try {
      // Prepare transaction action data
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,  // Smart contract name
        name: 'plantseeds',  // The action name on the smart contract
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),  // The current user performing the transaction
          plot_id: plotId,  // The selected plot ID where seeds are being planted
          seed_nft_id: selectedNFTs.seed,  // The NFT ID of the selected seed
          compost_nft_id: selectedNFTs.compost  // The NFT ID of the selected compost
        }
      };

      // Execute the transaction using the session
      await session.transact({ actions: [actionData] });

      setStatus('Seeds planted successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);  // Log the error for debugging
      setStatus(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [session, plotId, selectedNFTs]);

  useEffect(() => {
    if (!plotId) {
      setStatus('No plot selected or available.');
    } else if (!selectedNFTs.seed || !selectedNFTs.compost) {
      setStatus('Please select both seed and compost to plant.');
    } else {
      setStatus('Ready to plant seeds.');
    }
  }, [plotId, selectedNFTs]);

  return (
    <div>
      <button 
        onClick={handlePlantSeeds} 
        disabled={isLoading || !plotId || !selectedNFTs.seed || !selectedNFTs.compost}
      >
        {isLoading ? 'Planting...' : 'Plant Seeds'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default PlantSeeds;
