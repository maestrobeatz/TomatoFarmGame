import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import useSession from './hooks/useSession';
import ErrorBoundary from './components/ErrorBoundary';
import logo from './MaestroBeatzLogo.png';
import AccountInfo from './components/AccountInfo';
import FarmersList from './components/FarmersList';
import Login from './components/Login';
import NFTList from './components/NFTList';
import PlotStatus from './components/PlotStatus';
import Farms from './components/Farms';
import PerformAction from './components/PerformAction';

import {
  getFarmers,
  getFarmsWithPlots,
  getAccountInfo,
  getPlots,
  registerFarmer,
  getUsername,
  createUsername,
} from './components/api';

function App() {
  const { session, handleLogin, handleLogout } = useSession();
  const [accountInfo, setAccountInfo] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false);
  const [selectedAction, setSelectedAction] = useState('plantseeds');
  const [selectedNFTs, setSelectedNFTs] = useState({});
  const [loadingStates, setLoadingStates] = useState({
    farmers: false,
    account: false,
    farms: false,
    plots: false,
  });
  const [username, setUsername] = useState(null);
  const [newUsername, setNewUsername] = useState('');

  // Fetch registered farmers list
  const fetchFarmersList = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, farmers: true }));
    try {
      const farmersData = await getFarmers();
      setFarmers(farmersData.farmers || []);
    } catch (err) {
      console.error("Error fetching farmers:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, farmers: false }));
    }
  }, []);

  // Fetch username after user logs in
  const fetchUsername = useCallback(async () => {
    if (session && session.actor) {
      try {
        const fetchedUsername = await getUsername(session.actor.toString());
        setUsername(fetchedUsername?.username || null);
      } catch (err) {
        console.error("Error fetching username:", err);
      }
    }
  }, [session]);

  // Fetch user-specific data (account info, farms, plots)
  const fetchUserData = useCallback(async () => {
    if (!session || !session.actor) return;
    const accountName = session.actor.toString();

    setLoadingStates((prev) => ({ ...prev, account: true }));
    try {
      const accountInfoData = await getAccountInfo(accountName);
      setAccountInfo(accountInfoData || {
        accountName: 'Unknown',
        balance: '0.0000 WAX',
        cpu_stake: 'N/A',
        net_stake: 'N/A',
        ram_usage: 0,
        ram_quota: 0,
        cpu_limit: { used: 0, max: 1 }
      });
    } catch (err) {
      console.error("Error fetching account info:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, account: false }));
    }

    setLoadingStates((prev) => ({ ...prev, farms: true }));
    try {
      const farmsData = await getFarmsWithPlots(accountName);
      setFarms(farmsData.farms || []);
    } catch (err) {
      console.error("Error fetching farms data:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, farms: false }));
    }

    setLoadingStates((prev) => ({ ...prev, plots: true }));
    try {
      const plotsData = await getPlots(accountName);
      setPlots(plotsData.message === 'No plots found for this user.' ? [] : (plotsData.plots || []));
    } catch (err) {
      console.error("Error fetching plots data:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, plots: false }));
    }
  }, [session]);

  useEffect(() => {
    if (session && session.actor) {
      fetchUserData();
      fetchUsername();
    }
    fetchFarmersList();
  }, [session, fetchUserData, fetchFarmersList, fetchUsername]);

  // Handle register as farmer
  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) {
      console.error("Session is not available or user is not logged in");
      return;
    }

    try {
      const result = await registerFarmer(session.actor.toString(), 'Nickname', session);
      console.log('Register farmer result:', result);
      setIsRegistered(true);
      await fetchFarmersList(); // Refresh the farmers list after registration
    } catch (err) {
      console.error("Failed to register farmer:", err);
    }
  };

  // Handle username creation
  const handleCreateUsername = async () => {
    if (!newUsername || !session || !session.actor) {
      console.error("Invalid username or session");
      return;
    }

    try {
      await createUsername(session.actor.toString(), newUsername);
      setUsername(newUsername);
      setNewUsername('');  // Clear the input field after creation
      await fetchFarmersList();  // Refresh farmers list to show updated username
    } catch (err) {
      console.error("Failed to create username:", err);
    }
  };

  // Handle the selection of an action
  const handleActionSelection = (action) => {
    setSelectedAction(action);
  };

  return (
    <ErrorBoundary>
      <div className="App">
        <header className="App-header">
          <h1>Welcome to {process.env.REACT_APP_SITE_TITLE}</h1>
          <img src={logo} className="App-logo" alt="logo" />
          <a href="https://test.neftyblocks.com/collection/maestrobeatz" target="_blank" rel="noopener noreferrer">
            <button className="nft-collection-button">View NFT Collection</button>
          </a>
          {session && (
            <div className="action-buttons">
              <button onClick={handleLogout} className="logout-button">Logout</button>
              {!isRegistered && (
                <button onClick={handleRegisterFarmer} className="register-button">
                  Register as Farmer
                </button>
              )}
              {!username && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                  <button onClick={handleCreateUsername} className="create-username-button">
                    Create Username
                  </button>
                </div>
              )}
            </div>
          )}
          {!session && <Login session={session} login={handleLogin} />}
          {loadingStates.account && <p>Loading account info...</p>}
          {session && (
            <>
              <div className="section">
                <h2>Account Information</h2>
                <AccountInfo accountInfo={accountInfo || {}} />
              </div>
              <div className="section">
                <h2>Farms</h2>
                <Farms session={session} farms={farms} plots={plots} />
              </div>
              <div className="section">
                <h2>Your Plot Status</h2>
                <PlotStatus session={session} plots={plots} />
              </div>
              <div className="section">
                <h2>Your NFTs</h2>
                <NFTList actor={session.actor.toString()} />
              </div>
              <div className="section">
                <h2>Perform Actions</h2>
                <div className="action-buttons">
                  <button onClick={() => handleActionSelection('plantseeds')}>Plant Seeds</button>
                  <button onClick={() => handleActionSelection('waterplants')}>Water Plants</button>
                  <button onClick={() => handleActionSelection('harvest')}>Harvest</button>
                  <button onClick={() => handleActionSelection('sellcrops')}>Sell Crops</button>
                  <button onClick={() => handleActionSelection('refillcan')}>Refill Water</button>
                </div>
                <PerformAction session={session} action={selectedAction} selectedNFTs={selectedNFTs} setSelectedNFTs={setSelectedNFTs} userPlots={plots} />
              </div>
            </>
          )}
        </header>
        <div className="section">
          <h2>Registered Farmers</h2>
          <FarmersList farmers={farmers} />
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
