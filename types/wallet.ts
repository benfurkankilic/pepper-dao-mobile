/**
 * Wallet provider types supported by the app
 */
export type WalletProviderType = 'reown' | 'walletconnect';

/**
 * Wallet connection state
 */
export type WalletConnectionState = 
  | 'disconnected' 
  | 'connecting' 
  | 'connected' 
  | 'reconnecting';

/**
 * Network mismatch state
 */
export type NetworkState = 
  | 'correct' 
  | 'wrong_network' 
  | 'unsupported_network';

/**
 * Wallet session data
 * Matches the data model from the feature specification
 */
export interface WalletSession {
  address: `0x${string}` | null;
  chainId: number | null;
  providerType: WalletProviderType | null;
  connectedAt: number | null; // epoch ms
  sessionExpiryMs?: number | null;
}

/**
 * Wallet state including connection and network status
 */
export interface WalletState extends WalletSession {
  connectionState: WalletConnectionState;
  networkState: NetworkState;
  isConnected: boolean;
  isConnecting: boolean;
  isWrongNetwork: boolean;
}

/**
 * Wallet connection error types
 */
export interface WalletError {
  code: 
    | 'USER_REJECTED' 
    | 'TIMEOUT' 
    | 'UNSUPPORTED_METHOD' 
    | 'SESSION_LOST' 
    | 'NETWORK_ERROR'
    | 'UNKNOWN';
  message: string;
  details?: unknown;
}

/**
 * Wallet connection options
 */
export interface ConnectOptions {
  preferredProvider?: WalletProviderType;
  chainId?: number;
}

