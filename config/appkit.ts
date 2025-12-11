/**
 * Reown AppKit Configuration
 * 
 * IMPORTANT: This file must be imported before any AppKit components are used.
 * The import order is critical - @walletconnect/react-native-compat must be first.
 * 
 * Environment-aware configuration:
 * - Development (__DEV__ = true): Chiliz Spicy Testnet (88882)
 * - Production (__DEV__ = false): Chiliz Mainnet (88888)
 */

// Required polyfills - MUST be first import
import '@walletconnect/react-native-compat';

import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { createAppKit, type AppKitNetwork } from '@reown/appkit-react-native';

import { appKitStorage } from './appkit-storage';
import { ACTIVE_CHAIN_ID, CHILIZ_CHAIN_ID, CHILIZ_SPICY_CHAIN_ID } from './chains';

/**
 * Get Project ID from environment
 * Obtain your Project ID from https://cloud.reown.com
 */
const projectId = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID;

if (!projectId || projectId === 'YOUR_PROJECT_ID_HERE') {
  console.warn(
    '⚠️  Reown Project ID not configured. Please set EXPO_PUBLIC_REOWN_PROJECT_ID in your .env file.\n' +
    'Get your Project ID from: https://cloud.reown.com'
  );
}

/**
 * App metadata displayed to users during wallet connection
 */
const metadata = {
  name: 'Pepper DAO',
  description: 'Engage with Pepper DAO governance, staking, and treasury',
  url: 'https://peppercoin.com',
  icons: ['https://peppercoin.com/icon.png'],
  redirect: {
    native: 'pepperdao://',
    universal: 'https://peppercoin.com',
  },
};

/**
 * Featured wallets configuration
 *
 * By adding wallet IDs to `featuredWalletIds`, Reown will display these
 * wallets as primary / recommended options in the wallet selection modal.
 *
 * Source: Chiliz / Socios and Reown AppKit integration docs.
 */
const SOCIOS_WALLET_ID =
  '56843177b5e89d4bcb19a27dab7c49e0f33d8d3a6c8c4c7e5274f605e92befd6';
const METAMASK_WALLET_ID =
  '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369';
const OKX_WALLET_ID =
  '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0';

/**
 * Chiliz Mainnet network configuration for AppKit
 */
const chilizMainnet: AppKitNetwork = {
  id: CHILIZ_CHAIN_ID,
  name: 'Chiliz Chain',
  nativeCurrency: {
    name: 'Chiliz',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/chiliz'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliscan',
      url: 'https://chiliscan.com',
    },
  },
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${CHILIZ_CHAIN_ID}`,
  testnet: false,
};

/**
 * Chiliz Spicy Testnet network configuration for AppKit
 */
const chilizSpicyTestnet: AppKitNetwork = {
  id: CHILIZ_SPICY_CHAIN_ID,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'Chiliz',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliscan Testnet',
      url: 'https://testnet.chiliscan.com',
    },
  },
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${CHILIZ_SPICY_CHAIN_ID}`,
  testnet: true,
};

/**
 * Select active network based on environment
 */
const activeNetwork = __DEV__ ? chilizSpicyTestnet : chilizMainnet;

/**
 * Available networks
 * - In development: Both testnet and mainnet are available for testing
 * - In production: Only mainnet is available
 */
const availableNetworks: Array<AppKitNetwork> = __DEV__ 
  ? [chilizSpicyTestnet, chilizMainnet] 
  : [chilizMainnet];

/**
 * Initialize Ethers adapter for EVM chains
 */
const ethersAdapter = new EthersAdapter();

// Debug logging
console.log('AppKit Configuration:');
console.log('- Environment:', __DEV__ ? 'Development' : 'Production');
console.log('- projectId:', projectId);
console.log('- Active chainId:', ACTIVE_CHAIN_ID);
console.log('- Active network:', activeNetwork.name);
console.log('- caipNetworkId:', activeNetwork.caipNetworkId);
console.log('- Available networks:', availableNetworks.map(n => n.name).join(', '));

/**
 * Create and configure AppKit instance
 * This must be called at module level, outside React components
 */
export const appKit = createAppKit({
  projectId: projectId || 'demo-project-id',
  metadata,
  networks: availableNetworks,
  defaultNetwork: activeNetwork,
  adapters: [ethersAdapter],
  storage: appKitStorage,
  enableAnalytics: false, // Disable analytics to reduce initialization complexity
  // Make Socios.com, MetaMask, and OKX the featured wallets in the Reown modal
  featuredWalletIds: [SOCIOS_WALLET_ID, METAMASK_WALLET_ID, OKX_WALLET_ID],
  features: {
    swaps: false,
    onramp: false,
  },
});

/**
 * Export network configurations for external use
 */
export { activeNetwork, availableNetworks, chilizMainnet, chilizSpicyTestnet };

/**
 * Export AppKit component for mounting in root
 */
  export { AppKit } from '@reown/appkit-react-native';

