import { PrivateKey } from 'eosjs/dist/eosjs-key-conversions';

// Generate a new WAX-compatible key pair
export async function generateWAXKeys() {
  const privateKey = PrivateKey.generate();
  const publicKey = privateKey.getPublicKey();
  
  return {
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  };
}
