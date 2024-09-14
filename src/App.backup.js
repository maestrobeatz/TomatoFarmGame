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
import Farms from './components/Farms';
import {
  getFarmers,
  registerFarmer,
  unregisterFarmer,
  confirmUnregisterFarmer,
  getInventory,
  getFarmsWithPlots,
  getPlotStatus,
  getAccountInfo,
  getPlots
} from './components/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
const NFT_COLLECTION_URL = 'https://test.neftyblocks.com/collection/maestrobeatz';

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
  const [selectedNFTs, setSelectedNFTs] = useState({ seed: '', compost: '', wateringCan: '' }); // Added state for selected NFTs
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Initialize session on component mount
  useEffect(() => {
    const initSession = async () => {
      try {
        const restoredSession = await restoreSession();
        if (restoredSession) {
          setSession(restoredSession);
          console.log("Session restored: ", restoredSession);
        }
      } catch (err) {
        console.error("Failed to restore session:", err);
        setError('Failed to restore session: ' + err.message);
      }
    };
    initSession();
  }, []);

  // Fetch data when session is available
  const fetchData = useCallback(async () => {
    if (!session || !session.actor) return;
    setIsLoading(true);
    try {
      const accountName = session.actor.toString();
      console.log("Fetching data for actor:", accountName);

      const [farmersData, accountInfoData, farmsData, inventoryData, plotsData] = await Promise.all([
        getFarmers(),
        getAccountInfo(accountName),
        getFarmsWithPlots(accountName),
        getInventory(accountName),
        getPlots(accountName),
      ]);

      console.log("Fetched farmers: ", farmersData);
      console.log("Fetched account info: ", accountInfoData);
      console.log("Fetched farms: ", farmsData);
      console.log("Fetched inventory: ", inventoryData);
      console.log("Fetched plots: ", plotsData);

      setFarmers(farmersData.farmers || []);
      setAccountInfo(accountInfoData);
      setFarms(farmsData.farms || []);
      setInventory(inventoryData.nfts || []);
      console.log('Account Info State: ', accountInfoData); // Log to check accountInfo

      // Graceful handling for no plots
      if (plotsData.message === 'No plots found for this user.') {
        setPlots([]); // Set an empty array for plots if none are found
        console.log("No plots found for the user");
      } else {
        setPlots(plotsData.plots || []);
      }

      const farmer = farmersData.farmers.find(farmer => farmer.accountName === accountName);
      setIsRegistered(!!farmer);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError('Failed to fetch data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Refetch data when session changes
  useEffect(() => {
    if (session && session.actor) {
      fetchData();
    }
  }, [session, fetchData]);

  // Handle login
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
      console.error("Error during login:", err);
      setError('Error during login: ' + err.message);
    }
  };

  // Handle logout
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
        console.error("Error during logout:", err);
        setError('Error during logout: ' + err.message);
      }
    }
  };

  // Perform transactions (e.g., register/unregister farmer)
  const performTransaction = async (actionName, actionData) => {
    try {
      const result = await session.transact({
        actions: [actionData],
      });
      return result;
    } catch (error) {
      console.error(`Failed to perform action ${actionName}:`, error);
      setError(`Failed to perform action ${actionName}: ${error.message}`);
      throw error;
    }
  };

  // Manually refresh data
  const handleManualRefresh = async () => {
    try {
      setIsLoading(true);
      await fetchData();
      setError(null);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      setError('Failed to refresh data: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Unregister farmer
  const handleUnregisterFarmer = async () => {
    if (!session || !session.actor) {
      setError('Please login first');
      return;
    }

    const confirmed = window.confirm("Are you sure you want to unregister?");
    if (!confirmed) return;

    try {
      const action = await unregisterFarmer(session.actor.toString());
      const result = await session.transact({ actions: [action] });
      console.log("Unregister farmer result:", result);

      await confirmUnregisterFarmer(session.actor.toString(), result.transaction_id);

      setIsRegistered(false);
      await fetchData();
    } catch (err) {
      console.error("Failed to unregister farmer:", err);
      setError('Failed to unregister farmer: ' + err.message);
    }
  };

  // Register farmer
  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) {
      setError('Please login first');
      return;
    }

    try {
      const username = prompt('Enter a username (max 12 characters):');
      if (!username || username.length > 12) {
        setError('Invalid username. Must be 12 characters or less.');
        return;
      }

      const result = await registerFarmer(session.actor.toString(), username);
      console.log("Register farmer result:", result);

      setIsRegistered(true);
      await fetchData();
    } catch (err) {
      console.error("Failed to register farmer:", err);
      setError('Failed to register farmer: ' + err.message);
    }
  };

  // Handle action completion (e.g., refresh data after action)
  const handleActionComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Actions for users to perform
  const actions = ['plantseeds', 'waterplants', 'harvest', 'sellcrops'];

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to {process.env.REACT_APP_SITE_TITLE}</h1>
          <img src={logo} className="App-logo" alt="logo" />
          <a href={NFT_COLLECTION_URL} target="_blank" rel="noopener noreferrer">
            <button className="nft-collection-button">View NFT Collection</button>
          </a>
          {session && (
            <div className="action-buttons">
              {isRegistered ? (
                <>
                  <button onClick={handleLogout} className="logout-button">Logout</button>
                  <button onClick={handleUnregisterFarmer} className="unregister-button">Unregister</button>
                </>
              ) : (
                <button onClick={handleRegisterFarmer} className="register-button">
                  Register as Farmer
                </button>
              )}
            </div>
          )}
          {!session && <Login session={session} login={handleLogin} />}
          {isLoading && <p>Loading...</p>}
          {error && <p className="error-message">{error}</p>}
          {session && accountInfo && (
            <>
              <div className="section">
                <h2>Account Information</h2>
                <AccountInfo accountInfo={accountInfo} />
              </div>
              <div className="section">
                <h2>Farms</h2>
                <Farms 
                  session={session} 
                  farms={farms} 
                  plots={plots}
                  performTransaction={performTransaction} 
                  fetchData={fetchData} 
                />
              </div>
              <div className="section">
                <h2>Your Plot Status</h2>
                <PlotStatus 
                  session={session} 
                  plots={plots}
                  refreshTrigger={refreshTrigger} 
                />
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
                      selectedNFTs={selectedNFTs}  // Pass selectedNFTs state
                      setSelectedNFTs={setSelectedNFTs}  // Pass function to update selectedNFTs
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
              <button onClick={handleManualRefresh} className="refresh-button">Refresh Farmers</button>
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
