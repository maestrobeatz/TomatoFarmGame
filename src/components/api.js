import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';

export const getFarmers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getFarmers`);
    return response.data;
  } catch (error) {
    console.error('Error fetching farmers:', error);
    throw error;
  }
};

export const registerFarmer = async (accountName, nickname) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/registerFarmer`, {
      accountName,
      nickname,
    });
    return response.data;
  } catch (error) {
    console.error('Error registering farmer:', error);
    throw error;
  }
};

export const unregisterFarmer = async (accountName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/unregisterFarmer`, {
      accountName,
    });
    return response.data;
  } catch (error) {
    console.error('Error unregistering farmer:', error);
    throw error;
  }
};

export const getInventory = async (actor) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/inventory/${actor}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const verifyLogin = async (actor, permission, signature) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/verifyLogin`, {
      actor,
      permission,
      signature,
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying login:', error);
    throw error;
  }
};

export default {
  getFarmers,
  registerFarmer,
  unregisterFarmer,
  getInventory,
  verifyLogin,
};
