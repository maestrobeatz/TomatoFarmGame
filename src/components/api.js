import axios from 'axios';
import { handleApiError } from './utils';  // Assuming utils.js contains error handling

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://maestrobeatz.servegame.com:3003';

// Get list of farmers
export const getFarmers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/farmers`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getFarmers response');
    }
  } catch (error) {
    handleApiError(error, 'fetching farmers');
  }
};

// Register a farmer
export const registerFarmer = async (accountName, nickname, session) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/register`, { accountName, nickname, session });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from registerFarmer response');
    }
  } catch (error) {
    handleApiError(error, 'registering farmer');
  }
};

// Unregister a farmer
export const unregisterFarmer = async (user) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/unregister`, { user });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from unregisterFarmer response');
    }
  } catch (error) {
    handleApiError(error, 'unregistering farmer');
  }
};

// Confirm farmer unregistration
export const confirmUnregisterFarmer = async (user, transactionId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/confirm-unregister`, { user, transactionId });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from confirmUnregisterFarmer response');
    }
  } catch (error) {
    handleApiError(error, 'confirming farmer unregistration');
  }
};

// Get user NFTs
export const getUserNFTs = async (accountName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nfts/${accountName}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getUserNFTs response');
    }
  } catch (error) {
    handleApiError(error, 'fetching user NFTs');
  }
};

// Mint an asset
export const mintAsset = async (accountName, templateId) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/nfts/mint`, { accountName, templateId });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from mintAsset response');
    }
  } catch (error) {
    handleApiError(error, 'minting asset');
  }
};

// Get inventory by actor
export const getInventory = async (actor) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory/${actor}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getInventory response');
    }
  } catch (error) {
    handleApiError(error, 'fetching inventory');
  }
};

// Get farms with plots for a specific user
export const getFarmsWithPlots = async (accountName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/farms/farms-with-plots/${accountName}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getFarmsWithPlots response');
    }
  } catch (error) {
    handleApiError(error, 'fetching farms with plots');
  }
};

// Get all farms in the game
export const getAllFarms = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/farms/all-farms`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getAllFarms response');
    }
  } catch (error) {
    handleApiError(error, 'fetching all farms');
  }
};

// Get plot status
export const getPlotStatus = async (plotId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/plots/status/${plotId}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getPlotStatus response');
    }
  } catch (error) {
    handleApiError(error, 'fetching plot status');
  }
};

// Get NFT status
export const getNFTStatus = async (nftId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/nfts/status/${nftId}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getNFTStatus response');
    }
  } catch (error) {
    handleApiError(error, 'fetching NFT status');
  }
};

// Get plots for an account
export const getPlots = async (accountName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/plots/${accountName}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getPlots response');
    }
  } catch (error) {
    handleApiError(error, 'fetching plots');
  }
};

// Get account information and balance
export const getAccountInfo = async (accountName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/account-name/${accountName}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getAccountInfo response');
    }
  } catch (error) {
    handleApiError(error, 'fetching account information');
  }
};

// Get username for an account
export const getUsername = async (accountName) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/usernames/${accountName}`);
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from getUsername response');
    }
  } catch (error) {
    handleApiError(error, 'getting username');
  }
};

// Create a username for an account
export const createUsername = async (accountName, username) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/usernames/create`, {
      accountName,
      username,
    });

    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from createUsername response');
    }
  } catch (error) {
    handleApiError(error, 'creating username');
  }
};

// Create a new farm
export const createFarm = async (transactionData) => {
  try {
    console.log('Sending transaction data to backend:', JSON.stringify(transactionData, null, 2));
    if (!transactionData.signatures || !transactionData.packed_trx) {
      throw new Error('Invalid transaction data: Missing signatures or packed_trx');
    }
    const response = await axios.post(`${API_BASE_URL}/farms/create-farm`, transactionData);
    console.log('createFarm response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in createFarm:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    handleApiError(error, 'creating farm');
  }
};

// Exporting all the API functions
const api = {
  getFarmers,
  registerFarmer,
  unregisterFarmer,
  confirmUnregisterFarmer,
  getUserNFTs,
  mintAsset,
  getInventory,
  getFarmsWithPlots,
  getAllFarms, // Fetch all farms in the game
  getPlotStatus,
  getNFTStatus,
  getPlots,
  getAccountInfo,
  getUsername,
  createUsername,
  createFarm, // Add the createFarm function here
};

export default api;
