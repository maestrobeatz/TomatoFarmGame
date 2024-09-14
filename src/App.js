import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import sessionKit, { saveSession, restoreSession } from './sessionConfig';
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
} from './components/api'; // Ensure registerFarmer is imported

function App() {
  const [session, setSession] = useState(null);
  const [accountInfo, setAccountInfo] = useState(null);
  const [farmers, setFarmers] = useState([]);
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [isRegistered, setIsRegistered] = useState(false); // Add state to track registration
  const [selectedAction, setSelectedAction] = useState(''); 
  const [selectedNFTs, setSelectedNFTs] = useState({}); 
  const [loadingStates, setLoadingStates] = useState({
    farmers: false,
    account: false,
    farms: false,
    plots: false,
  });
  const [error, setError] = useState(null);

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

  // Fetch registered farmers list
  const fetchFarmersList = useCallback(async () => {
    setLoadingStates((prev) => ({ ...prev, farmers: true }));
    try {
      const farmersData = await getFarmers();
      setFarmers(farmersData.farmers || []);
      const isUserRegistered = farmersData.farmers.some(farmer => farmer.accountName === session.actor.toString());
      setIsRegistered(isUserRegistered); // Check if the user is registered
    } catch (err) {
      console.error("Error fetching farmers:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, farmers: false }));
    }
  }, [session]);

  // Fetch user-specific data (account info, farms, plots)
  const fetchUserData = useCallback(async () => {
    if (!session || !session.actor) return;
    const accountName = session.actor.toString();

    // Fetch Account Info
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

    // Fetch Farms and Plots
    setLoadingStates((prev) => ({ ...prev, farms: true, plots: true }));
    try {
      const farmsData = await getFarmsWithPlots(accountName);
      const plotsData = await getPlots(accountName);
      setFarms(farmsData.farms || []);
      setPlots(plotsData.message === 'No plots found for this user.' ? [] : (plotsData.plots || []));
    } catch (err) {
      console.error("Error fetching farms/plots data:", err);
    } finally {
      setLoadingStates((prev) => ({ ...prev, farms: false, plots: false }));
    }
  }, [session]);

  // Refetch data when session changes
  useEffect(() => {
    if (session && session.actor) {
      fetchUserData();
    }
    fetchFarmersList();
  }, [session, fetchUserData, fetchFarmersList]);

  // Handle login
  const handleLogin = async () => {
    try {
      const result = await sessionKit.login();
      const newSession = result.session;
      setSession(newSession);
      saveSession(newSession);
      await fetchUserData();
    } catch (err) {
      console.error("Error during login:", err);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    if (session) {
      try {
        await sessionKit.logout(session);
        setSession(null);
        setAccountInfo(null);
        setFarmers([]);
        setFarms([]);
        setPlots([]);
        setIsRegistered(false);
        localStorage.removeItem('userSession');
      } catch (err) {
        console.error("Error during logout:", err);
      }
    }
  };

  // Handle Register Farmer
  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) return;
    try {
      const username = prompt('Enter a username (max 12 characters):');
      if (!username || username.length > 12) {
        alert('Username must be 12 characters or less.');
        return;
      }
      await registerFarmer(session.actor.toString(), username); // API call to register the farmer
      setIsRegistered(true); // Update the state after successful registration
      alert('Farmer registered successfully!');
    } catch (err) {
      console.error("Error registering farmer:", err);
      alert('Error registering farmer.');
    }
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
                <h2>Choose Action</h2>
                {/* Buttons to select the action */}
                <div className="action-buttons">
                  <button onClick={() => setSelectedAction('plantseeds')}>Plant Seeds</button>
                  <button onClick={() => setSelectedAction('waterplants')}>Water Plants</button>
                  <button onClick={() => setSelectedAction('harvest')}>Harvest Crops</button>
                  <button onClick={() => setSelectedAction('sellcrops')}>Sell Crops</button>
                  <button onClick={() => setSelectedAction('refillcan')}>Refill Watering Can</button>
                </div>
                <PerformAction session={session} action={selectedAction} userPlots={plots} selectedNFTs={selectedNFTs} setSelectedNFTs={setSelectedNFTs} />
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
