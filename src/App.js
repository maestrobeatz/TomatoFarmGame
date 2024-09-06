import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import sessionKit, { saveSession, restoreSession } from './sessionConfig';
import ErrorBoundary from './components/ErrorBoundary';
import logo from './MaestroBeatzLogo.png';
import AccountInfo from './components/AccountInfo';
import PerformAction from './components/PerformAction';
import FarmersList from './components/FarmersList';
import Login from './components/Login';
import NFTList from './components/NFTList';
import PlotStatus from './components/PlotStatus';
import { getFarmers, registerFarmer, unregisterFarmer } from './components/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const FARMSTEAD_TEMPLATE_ID = '654617';

const requiredNFTs = {
  rhythmCompostSoil: '653267',
  melodyWateringCan: '653268',
  beatzTomatoSeeds: '653266',
};

function App() {
  const [session, setSession] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const initSession = async () => {
      try {
        const restoredSession = await restoreSession();
        if (restoredSession) {
          setSession(restoredSession);
        }
      } catch (err) {
        setError('Failed to restore session: ' + err.message);
      }
    };
    initSession();
  }, []);

  const fetchData = useCallback(async () => {
    if (!session || !session.actor) return;
    setIsLoading(true);
    try {
      const [farmersData, accountInfoData, farmsData, inventoryData, plotsData] = await Promise.all([
        getFarmers(),
        fetch(`${API_BASE_URL}/account/${session.actor.toString()}`).then(res => res.json()),
        fetch(`${API_BASE_URL}/farms-with-plots`).then(res => res.json()),
        fetch(`${API_BASE_URL}/nfts/${session.actor.toString()}`).then(res => res.json()),
        fetch(`${API_BASE_URL}/plots/${session.actor.toString()}`),
      ]);

      setFarmers(farmersData.farmers || []);
      setAccountInfo(accountInfoData);
      setFarms(farmsData.farms || []);
      setInventory(inventoryData.nfts || []);

      if (plotsData.ok) {
        const plotsJson = await plotsData.json();
        setPlots(plotsJson.plots || []);
      } else if (plotsData.status === 404) {
        setError('No plots found. You can create a farm to start.');
        setPlots([]);
      } else {
        throw new Error(`Failed to fetch plot data: ${plotsData.statusText}`);
      }

      const farmer = farmersData.farmers.find(farmer => farmer.accountName === session.actor.toString());
      setIsRegistered(!!farmer);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && session.actor) {
      fetchData();
    }
  }, [session, fetchData]);

  const handleLogin = async () => {
    try {
      const result = await sessionKit.login();
      if (!result || !result.session) {
        throw new Error('Login failed: No valid session returned');
      }
      const newSession = result.session;
      if (!newSession.actor) {
        throw new Error('Login failed: No actor in session');
      }
      setSession(newSession);
      saveSession(newSession);
      await fetchData();
    } catch (err) {
      setError('Error during login: ' + err.message);
    }
  };

  const handleLogout = async () => {
    if (session) {
      try {
        await sessionKit.logout(session);
        setSession(null);
        setAccountInfo(null);
        setInventory([]);
        setFarmers([]);
        setFarms([]);
        setPlots([]);
        setIsRegistered(false);
        localStorage.removeItem('userSession');
      } catch (err) {
        setError('Error during logout: ' + err.message);
      }
    }
  };

  const performTransaction = async (actionName, actionData) => {
    try {
      console.log('Sending action data:', actionData);
      const result = await session.transact({
        actions: [actionData],
      });
      console.log(`${actionName} transaction result:`, result);
      
      // Send the action data to the backend
      const response = await fetch(`${API_BASE_URL}/${actionName}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...actionData.data,
          transactionId: result.transactionId,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process transaction on backend');
      }
      
      const data = await response.json();
      console.log('Backend response:', data);

      return data;
    } catch (error) {
      console.error(`Error performing ${actionName} action`, error);
      setError(`Failed to perform action ${actionName}: ${error.message}`);
      throw error;
    }
  };

  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) {
      setError('Please login first');
      return;
    }
    try {
      const nickname = isRegistered ? null : prompt('Enter a nickname (max 12 characters):');
      if (!nickname && !isRegistered) {
        setError('Nickname is required and must be 12 characters or less.');
        return;
      }

      const actionName = isRegistered ? 'unregfarmer' : 'regfarmer';
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: actionName,
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          user: session.actor.toString(),
          nickname: nickname,
        }
      };

      const result = await performTransaction(actionName, actionData);

      if (isRegistered) {
        await unregisterFarmer(session.actor.toString(), result.transactionId);
        setIsRegistered(false);
      } else {
        await registerFarmer(session.actor.toString(), nickname, result.transactionId);
        setIsRegistered(true);
      }

      await fetchData();
    } catch (err) {
      setError(`Failed to ${isRegistered ? 'unregister' : 'register'} farmer: ${err.message}`);
    }
  };

  const handleCreateFarm = async () => {
    if (!session || !session.actor) {
      setError('Please login first');
      return;
    }
    try {
      const farmName = prompt('Enter a name for your farm:');
      if (!farmName) {
        setError('Farm name is required.');
        return;
      }

      const farmNft = inventory.find(nft => nft.template.template_id === FARMSTEAD_TEMPLATE_ID && !farms.some(farm => farm.farm_nft_id === nft.asset_id));
      if (!farmNft) {
        setError('You do not own a valid farm NFT or the NFT has already been used to create a farm.');
        return;
      }

      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'createfarm',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          farm_nft_id: farmNft.asset_id,
          farm_name: farmName
        },
      };

      await performTransaction('createfarm', actionData);
      await fetchData();
    } catch (err) {
      setError('Failed to create farm: ' + err.message);
    }
  };

  const handleStakeFarm = async (farmNftId) => {
    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'stakefarm',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          farm_nft_id: farmNftId,
        },
      };

      await performTransaction('stakefarm', actionData);
      await fetchData();
    } catch (err) {
      setError('Failed to stake farm: ' + err.message);
    }
  };

  const handleUnstakeFarm = async (farmNftId) => {
    try {
      const actionData = {
        account: process.env.REACT_APP_CONTRACT_NAME,
        name: 'unstakefarm',
        authorization: [{ actor: session.actor.toString(), permission: 'active' }],
        data: {
          owner: session.actor.toString(),
          farm_nft_id: farmNftId,
        },
      };

      await performTransaction('unstakefarm', actionData);
      await fetchData();
    } catch (err) {
      setError('Failed to unstake farm: ' + err.message);
    }
  };

  const handleActionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const actions = ['plantseeds', 'waterplants', 'harvest', 'sellcrops'];

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to {process.env.REACT_APP_SITE_TITLE}</h1>
          <img src={logo} className="App-logo" alt="logo" />
          <div className="button-group">
            <Login session={session} login={handleLogin} logout={handleLogout} />
            {session && inventory.some(nft => nft.template.template_id === FARMSTEAD_TEMPLATE_ID && !farms.some(farm => farm.farm_nft_id === nft.asset_id)) && (
              <button onClick={handleCreateFarm}>Create Farm</button>
            )}
            {session && (
              <button onClick={handleRegisterFarmer}>
                {isRegistered ? 'Unregister' : 'Register as Farmer'}
              </button>
            )}
          </div>
          {isLoading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {session && accountInfo && (
            <>
              <div className="section">
                <h2>Account Information</h2>
                <AccountInfo accountInfo={accountInfo} />
              </div>
              {inventory.some(nft => nft.template.template_id === FARMSTEAD_TEMPLATE_ID) && (
                <div className="section">
                  <h2>Farms</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Farm ID</th>
                        <th>Farm Name</th>
                        <th>Available Plots</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {farms
                        .filter(farm => farm.owner === session.actor.toString())  // Only show the user's farms
                        .map(farm => (
                          <tr key={farm.farm_nft_id}>
                            <td>{farm.farm_nft_id}</td>
                            <td>{farm.farm_name}</td>
                            <td>{farm.available_plots}</td>
                            <td>
                              <button onClick={() => handleStakeFarm(farm.farm_nft_id)}>Stake Farm</button>
                              <button onClick={() => handleUnstakeFarm(farm.farm_nft_id)}>Unstake Farm</button>
                            </td>
                          </tr>
                        ))}
                      {farms.length === 0 && (
                        <tr>
                          <td colSpan="4">You have no farms.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
              <div className="section">
                <h2>Available Farms</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Farm ID</th>
                      <th>Farm Name</th>
                      <th>Plot ID</th>
                      <th>Plot Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {farms
                      .filter(farm => farm.is_staked)  // Only show staked farms
                      .map(farm =>
                        farm.plots.map(plot => (
                          <tr key={plot.plot_id}>
                            <td>{farm.farm_nft_id}</td>
                            <td>{farm.farm_name}</td>
                            <td>{plot.plot_id}</td>
                            <td>{plot.user === session.actor.toString() ? 'Owned' : 'Not Owned'}</td>
                            <td>
                              {plot.user === session.actor.toString() ? (
                                <button onClick={() => handleActionComplete(plot.plot_id)}>Perform Action</button>
                              ) : (
                                <span>Not available</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                  </tbody>
                </table>
              </div>
              <div className="section">
                <h2>Your Plot Status</h2>
                <PlotStatus session={session} refreshTrigger={refreshTrigger} />
              </div>
              <div className="section">
                <h2>Your Actions</h2>
                <div className="actions-grid">
                  {actions.map(action => (
                    <PerformAction
                      key={action}
                      session={session}
                      action={action}
                      requiredNFTs={requiredNFTs}
                      onActionComplete={handleActionComplete}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </header>
        {session && session.actor && (
          <>
            <div className="section">
              <h2>Registered Farmers</h2>
              <p>Total Farmers: {farmers.length}</p>
              <FarmersList farmers={farmers} />
            </div>
            <div className="section">
              <h2>Your NFTs</h2>
              <NFTList actor={session.actor.toString()} />
            </div>
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
