import { defineChain } from 'viem';

/**
 * Chiliz Chain (chainId: 88888)
 * The official blockchain for Pepper DAO
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
      name: 'Chiliz Explorer',
      url: 'https://explorer.chiliz.com',
    },
  },
  testnet: false,
});

/**
 * Supported chains for Pepper DAO
 * Currently only Chiliz is supported
 */
export const SUPPORTED_CHAINS = [chiliz] as const;

/**
 * Primary chain for the app
 */
export const PRIMARY_CHAIN = chiliz;

/**
 * Chain ID constant for easy reference
 */
export const CHILIZ_CHAIN_ID = 88888;

