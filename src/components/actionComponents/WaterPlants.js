import React, { useState, useEffect, useCallback } from 'react';
import api from '../api'; // Assuming api.js is where your API functions are stored

const WaterPlants = ({ session, plotId, selectedNFTs, setSelectedNFTs, nftDetails = [] }) => {
  const [status, setStatus] = useState('');
  const [wateringLoading, setWateringLoading] = useState(false);  // Separate loading state for watering
  const [refillLoading, setRefillLoading] = useState(false);  // Separate loading state for refilling
  const [usesLeft, setUsesLeft] = useState(null);
  const [wateringCanExists, setWateringCanExists] = useState(true);

  // Fetch the watering can data
  const fetchWateringCanData = useCallback(async () => {
    if (selectedNFTs.wateringCan) {
      try {
        const wateringCanData = await api.getWateringCanData(selectedNFTs.wateringCan);
        console.log("Fetched watering can data:", wateringCanData); // Log the data
        if (wateringCanData && wateringCanData.usesLeft !== undefined) {
          setUsesLeft(wateringCanData.usesLeft);
          setWateringCanExists(true);
        } else {
          setUsesLeft(null);
          setWateringCanExists(false); // If no data, mark it as not existing
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setUsesLeft(null);
          setWateringCanExists(false); // Watering can hasn't been added yet
        } else {
          setStatus(`Error fetching watering can data: ${error.message}`);
          setUsesLeft(null);
          setWateringCanExists(false);
        }
      }
    } else {
      setUsesLeft(null);
      setWateringCanExists(false);
    }
  }, [selectedNFTs.wateringCan]);

  // Fetch watering can data whenever the watering can selection changes
  useEffect(() => {
    if (selectedNFTs.wateringCan) {
      fetchWateringCanData();
    } else {
      setUsesLeft(null);
      setWateringCanExists(false);
    }
  }, [selectedNFTs.wateringCan, fetchWateringCanData]);

  // Handle the watering of plants
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
      
      console.log("Sending watering action:", actionData); // Log the transaction data
      await session.transact({ actions: [actionData] });
      setStatus('Plants watered successfully.');
      fetchWateringCanData(); // Refresh watering can data after watering
    } catch (error) {
      setStatus(`Error watering plants: ${error.message}`);
    } finally {
      setWateringLoading(false);
    }
  }, [session, plotId, selectedNFTs, fetchWateringCanData]);

  // Handle the refilling of the watering can
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
      
      console.log("Sending refill action:", actionData);  // Log the transaction data
      await session.transact({ actions: [actionData] });
      setStatus('Watering can refilled successfully.');
      fetchWateringCanData(); // Refresh watering can data after refilling
    } catch (error) {
      setStatus(`Error refilling watering can: ${error.message}`);
    } finally {
      setRefillLoading(false);
    }
  }, [session, selectedNFTs, fetchWateringCanData]);

  // Add watering can functionality if it hasn't been added yet
  const handleAddWaterCan = useCallback(async () => {
    if (!session || !session.actor) {
      setStatus('Error: Please login first.');
      return;
    }

    try {
      setWateringLoading(true);
      const response = await api.addWaterCan(selectedNFTs.wateringCan); // Add can through API
      console.log("Watering can added:", response); // Log the response
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

  // Render the watering can selection dropdown
  const renderWateringCanSelect = () => {
    if (!nftDetails || nftDetails.length === 0) return null;

    const relevantNFTs = nftDetails.filter(nft => nft.template.template_id === '653268');
    const handleNFTChange = (e) => {
      setSelectedNFTs(prev => ({ ...prev, wateringCan: e.target.value }));
    };

    return (
      <div className="nft-select">
        <label htmlFor="watering-can-select">Select Watering Can</label>
        <select
          id="watering-can-select"
          onChange={handleNFTChange}
          value={selectedNFTs.wateringCan || ''}
          className="w-full p-2 border rounded"
        >
          <option value="" disabled>Select Watering Can</option>
          {relevantNFTs.map(nft => (
            <option key={nft.asset_id} value={nft.asset_id}>
              Issue: {nft.template_mint || 'Unknown'}
            </option>
          ))}
        </select>
      </div>
    );
  };

  return (
    <div>
      {renderWateringCanSelect()} {/* Watering can selection */}
      
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
            <div className="alert-box">
              <p>This watering can has not been added yet.</p>
              <button onClick={handleAddWaterCan} disabled={wateringLoading}>
                {wateringLoading ? 'Adding...' : 'Add Watering Can'}
              </button>
            </div>
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

      <button onClick={handleWaterPlants} disabled={wateringLoading || !selectedNFTs.wateringCan || !wateringCanExists}>
        {wateringLoading ? 'Watering...' : 'Water Plants'}
      </button>
      {status && <p>{status}</p>}
    </div>
  );
};

export default WaterPlants;
