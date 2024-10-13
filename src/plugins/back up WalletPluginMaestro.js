// Import the required dependencies
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import AccountSelectionModal from '../components/Wallet/AccountSelectionModal';
import maestroLogo from '../assets/images/beatz_maestrobeatz.png';
import walletFacade from '../components/Wallet/walletApi/walletApi';
import { AbstractWalletPlugin } from '@wharfkit/session';
import { JsonRpc } from 'eosjs';

const chainId = process.env.REACT_APP_CHAINID;
const rpcEndpoint = process.env.REACT_APP_RPC;

class WalletPluginMaestro extends AbstractWalletPlugin {
  constructor() {
    super();
    this.id = 'maestro-wallet';
    this.metadata = {
      name: 'Maestro Wallet',
      description: 'Custom Maestro Wallet Provider',
      logo: maestroLogo,
    };
    this.rpc = new JsonRpc(rpcEndpoint);
    this.root = null;

    // Add a UI object with require method for user interaction prompts
    this.ui = {
      require: (args) => this.showConfirmationModal(args),
    };
  }

  // Login function to handle account selection and password decryption
  async login() {
    try {
      console.log("Opening account selection modal...");
      const userAccount = await this.showModal(AccountSelectionModal);
      console.log('Account selected:', userAccount);

      const accountName = await walletFacade.fetchAccountName(userAccount.publicKey);
      if (!accountName) {
        throw new Error('Account name not found on blockchain for the selected public key');
      }
      console.log('Account name fetched from blockchain:', accountName);

      // Authenticate user (decrypt password) and create session directly after account selection
      return {
        actor: accountName,
        permission: 'active',
        publicKey: userAccount.publicKey,
        walletPlugin: {
          id: this.id,
          data: {
            requestKey: userAccount.publicKey, // Add any additional data if needed
          },
        },
        chain: {
          id: chainId,
          url: rpcEndpoint,
        },
        appName: "Tomato Farm Game",
        expireSeconds: 120,
        broadcast: true,
      };
    } catch (error) {
      console.error('Maestro Wallet login error:', error);
      throw new Error(`Login failed: ${error.message}`);
    }
  }

  // Function to display modals (used for both password and account selection modals)
  showModal(ModalComponent, props = {}) {
    return new Promise((resolve, reject) => {
      const modalContainer = document.createElement('div');
      document.body.appendChild(modalContainer);
      console.log('Modal container created and appended to DOM');

      const root = createRoot(modalContainer);
      this.root = root;

      const ModalWrapper = () => {
        const [show, setShow] = useState(true);

        const handleClose = () => {
          setShow(false);
          root.unmount();
          if (modalContainer.parentNode) {
            document.body.removeChild(modalContainer);
          }
        };

        return (
          <ModalComponent
            show={show}
            onClose={handleClose}
            {...props}
            onSelect={(data) => {
              handleClose();
              resolve(data);
            }}
            onError={(error) => {
              console.error("Error in modal:", error);
              handleClose();
              reject(error);
            }}
          />
        );
      };

      root.render(<ModalWrapper />);
    });
  }
}

export default WalletPluginMaestro;
