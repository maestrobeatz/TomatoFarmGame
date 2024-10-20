import axios from 'axios';
import { handleApiError } from './utils';  // Assuming utils.js contains error handling

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://maestrobeatz.servegame.com:3003';

// Fetch all farmers and their usernames
export const getFarmers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/farmers`);
    if (response && response.data) {
      const farmers = response.data.farmers || [];
      return { farmers };  // Return farmers directly from backend response
    } else {
      throw new Error('No data received from getFarmers response');
    }
  } catch (error) {
    handleApiError(error, 'fetching farmers');
  }
};

// Register a farmer (handled on the frontend via session kit, not on backend)
export const registerFarmer = async (accountName, username) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/farmers/register`, { accountName, username });
    if (response && response.data) {
      return response.data;
    } else {
      throw new Error('No data received from registerFarmer response');
    }
  } catch (error) {
    handleApiError(error, 'registering farmer');
  }
};

// Unregister a farmer (handled on the frontend via session kit, not on backend)
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

// Fetch username for an account
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

// Fetch watering can data
export const getWateringCanData = async (nftId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/watering/wateringcan/${nftId}`);
    if (response && response.data) {
      return response.data;  // Return the usesLeft data from backend
    } else {
      throw new Error('No data received from getWateringCanData response');
    }
  } catch (error) {
    handleApiError(error, 'fetching watering can data');
  }
};

// Exporting all the API functions
const api = {
  getFarmers,
  getUsername,
  registerFarmer,
  unregisterFarmer,
  getUserNFTs,
  getInventory,
  getFarmsWithPlots,
  getAllFarms,
  getPlotStatus,
  getNFTStatus,
  getPlots,
  getAccountInfo,
  getWateringCanData,  // Newly added for fetching watering can data
};

export default api;
