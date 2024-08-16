import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3003';

export const getFarmers = async () => {
    const response = await axios.get(`${API_BASE_URL}/getFarmers`);
    return response.data;
};

export const registerFarmer = async (accountName, nickname) => {
    const response = await axios.post(`${API_BASE_URL}/registerFarmer`, { accountName, nickname });
    return response.data;
};

export const getInventory = async (actor) => {
    const response = await axios.get(`${API_BASE_URL}/inventory/${actor}`);
    return response.data;
};

export const verifyLogin = async (actor, permission, signature) => {
    const response = await axios.post(`${API_BASE_URL}/verifyLogin`, { actor, permission, signature });
    return response.data;
};

export default {
    getFarmers,
    registerFarmer,
    getInventory,
    verifyLogin,
};
