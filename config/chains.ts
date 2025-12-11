import { defineChain } from 'viem';

/**
 * Chiliz Chain (chainId: 88888)
 * The official blockchain for Pepper DAO (Production)
 */
export const chiliz = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  nativeCurrency: {
    name: 'Chiliz',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/chiliz'],
      webSocket: ['wss://rpc.ankr.com/chiliz/ws'],
    },
    public: {
      http: ['https://rpc.ankr.com/chiliz'],
      webSocket: ['wss://rpc.ankr.com/chiliz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliscan',
      url: 'https://chiliscan.com',
    },
  },
  testnet: false,
});

/**
 * Chiliz Spicy Testnet (chainId: 88882)
 * Used for development and testing
 */
export const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  nativeCurrency: {
    name: 'Chiliz',
    symbol: 'CHZ',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com/'],
      webSocket: ['wss://spicy-rpc-ws.chiliz.com/'],
    },
    public: {
      http: ['https://chiliz-spicy.publicnode.com'],
      webSocket: ['wss://chiliz-spicy.publicnode.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliscan Testnet',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
});

/**
 * Chain ID constants for easy reference
 */
export const CHILIZ_CHAIN_ID = 88888;
export const CHILIZ_SPICY_CHAIN_ID = 88882;

/**
 * Active chain ID based on environment
 * - Development (__DEV__ = true): Spicy Testnet (88882)
 * - Production (__DEV__ = false): Chiliz Mainnet (88888)
 */
export const ACTIVE_CHAIN_ID = __DEV__ ? CHILIZ_SPICY_CHAIN_ID : CHILIZ_CHAIN_ID;

/**
 * Active chain configuration based on environment
 */
export const ACTIVE_CHAIN = __DEV__ ? chilizSpicy : chiliz;

/**
 * Supported chains for Pepper DAO
 * In development, both chains are supported for testing
 * In production, only mainnet is supported
 */
export const SUPPORTED_CHAINS = __DEV__ ? [chilizSpicy, chiliz] as const : [chiliz] as const;

/**
 * Primary chain for the app (always mainnet)
 * Used by features that require mainnet contracts (e.g., Pepper dashboard)
 * For environment-aware chain, use ACTIVE_CHAIN instead
 */
export const PRIMARY_CHAIN = chiliz;

/**
 * Get the block explorer URL for a transaction
 */
export function getExplorerTxUrl(txHash: string): string {
  const baseUrl = ACTIVE_CHAIN.blockExplorers.default.url;
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get the block explorer URL for an address
 */
export function getExplorerAddressUrl(address: string): string {
  const baseUrl = ACTIVE_CHAIN.blockExplorers.default.url;
  return `${baseUrl}/address/${address}`;
}

/**
 * Get the RPC URL for the active chain
 */
export function getActiveRpcUrl(): string {
  return ACTIVE_CHAIN.rpcUrls.default.http[0];
}

