// walletApi.js

import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_WALLET_API_BASE_URL || 'https://maestrobeatz.servegame.com:3004';

// Fetch account balance
export const getAccountBalance = async (accountName) => {
  const response = await axios.get(`${API_BASE_URL}/account/balance/${accountName}`);
  return response.data.balance;
};

// Fetch NFTs
export const getUserNFTs = async (accountName) => {
  const response = await axios.get(`${API_BASE_URL}/account/nfts/${accountName}`);
  return response.data.nfts;
};

// Import private key
export const importKey = async (accountName, privateKey) => {
  const response = await axios.post(`${API_BASE_URL}/wallet/import-key`, {
    accountName,
    privateKey,
  });
  return response.data;
};

// Mint new NFT
export const mintAsset = async (accountName, templateId) => {
  const response = await axios.post(`${API_BASE_URL}/wallet/mint`, {
    accountName,
    templateId,
  });
  return response.data;
};
