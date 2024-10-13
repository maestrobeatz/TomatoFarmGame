const DB_NAME = 'maestroWallet';
const DB_VERSION = 2;  // Increment version to ensure onupgradeneeded runs
const ACCOUNT_STORE_NAME = 'walletAccounts';

// Open the IndexedDB database
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);  // Ensure you use the updated DB_VERSION
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      // Create a store for accounts if not exists
      if (!db.objectStoreNames.contains(ACCOUNT_STORE_NAME)) {
        db.createObjectStore(ACCOUNT_STORE_NAME, { keyPath: 'publicKey' }); // Use publicKey as the key path
      }
    };
    
    request.onsuccess = (event) => {
      resolve(event.target.result);
    };
    
    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
}

// Save account information (publicKey, accountName, encryptedPrivateKey)
export async function saveAccount(publicKey, accountName, encryptedPrivateKey) {
  const db = await openDB();
  const transaction = db.transaction(ACCOUNT_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(ACCOUNT_STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.put({ publicKey, accountName, encryptedPrivateKey });
    
    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Get account information by public key
export async function getAccountByPublicKey(publicKey) {
  const db = await openDB();
  const transaction = db.transaction(ACCOUNT_STORE_NAME, 'readonly');
  const store = transaction.objectStore(ACCOUNT_STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(publicKey);
    
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// Get all accounts stored in IndexedDB
export async function getAllAccounts() {
  const db = await openDB();
  const transaction = db.transaction(ACCOUNT_STORE_NAME, 'readonly');
  const store = transaction.objectStore(ACCOUNT_STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    
    request.onsuccess = (event) => resolve(event.target.result);  // Correct result retrieval
    request.onerror = (event) => reject(event.target.error);
  });
}

// Delete account by public key
export async function deleteAccount(publicKey) {
  const db = await openDB();
  const transaction = db.transaction(ACCOUNT_STORE_NAME, 'readwrite');
  const store = transaction.objectStore(ACCOUNT_STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(publicKey);  // Delete the account by public key
    
    request.onsuccess = () => resolve(true);
    request.onerror = (event) => reject(event.target.error);
  });
}
