import React, { useState, useEffect, useCallback } from 'react';
import './Farms.css';
import { getFarmsWithPlots } from './api';

const Farms = ({ session, fetchData }) => {
  const [userFarms, setUserFarms] = useState([]);
  const [allFarms, setAllFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFarmsData = useCallback(async () => {
    if (!session?.actor) return;
    setIsLoading(true);
    try {
      const farmsData = await getFarmsWithPlots(session.actor.toString());
      console.log("Fetched farms data:", farmsData);
      const userFarmsData = farmsData.farms.filter(farm => farm.owner === session.actor.toString());
      setUserFarms(userFarmsData || []);
      setAllFarms(farmsData.farms || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching farms data:', error);
      setError('Error fetching farms data: ' + error.message);
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
            permission: 'active'
          }],
          data: actionData
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      });
      console.log('Transaction successful:', result);
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
      await fetchData(); // Refresh global data after the transaction
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
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : userFarms.length > 0 ? (
        <div className="farms-list">
          {userFarms.map(farm => renderFarmCard(farm, true))} {/* Render with Stake/Unstake */}
        </div>
      ) : (
        <p>You have no farms.</p>
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
