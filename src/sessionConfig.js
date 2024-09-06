import { SessionKit } from "@wharfkit/session";
import { WebRenderer } from "@wharfkit/web-renderer";
import { WalletPluginAnchor } from "@wharfkit/wallet-plugin-anchor";
import { WalletPluginCloudWallet } from "@wharfkit/wallet-plugin-cloudwallet";

const chainId = process.env.REACT_APP_CHAINID;
const rpcEndpoint = process.env.REACT_APP_RPC;

if (!chainId || !rpcEndpoint) {
  console.error('Chain ID or RPC endpoint not set in environment variables');
}

const sessionKit = new SessionKit({
  appName: "Tomato Farm Game",
  chains: [
    {
      id: chainId,
      url: rpcEndpoint,
      nativeToken: {
        symbol: "WAX",
        precision: 8,
        logo: "https://wax.bloks.io/img/wallet/logos/logo-128.png"
      }
    },
  ],
  ui: new WebRenderer(),
  walletPlugins: [
    new WalletPluginAnchor(),
    new WalletPluginCloudWallet(),
  ],
});

export const loginMethods = {
  anchor: WalletPluginAnchor,
  wax: WalletPluginCloudWallet,
};

export const saveSession = (session) => {
  try {
    if (!session) {
      console.error("Cannot save null or undefined session");
      return;
    }
    const sessionData = JSON.stringify({
      actor: session.actor?.toString() || null,
      permission: session.permission || null,
      chainId: session.chain.id,
      walletPlugin: session.walletPlugin?.id() || null,
    });
    localStorage.setItem('userSession', sessionData);
  } catch (error) {
    console.error("Failed to save session:", error);
  }
};

export const restoreSession = async () => {
  try {
    const session = await sessionKit.restore();
    return session || null;
  } catch (error) {
    console.error("Failed to restore session:", error);
    return null;
  }
};

export const performTransaction = async (session, actionData) => {
  try {
    const result = await session.transact({ actions: [actionData] });
    return result;
  } catch (error) {
    console.error("Transaction failed:", error);
    throw error;
  }
};

export default sessionKit;
