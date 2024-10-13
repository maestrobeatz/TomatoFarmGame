import CryptoJS from 'crypto-js';

// Encrypt data using the environment variable encryption key
export const encryptData = (data) => {
   const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
   if (!encryptionKey) {
      throw new Error('Encryption key not set in environment variables');
   }

   // Encrypt the data
   const encryptedData = CryptoJS.AES.encrypt(data, encryptionKey).toString();

   // Log only in development to avoid leaking sensitive data in production
   if (process.env.NODE_ENV === 'development') {
      console.log('Data before encryption:', data);  // Log original data for debugging
      console.log('Encrypted data:', encryptedData);  // Log encrypted data
   }
   
   return encryptedData;
};

// Decrypt data using the environment variable encryption key
export const decryptData = (encryptedData) => {
   const encryptionKey = process.env.REACT_APP_ENCRYPTION_KEY;
   if (!encryptionKey) {
      throw new Error('Encryption key not set in environment variables');
   }

   // Decrypt the data
   const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
   const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

   // Log only in development to avoid sensitive data exposure
   if (process.env.NODE_ENV === 'development') {
      console.log('Data after decryption:', decryptedData);  // Log decrypted data for debugging
   }
   
   return decryptedData;
};

// Function to handle encryption of publicKey, privateKey, and password
export const encryptWalletData = (publicKey, privateKey, password) => {
   if (!publicKey || !privateKey || !password) {
      throw new Error('publicKey, privateKey, and password must all be provided.');
   }

   // Encrypt each field
   const publicKeyEncrypted = encryptData(publicKey);
   const privateKeyEncrypted = encryptData(privateKey);
   const passwordEncrypted = encryptData(password);

   return {
      publicKeyEncrypted,
      privateKeyEncrypted,
      passwordEncrypted,
   };
};

// Handle API errors in a generic manner
export const handleApiError = (error, context) => {
   console.error(`Error in ${context}:`, error);
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
