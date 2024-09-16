import React, { useState, useEffect, useCallback } from 'react';
import './Farms.css';
import { getFarmsWithPlots, getNFTStatus } from './api'; // Add getNFTStatus to check staking status

const Farms = ({ session }) => {
  const [userFarms, setUserFarms] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch farms data and check staking status for each farm
  const fetchFarmsData = useCallback(async () => {
    if (!session?.actor) return;
    setIsLoading(true);
    try {
      const farmsData = await getFarmsWithPlots(session.actor.toString());
      console.log("Fetched farms data:", farmsData);

      // Check staking status for each farm but handle errors gracefully
      const userFarmsData = await Promise.all(
        farmsData.farms.map(async (farm) => {
          try {
            const farmStatus = await getNFTStatus(farm.farmId); // Assuming getNFTStatus checks if farm is staked
            return {
              ...farm,
              is_staked: farmStatus.is_staked, // Add staking status to farm data
            };
          } catch (err) {
            console.error(`Failed to fetch staking status for farm ${farm.farmId}:`, err);
            return {
              ...farm,
              is_staked: false, // Default to not staked if error occurs
            };
          }
        })
      );

      setUserFarms(userFarmsData || []);
      setAllFarms(farmsData.farms || []);
      setError(null); // Reset error if data is fetched successfully
    } catch (error) {
      console.error('Error fetching farms data:', error);
      // Don't prevent rendering farms if there is an error
      setError('Error fetching some farm data, but farms will be displayed.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchFarmsData();
  }, [fetchFarmsData]);

  const performTransaction = async (actionName, actionData) => {
    try {
      const result = await session.transact({
        actions: [{
          account: process.env.REACT_APP_CONTRACT_NAME,
          name: actionName,
          authorization: [{
            actor: session.actor.toString(),
            permission: 'active',
          }],
          data: actionData,
        }],
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      console.log('Transaction successful:', result);
      await fetchFarmsData(); // Refresh farms data after transaction
    } catch (error) {
      console.error('Transaction failed:', error);
    }
  };

  const handleStakeUnstake = async (farmId, isStaked) => {
    const actionName = isStaked ? 'unstakefarm' : 'stakefarm';
    try {
      await performTransaction(actionName, {
        farm_nft_id: farmId,
        owner: session.actor.toString(),
      });
      await fetchFarmsData(); // Refresh farms data after transaction
    } catch (error) {
      console.error(`Error ${isStaked ? 'unstaking' : 'staking'} farm:`, error);
      setError(`Failed to ${isStaked ? 'unstake' : 'stake'} farm: ` + error.message);
    }
  };

  const renderFarmCard = (farm, isUserFarm) => (
    <div key={farm.farmId} className="farm-card">
      <p><strong>Farm Name:</strong> {farm.name}</p>
      <p><strong>Farm ID:</strong> {farm.farmId}</p>
      <p><strong>Total Plots:</strong> {farm.plots}</p>
      {/* Only render the Stake/Unstake button for the user's farms */}
      {isUserFarm && (
        <button
          className="action-button"
          onClick={() => handleStakeUnstake(farm.farmId, farm.is_staked)}
        >
          {farm.is_staked ? 'Unstake Farm' : 'Stake Farm'}
        </button>
      )}
    </div>
  );

  return (
    <>
      <h3>Your Farms</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {error && <p className="error-message">{error}</p>} {/* Display the error, but continue rendering */}
          {userFarms.length > 0 ? (
            <div className="farms-list">
              {userFarms.map(farm => renderFarmCard(farm, true))} {/* Render with Stake/Unstake */}
            </div>
          ) : (
            <p>You have no farms.</p>
          )}
        </>
      )}

      <h3>All Farms in the Game</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="farms-list">
          {allFarms.map(farm => renderFarmCard(farm, false))} {/* No Stake/Unstake here */}
        </div>
      )}
    </>
  );
};

export default Farms;
