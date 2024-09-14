import React, { useState, useEffect, useCallback } from 'react';
import './Farms.css';
import { getFarmsWithPlots } from './api';

const Farms = ({ session, performTransaction, fetchData }) => {
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

  const handleStakeUnstake = async (farmId, isStaked) => {
    const actionName = isStaked ? 'unstakefarm' : 'stakefarm';
    try {
      await performTransaction(actionName, {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: actionName,
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: { farm_nft_id: farmId, owner: session.actor.toString() },
      });
      await fetchData();
      await fetchFarmsData(); // Refresh farms data after transaction
    } catch (error) {
      console.error(`Error ${isStaked ? 'unstaking' : 'staking'} farm:`, error);
      setError(`Failed to ${isStaked ? 'unstake' : 'stake'} farm: ` + error.message);
    }
  };

  const renderFarmCard = (farm) => (
    <div key={farm.farmId} className="farm-card">
      <p><strong>Farm Name:</strong> {farm.name}</p>
      <p><strong>Farm ID:</strong> {farm.farmId}</p>
      <p><strong>Total Plots:</strong> {farm.plots}</p>
      {farm.plotDetails && farm.plotDetails.length > 0 && (
        <div>
          <p><strong>Plots:</strong></p>
          <ul>
            {farm.plotDetails.map(plot => (
              <li key={`${farm.farmId}-${plot.id}`}>
                Plot ID: {plot.id}, Status: {plot.status}
              </li>
            ))}
          </ul>
        </div>
      )}
      {farm.owner === session.actor.toString() && (
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
          {userFarms.map(renderFarmCard)}
        </div>
      ) : (
        <p>You have no farms.</p>
      )}

      <h3>All Farms in the Game</h3>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="farms-list">
          {allFarms.map(renderFarmCard)}
        </div>
      )}
    </>
  );
};

export default Farms;
