import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import sessionKit from './sessionConfig';
import ErrorBoundary from './components/ErrorBoundary';
import logo from './MaestroBeatzLogo.png';
import AccountInfo from './components/AccountInfo';
import PerformAction from './components/PerformAction';
import FarmersList from './components/FarmersList';
import Login from './components/Login';
import NFTList from './components/NFTList';
import { getFarmers, registerFarmer, getInventory, verifyLogin } from './components/api';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

// Corrected template IDs
const requiredNFTs = [
  '653267', // Rhythm Compost Soil
  '653268', // Melody Watering Can
  '653266'  // BEATZ Tomato Seeds
];

function App() {
    const [session, setSession] = useState(null);
    const [accountInfo, setAccountInfo] = useState(null);
    const [inventory, setInventory] = useState(null);
    const [farmers, setFarmers] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!session || !session.actor) return;
        setIsLoading(true);
        try {
            const farmersData = await getFarmers();
            setFarmers(farmersData.farmers || []);

            const inventoryData = await getInventory(session.actor.toString());
            setInventory(inventoryData);

            const accountInfoData = await fetch(`${API_BASE_URL}/account/${session.actor.toString()}`).then(res => res.json());
            setAccountInfo(accountInfoData);

            setError(null);
        } catch (e) {
            setError('Failed to fetch data: ' + e.message);
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

            const message = 'your_message_here'; // Replace with the actual message you want to sign
            const signature = await sessionKit.sign(message);

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyLogin`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    actor: newSession.actor.toString(),
                    permission: newSession.permission,
                    signature: signature,
                }),
            });

            const data = await response.json();
            if (!data.success) {
                throw new Error(data.message || 'Login failed');
            }

            await fetchData();
        } catch (e) {
            setError('Error during login: ' + e.message);
        }
    };

    const handleLogout = async () => {
        if (session) {
            try {
                await sessionKit.logout(session);
                setSession(null);
                setAccountInfo(null);
                setInventory(null);
                setFarmers([]);
            } catch (e) {
                setError('Error during logout: ' + e.message);
            }
        }
    };

    const handleRegisterFarmer = async () => {
        if (!session || !session.actor) {
            setError('Please login first');
            return;
        }
        try {
            const result = await registerFarmer(session.actor.toString());
            await fetchData();
        } catch (e) {
            setError('Failed to register farmer: ' + e.message);
        }
    };

    const actions = ['plantseeds', 'waterplants', 'harvest', 'sellcrops'];

    return (
        <ErrorBoundary>
            <div className="App">
                <header className="App-header">
                    <h1>Welcome to {process.env.REACT_APP_SITE_TITLE}</h1>
                    <img src={logo} className="App-logo" alt="logo" />
                    <Login session={session} login={handleLogin} logout={handleLogout} />
                    {isLoading && <p>Loading...</p>}
                    {error && <p className="error-message">{error}</p>}
                    {session && accountInfo && (
                        <div className="section">
                            <h2>Account Information</h2>
                            <AccountInfo accountInfo={accountInfo} />
                        </div>
                    )}
                    {session && session.actor && (
                        <div className="section">
                            <h2>Perform Actions</h2>
                            <div className="actions-grid">
                                {actions.map(action => (
                                    <PerformAction
                                        key={action}
                                        session={session}
                                        action={action}
                                        plotId={1}
                                        requiredNFTs={requiredNFTs}
                                    />
                                ))}
                            </div>
                            <button onClick={handleRegisterFarmer}>Register as Farmer</button>
                        </div>
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
