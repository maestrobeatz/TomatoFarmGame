import CryptoJS from 'crypto-js';
import { saveAccount, getAccountByPublicKey, getAllAccounts, deleteAccount } from '../indexedDB'; // Updated import for all necessary methods
import { JsonRpc, Api } from 'eosjs'; // EOSIO JSON RPC for blockchain interaction
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig'; // For signing transactions

const rpc = new JsonRpc(process.env.REACT_APP_RPC || 'https://testnet.waxsweden.org'); // Ensure correct WAX testnet URL

/**
 * Wallet API Facade: Handles encryption, storage, retrieval, and blockchain interactions for wallet operations.
 */
const walletFacade = {
  /**
   * Encrypt and store private key locally in IndexedDB.
   * @param {string} privateKey - The private key to encrypt and store.
   * @param {string} password - The password used for encryption.
   * @param {string} publicKey - The associated public key.
   * @param {string} accountName - The associated account name.
   * @returns {Promise<void>}
   */
  encryptAndStorePrivateKey: async (privateKey, password, publicKey, accountName) => {
    try {
      const encryptedPrivateKey = CryptoJS.AES.encrypt(privateKey, password).toString();
      await saveAccount(publicKey, accountName, encryptedPrivateKey); // Save the encrypted private key in IndexedDB
      console.log('Private key encrypted and stored successfully');
    } catch (error) {
      console.error('Error encrypting and storing private key:', error);
      throw new Error('Failed to encrypt and store private key');
    }
  },

  /**
   * Fetch account names associated with a public key from the WAX blockchain.
   * @param {string} publicKey - The public key to look up.
   * @returns {Promise<string|null>} - Returns the account name or null if not found.
   */
  fetchAccountName: async (publicKey) => {
    try {
      const response = await rpc.history_get_key_accounts(publicKey);
      if (response && response.account_names && response.account_names.length > 0) {
        return response.account_names[0]; // Return the first associated account
      }
      return null; // No account found
    } catch (error) {
      console.error('Error fetching account name from public key:', error);
      throw new Error('Failed to fetch account name');
    }
  },

  /**
   * Get account info by public key from IndexedDB.
   * @param {string} publicKey - The public key.
   * @returns {Promise<Object|null>} - The account info if it exists, otherwise null.
   */
  getAccountByPublicKey: async (publicKey) => {
    try {
      const account = await getAccountByPublicKey(publicKey); // Fetch from IndexedDB
      return account || null; // Return the account if found, otherwise null
    } catch (error) {
      console.error('Error fetching account by public key:', error);
      return null;
    }
  },

  /**
   * Retrieve all accounts stored in IndexedDB.
   * @returns {Promise<Array>} - Array of all stored accounts.
   */
  getAllAccounts: async () => {
    try {
      const accounts = await getAllAccounts(); // Fetch all accounts from IndexedDB
      return accounts || []; // Return the accounts or an empty array
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      throw new Error('Failed to fetch all accounts');
    }
  },

  /**
   * Delete an account from IndexedDB by public key.
   * @param {string} publicKey - The public key of the account to delete.
   * @returns {Promise<void>}
   */
  deleteAccount: async (publicKey) => {
    try {
      await deleteAccount(publicKey); // Remove the account from IndexedDB
      console.log(`Account with public key ${publicKey} deleted successfully`);
    } catch (error) {
      console.error('Error deleting account:', error);
      throw new Error('Failed to delete account');
    }
  },

  /**
   * Decrypt a stored private key using the provided password.
   * @param {string} publicKey - The public key to look up the encrypted private key.
   * @param {string} password - The password used for decryption.
   * @returns {Promise<string>} - The decrypted private key.
   */
  decryptPrivateKey: async (publicKey, password) => {
    try {
      console.log('Fetching account for publicKey:', publicKey);  // Log publicKey
      const account = await getAccountByPublicKey(publicKey); // Fetch account from IndexedDB
      console.log('Account retrieved from IndexedDB:', account);  // Log the retrieved account

      if (!account || !account.encryptedPrivateKey) {
        throw new Error('No encrypted private key found');
      }

      const bytes = CryptoJS.AES.decrypt(account.encryptedPrivateKey, password);
      const decryptedPrivateKey = bytes.toString(CryptoJS.enc.Utf8);

      if (!decryptedPrivateKey) {
        throw new Error('Failed to decrypt private key');
      }

      console.log('Decrypted private key:', decryptedPrivateKey);  // Log decrypted key
      return decryptedPrivateKey; // Return the decrypted private key
    } catch (error) {
      console.error('Error decrypting private key:', error);
      throw new Error('Failed to decrypt private key');
    }
  },

  /**
   * Fetch account balance, CPU, NET, and RAM information from the blockchain.
   * @param {string} accountName - The account name to fetch.
   * @returns {Promise<Object>} - Object containing balance, CPU, NET, and RAM data.
   */
  fetchAccountResources: async (accountName) => {
    try {
      const accountInfo = await rpc.get_account(accountName);
      const { core_liquid_balance, cpu_limit, net_limit, ram_quota, ram_usage } = accountInfo;

      const balance = core_liquid_balance || '0.00000000 WAX'; // Default balance, 8 decimal places
      const cpu = {
        used: cpu_limit.used,
        available: cpu_limit.available,
        max: cpu_limit.max,
      };
      const net = {
        used: net_limit.used,
        available: net_limit.available,
        max: net_limit.max,
      };
      const ram = {
        quota: ram_quota,
        usage: ram_usage,
      };

      return {
        balance,
        cpu,
        net,
        ram,
      };
    } catch (error) {
      console.error('Error fetching account resources:', error);
      throw new Error('Failed to fetch account resources');
    }
  },

  /**
   * Sign a blockchain transaction using a decrypted private key.
   * @param {string} accountName - The account performing the transaction.
   * @param {Object} transactionData - The data to be signed.
   * @param {string} privateKey - The decrypted private key for signing.
   * @returns {Promise<Object>} - The signed transaction.
   */
  signTransaction: async (accountName, transactionData, privateKey) => {
    try {
      const signatureProvider = new JsSignatureProvider([privateKey]);
      const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });

      // Execute the transaction on the blockchain
      const signedTransaction = await api.transact(transactionData, {
        blocksBehind: 3,
        expireSeconds: 30,
      });

      console.log(`Transaction signed for account ${accountName}`);
      return signedTransaction; // Return the signed transaction
    } catch (error) {
      console.error('Error signing transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  },

  /**
   * Transfer tokens between accounts on the WAX blockchain.
   * @param {string} fromAccount - The sender account.
   * @param {string} toAccount - The recipient account.
   * @param {number} amount - The amount of tokens to transfer.
   * @param {string} memo - The memo for the transaction.
   * @param {string} privateKey - The decrypted private key associated with the account.
   * @returns {Promise<Object>} - The transaction result, including transaction_id.
   */
  transferTokens: async (fromAccount, toAccount, amount, memo, privateKey) => {
    try {
      // Ensure the amount has exactly 8 decimal places
      const formattedAmount = `${Number(amount).toFixed(8)} WAX`;

      const transactionData = {
        actions: [{
          account: 'eosio.token',
          name: 'transfer',
          authorization: [{ actor: fromAccount, permission: 'active' }],
          data: { 
            from: fromAccount, 
            to: toAccount, 
            quantity: formattedAmount,  // Use the formatted amount with 8 decimal places
            memo: memo || '' 
          },
        }]
      };

      // Sign the transaction
      const signedTransaction = await walletFacade.signTransaction(fromAccount, transactionData, privateKey);

      // Check if transaction was successfully submitted
      if (signedTransaction && signedTransaction.transaction_id) {
        console.log(`Tokens transferred from ${fromAccount} to ${toAccount}: ${formattedAmount}`);
        return { transaction_id: signedTransaction.transaction_id }; // Return the transaction ID
      } else {
        throw new Error('Transaction failed, no transaction ID returned');
      }

    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error('Failed to transfer tokens');
    }
  },
};

export default walletFacade;
