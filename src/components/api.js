import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://maestrobeatz.servegame.com:3003';

// Helper function to handle API errors
const handleApiError = (error, context) => {
  console.error(`Error ${context}:`, error);
  if (error.response) {
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    console.error('No response received:', error.request);
  } else {
    console.error('Error message:', error.message);
  }
  throw error;
};

export const getFarmers = async () => {
  try {
    console.log('Fetching farmers from:', `${API_BASE_URL}/farmers`);
    const response = await axios.get(`${API_BASE_URL}/farmers`);
    console.log('Farmers data received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching farmers');
  }
};

// Registering a farmer with a blockchain transaction
export const registerFarmer = async (accountName, nickname, session) => {
  try {
    console.log('Registering farmer on blockchain:', { accountName, nickname });

    // Prepare the action for the smart contract
    const action = {
      account: process.env.REACT_APP_CONTRACT_NAME,  // Your contract name
      name: 'regfarmer',  // Action name on the contract
      authorization: [{
        actor: accountName,  // The account performing the transaction
        permission: 'active',
      }],
      data: {
        user: accountName,  // The farmer's account name
        nickname,  // Optional nickname
      },
    };

    // Execute the transaction using the session
    const result = await session.transact({
      actions: [action],
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    });

    console.log('Blockchain transaction result:', result);
    return result;  // Return the result of the transaction
  } catch (error) {
    handleApiError(error, 'registering farmer');
  }
};

export const unregisterFarmer = async (user) => {
  try {
    console.log('Unregistering farmer:', user);
    const response = await axios.post(`${API_BASE_URL}/farmers/unregFarmer`, { user });
    console.log('Unregister farmer response:', response.data);
    return response.data.action;
  } catch (error) {
    handleApiError(error, 'preparing unregister farmer action');
  }
};

export const confirmUnregisterFarmer = async (user, transactionId) => {
  try {
    console.log('Confirming unregister farmer:', { user, transactionId });
    const response = await axios.post(`${API_BASE_URL}/farmers/confirmUnregisterFarmer`, { 
      user, 
      transactionId 
    });
    console.log('Confirm unregister farmer response:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'confirming unregister farmer transaction');
  }
};

export const getInventory = async (actor) => {
  try {
    console.log('Fetching inventory for actor:', actor);
    const response = await axios.get(`${API_BASE_URL}/nfts/${actor}`);
    console.log('Inventory data received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching inventory');
  }
};

export const getFarmsWithPlots = async (accountName) => {
  try {
    console.log('Fetching farms with plots for:', accountName);
    const response = await axios.get(`${API_BASE_URL}/farms/farms-with-plots/${accountName}`);
    console.log('Farms with plots data received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching farms with plots');
  }
};

export const verifyLogin = async (actor, permission, signature) => {
  try {
    console.log('Verifying login for actor:', actor);
    const response = await axios.post(`${API_BASE_URL}/verifyLogin`, {
      actor,
      permission,
      signature,
    });
    console.log('Verify login response:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'verifying login');
  }
};

export const getPlotStatus = async (plotId) => {
  try {
    console.log('Fetching plot status for plotId:', plotId);
    const response = await axios.get(`${API_BASE_URL}/plotStatus/${plotId}`);
    console.log('Plot status received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching plot status');
  }
};

export const getNFTStatus = async (nftId) => {
  try {
    console.log('Fetching NFT status for nftId:', nftId);
    const response = await axios.get(`${API_BASE_URL}/nftStatus/${nftId}`);
    console.log('NFT status received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching NFT status');
  }
};

export const getAccountInfo = async (accountName) => {
  try {
    console.log('Fetching account info for:', accountName);
    const response = await axios.get(`${API_BASE_URL}/account/${accountName}`);
    console.log('Account info received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching account info');
  }
};

export const getPlots = async (accountName) => {
  try {
    console.log('Fetching plots for:', accountName);
    const response = await axios.get(`${API_BASE_URL}/plots/${accountName}`);
    console.log('Plots data received:', response.data);
    return response.data;
  } catch (error) {
    handleApiError(error, 'fetching plots');
  }
};

export default {
  getFarmers,
  registerFarmer,
  unregisterFarmer,
  confirmUnregisterFarmer,
  getInventory,
  getFarmsWithPlots,
  verifyLogin,
  getPlotStatus,
  getNFTStatus,
  getAccountInfo,
  getPlots,
};
