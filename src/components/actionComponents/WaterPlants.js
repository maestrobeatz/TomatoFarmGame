import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Assuming api.js is where your API functions are stored

const WaterPlants = ({ session, plotId, selectedNFTs, nftDetails }) => {
  const [status, setStatus] = useState('');
  const [wateringLoading, setWateringLoading] = useState(false);  // Separate loading state for watering
  const [refillLoading, setRefillLoading] = useState(false);  // Separate loading state for refilling
  const [usesLeft, setUsesLeft] = useState(null);
  const [wateringCanExists, setWateringCanExists] = useState(true); // To track if watering can is found or not

  const fetchWateringCanData = useCallback(async () => {
    if (selectedNFTs.wateringCan) {
      try {
        const wateringCanData = await api.getWateringCanData(selectedNFTs.wateringCan);
        if (wateringCanData && wateringCanData.usesLeft !== undefined) {
          setUsesLeft(wateringCanData.usesLeft);
          setWateringCanExists(true);
        } else {
          setUsesLeft(null);
          setWateringCanExists(false); // If no data, mark it as not existing
        }
      } catch (error) {
        setStatus(`Error fetching watering can data: ${error.message}`);
        setUsesLeft(null);
        setWateringCanExists(false); // Mark as not existing on error
      }
    } else {
      setUsesLeft(null);
      setWateringCanExists(false);
    }
  }, [selectedNFTs.wateringCan]);

  useEffect(() => {
    if (selectedNFTs.wateringCan) {
      fetchWateringCanData();
    } else {
      setUsesLeft(null);
      setWateringCanExists(false);
    }
  }, [selectedNFTs.wateringCan, fetchWateringCanData]);

  const handleWaterPlants = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first.');
      return;
    }
    if (!plotId) {
      setStatus('Error: No plot selected or available.');
      return;
    }
    if (!selectedNFTs.wateringCan) {
      setStatus('Error: No watering can selected.');
      return;
    }

    try {
      setWateringLoading(true);
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
      fetchWateringCanData(); // Refresh watering can data after watering
    } catch (error) {
      setStatus(`Error watering plants: ${error.message}`);
    } finally {
      setWateringLoading(false);
    }
  }, [session, plotId, selectedNFTs, fetchWateringCanData]);

  const handleRefillCan = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first.');
      return;
    }
    if (!selectedNFTs.wateringCan) {
      setStatus('Error: No watering can selected.');
      return;
    }

    try {
      setRefillLoading(true);
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
      fetchWateringCanData(); // Refresh watering can data after refilling
    } catch (error) {
      setStatus(`Error refilling watering can: ${error.message}`);
    } finally {
      setRefillLoading(false);
    }
  }, [session, selectedNFTs, fetchWateringCanData]);

  const handleAddWaterCan = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first.');
      return;
    }

    try {
      setWateringLoading(true);
      const response = await api.addWaterCan(selectedNFTs.wateringCan); // Add can through API
      if (response.success) {
        setStatus('Watering can added successfully.');
        fetchWateringCanData(); // Refresh data after adding the can
      } else {
        setStatus('Error adding watering can.');
      }
    } catch (error) {
      setStatus(`Error adding watering can: ${error.message}`);
    } finally {
      setWateringLoading(false);
    }
  }, [session, selectedNFTs.wateringCan, fetchWateringCanData]);

  return (
    <div>
      <button onClick={handleWaterPlants} disabled={wateringLoading || !plotId || !selectedNFTs.wateringCan || !wateringCanExists}>
        {wateringLoading ? 'Watering...' : 'Water Plants'}
      </button>
      {status && <p>{status}</p>}

      {selectedNFTs.wateringCan && (
        <>
          <img
            src={`https://ipfs.io/ipfs/${selectedNFTs?.data?.img}`}
            alt="Selected Watering Can"
            className="nft-image"
          />
          {usesLeft !== null ? (
            <p>Uses left for this watering can: {usesLeft}</p>
          ) : (
            <>
              <p>This watering can has not been added yet.</p>
              <button onClick={handleAddWaterCan} disabled={wateringLoading}>
                {wateringLoading ? 'Adding...' : 'Add Watering Can'}
              </button>
            </>
          )}
        </>
      )}

      {usesLeft !== null && (
        <div>
          <button className="refill-button" onClick={handleRefillCan} disabled={refillLoading || !selectedNFTs.wateringCan}>
            {refillLoading ? 'Refilling...' : 'Refill Watering Can'}
          </button>
        </div>
      )}
    </div>
  );
};

export default WaterPlants;
