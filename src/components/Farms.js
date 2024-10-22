import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Farms.css';
import { getFarmsWithPlots, getAllFarms, getNFTStatus, getUserNFTs, getPlots } from './api'; 
import { InitTransaction } from '../hooks/useSession'; 
import Modal from './Modal';  
import PerformAction from './Game/PerformAction';  
import PlotStatus from './Game/PlotStatus'; 

const Farms = ({ session }) => {
  const [userFarms, setUserFarms] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [farmName, setFarmName] = useState('');
  const [farmNftId, setFarmNftId] = useState('');
  const [availableFarmNFTs, setAvailableFarmNFTs] = useState([]);
  const [unusedFarmNFTs, setUnusedFarmNFTs] = useState([]);
  const [nftsFetched, setNftsFetched] = useState(false);

  const [isPerformActionModalOpen, setIsPerformActionModalOpen] = useState(false);  
  const [selectedFarm, setSelectedFarm] = useState(null);  
  const [selectedAction, setSelectedAction] = useState('plantseeds');  
  const [refreshTrigger, setRefreshTrigger] = useState(false);

  // NFT state for selected items
  const [selectedNFTs, setSelectedNFTs] = useState({});

  // Fetch available farm NFTs
  const fetchAvailableFarmNFTs = useCallback(async () => {
    if (!session?.actor || nftsFetched) return;
    try {
      const nftData = await getUserNFTs(session.actor.toString());
      const farmNFTs = nftData.nfts.filter(nft => nft.template_id === '654617');
      setAvailableFarmNFTs(farmNFTs || []);
      setNftsFetched(true);
    } catch (error) {
      console.error('Error fetching user NFTs:', error);
      setError('Error fetching NFTs. Please try again later.');
    }
  }, [session, nftsFetched]);

  // Fetch user farms data
  const fetchUserFarmsData = useCallback(async () => {
    setIsLoading(true);
    try {
      if (session?.actor) {
        const farmsData = await getFarmsWithPlots(session.actor.toString());

        const userFarmsData = await Promise.all(
          farmsData.farms.map(async (farm) => {
            try {
              const farmStatus = await getNFTStatus(farm.farmId);
              return {
                ...farm,
                is_staked: farmStatus.is_staked,
              };
            } catch (err) {
              return {
                ...farm,
                is_staked: false,
              };
            }
          })
        );
        setUserFarms(userFarmsData || []);
      }
    } catch (error) {
      console.error('Error fetching user farms data:', error);
      setError('Error fetching user farms data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Fetch all farms data
  const fetchAllFarmsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const farmsData = await getAllFarms();

      const allFarmsData = await Promise.all(
        farmsData.farms.map(async (farm) => {
          try {
            const farmStatus = await getNFTStatus(farm.farmId);
            return {
              ...farm,
              is_staked: farmStatus.is_staked,
            };
          } catch (err) {
            return {
              ...farm,
              is_staked: false,
            };
          }
        })
      );
      setAllFarms(allFarmsData || []);
    } catch (error) {
      console.error('Error fetching all farms data:', error);
      setError('Error fetching all farms data. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch plots for a selected farm
  const fetchFarmPlots = async (farmId) => {
    try {
      const farmPlots = await getPlots(farmId);
      return farmPlots || [];
    } catch (error) {
      console.error("Error fetching plots:", error);
      return [];
    }
  };

  useEffect(() => {
    if (session && session.actor) {
      fetchAvailableFarmNFTs();
      fetchUserFarmsData();
    }
    fetchAllFarmsData();
  }, [fetchAvailableFarmNFTs, fetchUserFarmsData, fetchAllFarmsData, session]);

  useEffect(() => {
    if (availableFarmNFTs.length > 0) {
      const usedFarmNFTIds = userFarms.map(farm => farm.farmId);
      const unusedNFTs = availableFarmNFTs.filter(nft => !usedFarmNFTIds.includes(nft.asset_id));
      setUnusedFarmNFTs(unusedNFTs);
    } else {
      setUnusedFarmNFTs(availableFarmNFTs);
    }
  }, [availableFarmNFTs, userFarms]);

  // Open modal and load the plots for the selected farm
  const handleOpenPerformActionModal = async (farm) => {
    const farmPlots = await fetchFarmPlots(farm.farmId);
    setSelectedFarm({
      ...farm,
      plots: farmPlots,
    });
    setIsPerformActionModalOpen(true);  // Ensure modal opens after setting state
  };

  const handleClosePerformActionModal = () => {
    setIsPerformActionModalOpen(false);
    setSelectedFarm(null); 
    setRefreshTrigger(!refreshTrigger); // Trigger refresh after closing modal
  };

  // Create farm
  const handleCreateFarm = async () => {
    try {
      const transactionData = {
        actions: [
          {
            account: process.env.REACT_APP_CONTRACT_NAME,
            name: 'createfarm',
            authorization: [
              {
                actor: session.actor.toString(),
                permission: 'active',
              },
            ],
            data: {
              owner: session.actor.toString(),
              farm_nft_id: farmNftId,
              farm_name: farmName,
            },
          },
        ],
      };

      const result = await InitTransaction(transactionData);
      if (result) {
        setFarmName('');
        setFarmNftId('');
        await fetchUserFarmsData(); 
      }
    } catch (error) {
      console.error('Error creating farm:', error);
      setError('Failed to create farm: ' + error.message);
    }
  };

  // Stake or Unstake farm
  const handleStakeUnstake = async (farmId, isStaked) => {
    const actionName = isStaked ? 'unstakefarm' : 'stakefarm';
    try {
      const transactionData = {
        actions: [
          {
            account: process.env.REACT_APP_CONTRACT_NAME,
            name: actionName,
            authorization: [
              {
                actor: session.actor.toString(),
                permission: 'active',
              },
            ],
            data: {
              farm_nft_id: farmId,
              owner: session.actor.toString(),
            },
          },
        ],
      };

      const result = await InitTransaction(transactionData);
      if (result) {
        await fetchUserFarmsData(); 
      }
    } catch (error) {
      setError(`Failed to ${isStaked ? 'unstake' : 'stake'} farm: ` + error.message);
    }
  };

  const renderFarmCard = (farm, isUserFarm) => (
    <div key={farm.farmId} className="farm-card">
      <p><strong>Farm Name:</strong> {farm.name}</p>
      <p><strong>Farm ID:</strong> {farm.farmId}</p>
      <p><strong>Total Plots:</strong> {farm.plots}</p>
      {isUserFarm && (
        <>
          <button
            className="action-button"
            onClick={() => handleStakeUnstake(farm.farmId, farm.is_staked)}
          >
            {farm.is_staked ? 'Unstake Farm' : 'Stake Farm'}
          </button>

          <button
            className="action-button"
            onClick={() => handleOpenPerformActionModal(farm)}
          >
            Perform Actions
          </button>

          <PlotStatus session={session} refreshTrigger={refreshTrigger} />
        </>
      )}
    </div>
  );

  return (
    <>
      <h3>Your Farms</h3>
      {isLoading ? <p>Loading...</p> : (
        <>
          {error && <p>{error}</p>}
          {userFarms.length > 0 ? (
            <div className="farms-list">
              {userFarms.map(farm => renderFarmCard(farm, true))}
            </div>
          ) : <p>You have no farms.</p>}
        </>
      )}

      <h3>All Farms in the Game</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="farms-list">
          {allFarms.length > 0 ? (
            allFarms.map(farm => renderFarmCard(farm, false))
          ) : (
            <p>No farms available.</p>
          )}
        </div>
      )}

      {unusedFarmNFTs.length > 0 && (
        <div className="create-farm-section">
          <h3>Create a New Farm</h3>
          <input
            type="text"
            placeholder="Enter Farm Name"
            value={farmName}
            onChange={(e) => setFarmName(e.target.value)}
          />
          <select
            value={farmNftId}
            onChange={(e) => setFarmNftId(e.target.value)}
          >
            <option value="">Select a Tomato Farmstead NFT</option>
            {unusedFarmNFTs.map(nft => (
              <option key={nft.asset_id} value={nft.asset_id}>
                {nft.template_name} (ID: {nft.asset_id})
              </option>
            ))}
          </select>
          <button onClick={handleCreateFarm} className="create-farm-button">
            Create Farm
          </button>
        </div>
      )}

      {/* Perform Action Modal */}
      <Modal isOpen={isPerformActionModalOpen} onClose={handleClosePerformActionModal}>
        <h2>Perform Action on {selectedFarm?.name}</h2>
        {selectedFarm && (
          <>
            <div className="action-buttons">
              <button onClick={() => setSelectedAction('plantseeds')}>Plant Seeds</button>
              <button onClick={() => setSelectedAction('waterplants')}>Water Plants</button>
              <button onClick={() => setSelectedAction('harvest')}>Harvest Crops</button>
              <button onClick={() => setSelectedAction('sellcrops')}>Sell Crops</button>
            </div>
            <PerformAction
              session={session}
              action={selectedAction}
              userPlots={selectedFarm.plots}
              selectedNFTs={selectedNFTs} // Pass the selected NFTs
              setSelectedNFTs={setSelectedNFTs} // Function to update selected NFTs
            />
          </>
        )}
      </Modal>
    </>
  );
};

export default Farms;
