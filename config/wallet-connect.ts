/**
 * WalletConnect v2 Configuration
 * 
 * To get your Project ID:
 * 1. Go to https://cloud.walletconnect.com
 * 2. Sign up or log in
 * 3. Create a new project
 * 4. Copy the Project ID
 * 5. Add it to your environment variables or replace the placeholder below
 */

/**
 * WalletConnect Project ID
 * 
 * IMPORTANT: Replace this with your actual Project ID from WalletConnect Cloud
 * For production, use environment variables instead of hardcoding
 */
export const WALLETCONNECT_PROJECT_ID = 
  process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 
  'YOUR_PROJECT_ID_HERE';

/**
 * WalletConnect metadata for the app
 * This information is displayed to users when connecting their wallet
 */
export const WALLETCONNECT_METADATA = {
  name: 'Pepper DAO',
  description: 'Engage with Pepper DAO governance, staking, and treasury',
  url: 'https://pepperprotocol.io',
  icons: ['https://pepperprotocol.io/icon.png'],
  redirect: {
    native: 'pepperdao://',
    universal: 'https://pepperprotocol.io',
  },
};

/**
 * WalletConnect session configuration
 */
export const WALLETCONNECT_SESSION_CONFIG = {
  // Session expiry: 7 days in seconds
  sessionExpiry: 7 * 24 * 60 * 60,
  // Required namespaces for EIP155 (Ethereum-compatible chains)
  requiredNamespaces: {
    eip155: {
      methods: [
        'eth_sendTransaction',
        'eth_signTransaction',
        'eth_sign',
        'personal_sign',
        'eth_signTypedData',
        'eth_signTypedData_v4',
      ],
      chains: ['eip155:88888'], // Chiliz Chain
      events: ['chainChanged', 'accountsChanged'],
    },
  },
};

/**
 * Validate WalletConnect configuration
 */
export function isWalletConnectConfigured(): boolean {
  return WALLETCONNECT_PROJECT_ID !== 'YOUR_PROJECT_ID_HERE' && 
         WALLETCONNECT_PROJECT_ID.length > 0;
}

/**
 * Get WalletConnect error message if not configured
 */
export function getWalletConnectConfigError(): string | null {
  if (!isWalletConnectConfigured()) {
    return 'WalletConnect is not configured. Please add your Project ID from cloud.walletconnect.com';
  }
  return null;
}

