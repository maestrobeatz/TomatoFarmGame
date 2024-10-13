import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import useSession from './hooks/useSession';
import Login from './components/Login';
import WalletModal from './components/Wallet/WalletModal';
import NFTList from './components/NFTList';
import Farms from './components/Farms';
import AccountInfo from './components/Game/AccountInfo';
import FarmersList from './components/Game/FarmersList';
import PlotStatus from './components/Game/PlotStatus';
import PerformAction from './components/Game/PerformAction';
import 'bootstrap/dist/css/bootstrap.min.css';
import logo from './MaestroBeatzLogo.png';  
import {
  getFarmers,
  getFarmsWithPlots,
  getPlots,
  registerFarmer,
  getUsername,
  createUsername,
  getUserNFTs
} from './components/api';
import { fetchAccountInfoByAccountName } from './components/Wallet/walletApi/accountApi'; 

function AppContent() {
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Fetch plots only when actions are performed
  const fetchPlotsData = useCallback(async () => {
    if (!session || !session.actor) return;
    const accountName = session.actor.toString();

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

  // Fetch general user data (farms, account info)
  const fetchUserData = useCallback(async () => {
    if (!session || !session.actor) return;
    const accountName = session.actor.toString();

    setLoadingStates((prev) => ({ ...prev, account: true }));
    try {
      const accountInfoData = await fetchAccountInfoByAccountName(accountName);  
      setAccountInfo(accountInfoData);
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

    // Fetch plots only once here (on initial load)
    fetchPlotsData();
  }, [session, fetchPlotsData]);

  useEffect(() => {
    if (session && session.actor) {
      fetchUserData();
      fetchUsername();
    } else {
      console.warn("No valid session, skipping user data fetch.");
    }
    fetchFarmersList();
  }, [session, fetchUserData, fetchFarmersList, fetchUsername]);

  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) {
      console.error("Session is not available or user is not logged in");
      return;
    }

    try {
      const result = await registerFarmer(session.actor.toString(), 'Nickname', session);
      console.log('Register farmer result:', result);
      setIsRegistered(true);
      await fetchFarmersList();
    } catch (err) {
      console.error("Failed to register farmer:", err);
    }
  };

  const handleCreateUsername = async () => {
    if (!newUsername || !session || !session.actor) {
      console.error("Invalid username or session");
      return;
    }

    try {
      await createUsername(session.actor.toString(), newUsername);
      setUsername(newUsername);
      setNewUsername('');
      await fetchFarmersList();
    } catch (err) {
      console.error("Failed to create username:", err);
    }
  };

  const handleActionSelection = async (action) => {
    setSelectedAction(action);
    // Fetch plots after plot actions (planting, watering, harvesting)
    if (['plantseeds', 'waterplants', 'harvest', 'sellcrops', 'refillcan'].includes(action)) {
      await fetchPlotsData(); // Refetch plot data after plot-related actions
    }
  };

  const handleOpenWallet = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to {process.env.REACT_APP_SITE_TITLE}</h1>
        <img src={logo} className="App-logo" alt="logo" />
        <a href="https://test.neftyblocks.com/collection/maestrobeatz" target="_blank" rel="noopener noreferrer">
          <button className="nft-collection-button">View NFT Collection</button>
        </a>
        <div className="auth-buttons">
          <Login session={session} login={handleLogin} logout={handleLogout} />
          <button onClick={handleOpenWallet} className="wallet-modal-button">
            Open Wallet
          </button>
        </div>
        {session && !isRegistered && (
          <button onClick={handleRegisterFarmer} className="register-button">
            Register as Farmer
          </button>
        )}
        {session && !username && (
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

      <WalletModal
        show={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
        accountName={session?.actor?.toString() || ''}
      />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
