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
      chainId: chainId,
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

export default sessionKit;
