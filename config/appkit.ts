/**
 * Reown AppKit Configuration
 * 
 * IMPORTANT: This file must be imported before any AppKit components are used.
 * The import order is critical - @walletconnect/react-native-compat must be first.
 */

// Required polyfills - MUST be first import
import '@walletconnect/react-native-compat';

import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import { createAppKit, type AppKitNetwork } from '@reown/appkit-react-native';

import { appKitStorage } from './appkit-storage';
import { CHILIZ_CHAIN_ID } from './chains';

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
 * Define Chiliz network for AppKit
 * AppKit expects networks in AppKitNetwork format with specific structure
 */
const chilizNetwork: AppKitNetwork = {
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
      name: 'Chiliz Explorer',
      url: 'https://explorer.chiliz.com',
    },
  },
  chainNamespace: 'eip155',
  caipNetworkId: `eip155:${CHILIZ_CHAIN_ID}`,
  testnet: false,
};

/**
 * Initialize Ethers adapter for EVM chains
 */
const ethersAdapter = new EthersAdapter();

// Debug logging
console.log('AppKit Configuration:');
console.log('- projectId:', projectId);
console.log('- chainId:', CHILIZ_CHAIN_ID);
console.log('- caipNetworkId:', `eip155:${CHILIZ_CHAIN_ID}`);
console.log('- network:', chilizNetwork.name);

/**
 * Create and configure AppKit instance
 * This must be called at module level, outside React components
 */
export const appKit = createAppKit({
  projectId: projectId || 'demo-project-id',
  metadata,
  networks: [chilizNetwork],
  defaultNetwork: chilizNetwork,
  adapters: [ethersAdapter],
  storage: appKitStorage,
  enableAnalytics: false, // Disable analytics to reduce initialization complexity
  features: {
    swaps: false,
    onramp: false,
  },
});

/**
 * Export AppKit component for mounting in root
 */
export { AppKit } from '@reown/appkit-react-native';

