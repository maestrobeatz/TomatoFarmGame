import axios from 'axios';

const RPC_URL = process.env.REACT_APP_RPC || 'https://testnet.waxsweden.org';

// Fetch account info by account name from blockchain
export const fetchAccountInfoByAccountName = async (accountName) => {
  console.log(`Fetching account info for account: ${accountName}`); // Logging
  try {
    const response = await axios.post(`${RPC_URL}/v1/chain/get_account`, {
      account_name: accountName,
    });

    // Return the account data with relevant fields
    return {
      accountName: response.data.account_name,
      balance: response.data.core_liquid_balance || '0.0000 WAX',
      cpu_stake: response.data.total_resources?.cpu_weight || '0.0000 WAX',
      net_stake: response.data.total_resources?.net_weight || '0.0000 WAX',
      ram_quota: response.data.ram_quota || 0,
      ram_usage: response.data.ram_usage || 0,
    };
  } catch (error) {
    console.error(`Error fetching account info for ${accountName}:`, error);
    return null;
  }
};

// Fetch account names associated with a public key
export const fetchAccountNamesByPublicKey = async (publicKey) => {
  console.log(`Fetching account names for public key: ${publicKey}`); // Logging
  try {
    const response = await axios.post(`${RPC_URL}/v1/history/get_key_accounts`, {
      public_key: publicKey,
    });

    return response.data.account_names || []; // Return array of account names
  } catch (error) {
    console.error(`Error fetching account names for public key: ${publicKey}`, error);
    return [];
  }
};

export default {
  fetchAccountInfoByAccountName,
  fetchAccountNamesByPublicKey,
};
