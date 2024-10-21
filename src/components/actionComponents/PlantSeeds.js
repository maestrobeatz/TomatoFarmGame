import React, { useState, useEffect, useCallback } from 'react';
import { InitTransaction } from '../../hooks/useSession';  // Correct import path

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
      const actionData = {
        actions: [{
          account: process.env.REACT_APP_CONTRACT_NAME,
          name: 'plantseeds',
          authorization: [{ actor: session.actor.toString(), permission: 'active' }],
          data: {
            user: session.actor.toString(),
            plot_id: plotId.toString(),        // Ensure it's a string
            seed_nft_id: selectedNFTs.seed.toString(),   // Ensure it's a string
            compost_nft_id: selectedNFTs.compost.toString()  // Ensure it's a string
          }
        }]
      };

      // Log the action data for debugging
      console.log('Sending transaction with the following data:', actionData);

      // Use InitTransaction to handle the transaction
      const result = await InitTransaction(actionData);
      console.log('Transaction success:', result);
      setStatus('Seeds planted successfully!');
    } catch (error) {
      console.error('Transaction failed:', error);
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
