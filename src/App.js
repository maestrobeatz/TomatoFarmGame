import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { BrowserRouter as Router } from 'react-router-dom';
import useSession from './hooks/useSession';
import { InitTransaction } from './components/transactionHandler'; // Import transaction handler
import Login from './components/Login';
import WalletModal from './components/Wallet/WalletModal';
import NFTList from './components/NFTList';
import Farms from './components/Farms';
import AccountInfo from './components/Game/AccountInfo';
import Modal from './components/Modal';
import FarmersList from './components/Game/FarmersList';
import logo from './MaestroBeatzLogo.png';
import {
  getFarmers,
  getFarmsWithPlots,
  getPlots
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
  const [newUsername, setNewUsername] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFarmersModalOpen, setIsFarmersModalOpen] = useState(false); // State for Farmers modal
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false); // State for NFT List modal

  // Fetch the list of farmers
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

  // Check if the current user is a registered farmer
  const checkFarmerRegistration = useCallback(() => {
    if (session && session.actor) {
      const isUserRegistered = farmers.some(farmer => farmer.account === session.actor.toString());
      setIsRegistered(isUserRegistered);
    }
  }, [session, farmers]);

  // Find the current user's username in the farmers list
  const currentUser = session && session.actor ? farmers.find(farmer => farmer.account === session.actor.toString()) : null;
  const username = currentUser?.username || null;

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

    fetchPlotsData();
  }, [session, fetchPlotsData]);

  useEffect(() => {
    if (session && session.actor) {
      fetchUserData();
    } else {
      console.warn("No valid session, skipping user data fetch.");
    }
    fetchFarmersList();
  }, [session, fetchUserData, fetchFarmersList]);

  useEffect(() => {
    checkFarmerRegistration();
  }, [farmers, checkFarmerRegistration]);

  const handleRegisterFarmer = async () => {
    if (!session || !session.actor) {
      console.error("Session is not available or user is not logged in");
      return;
    }

    try {
      const transactionData = {
        actions: [{
          account: process.env.REACT_APP_CONTRACT_NAME, // Use contract name from .env
          name: "regfarmer",
          authorization: [{
            actor: session.actor,
            permission: "active",
          }],
          data: {
            user: session.actor,
          }
        }]
      };

      const result = await InitTransaction(transactionData);
      console.log('Farmer registration transaction result:', result);

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
      const transactionData = {
        actions: [{
          account: process.env.REACT_APP_CONTRACT_NAME, // Use contract name from .env
          name: "addusername",
          authorization: [{
            actor: session.actor,
            permission: "active",
          }],
          data: {
            user: session.actor,
            nickname: newUsername,
          }
        }]
      };

      // Perform the transaction
      const result = await InitTransaction(transactionData);
      console.log('Username creation transaction result:', result);

      // After creating the username, refresh the farmers list
      await fetchFarmersList();

    } catch (err) {
      console.error("Failed to create username:", err);
    }
  };

  const handleOpenWallet = () => {
    setIsModalOpen(true);
  };

  const handleOpenFarmersModal = () => {
    setIsFarmersModalOpen(true);
  };

  const handleCloseFarmersModal = () => {
    setIsFarmersModalOpen(false);
  };

  const handleOpenNFTModal = () => {
    setIsNFTModalOpen(true);
  };

  const handleCloseNFTModal = () => {
    setIsNFTModalOpen(false);
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
        {session && isRegistered && (username === null || username === 'N/A') && (
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

            {/* Farmers and NFT List buttons and modals */}
            <div className="section">
              <button onClick={handleOpenFarmersModal} className="farmers-button">
                Registered Farmers
              </button>
              <Modal isOpen={isFarmersModalOpen} onClose={handleCloseFarmersModal}>
                <h2>Registered Farmers</h2>
                <FarmersList farmers={farmers} />
              </Modal>

              {/* NFT List Button and Modal */}
              <button onClick={handleOpenNFTModal} className="nft-list-button">
                View Your NFTs
              </button>
              <Modal isOpen={isNFTModalOpen} onClose={handleCloseNFTModal}>
                <h2>Your NFTs</h2>
                <NFTList actor={session.actor.toString()} />
              </Modal>
            </div>

            <div className="section">
              <h2>Farms</h2>
              <Farms session={session} farms={farms} plots={plots} selectedNFTs={selectedNFTs} setSelectedNFTs={setSelectedNFTs} />
            </div>
          </>
        )}
      </header>

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
