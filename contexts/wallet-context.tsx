import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { CHILIZ_CHAIN_ID } from '@/config/chains';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';
import { telemetry } from '@/lib/telemetry';
import type {
  ConnectOptions,
  NetworkState,
  WalletError,
  WalletSession,
  WalletState
} from '@/types/wallet';

/**
 * Wallet Context Value
 */
interface WalletContextValue {
  // State
  wallet: WalletState;
  error: WalletError | null;

  // Actions
  connect: (options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  switchToChiliz: () => Promise<void>;
  
  // Utilities
  isChainSupported: (chainId: number) => boolean;
  getShortAddress: () => string | null;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

/**
 * Initial wallet state
 */
function getInitialWalletState(): WalletState {
  return {
    address: null,
    chainId: null,
    providerType: null,
    connectedAt: null,
    sessionExpiryMs: null,
    connectionState: 'disconnected',
    networkState: 'correct',
    isConnected: false,
    isConnecting: false,
    isWrongNetwork: false,
  };
}

/**
 * Load wallet session from storage
 */
function loadWalletSession(): WalletSession | null {
  return StorageService.getObject<WalletSession>(STORAGE_KEYS.WALLET_SESSION) ?? null;
}

/**
 * Save wallet session to storage
 * Will be used when WalletConnect integration is complete
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function saveWalletSession(session: WalletSession): void {
  StorageService.setObject(STORAGE_KEYS.WALLET_SESSION, session);
}

/**
 * Clear wallet session from storage
 */
function clearWalletSession(): void {
  StorageService.removeMultiple([
    STORAGE_KEYS.WALLET_SESSION,
    STORAGE_KEYS.WALLET_PROVIDER_TYPE,
    STORAGE_KEYS.WALLET_CONNECTED_AT,
  ]);
}

/**
 * Determine network state based on chainId
 */
function getNetworkState(chainId: number | null): NetworkState {
  if (chainId === null) return 'correct';
  if (chainId === CHILIZ_CHAIN_ID) return 'correct';
  return 'wrong_network';
}

/**
 * Wallet Provider Component
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>(getInitialWalletState);
  const [error, setError] = useState<WalletError | null>(null);

  // Load session on mount
  useEffect(() => {
    const session = loadWalletSession();
    if (session && session.address) {
      const networkState = getNetworkState(session.chainId);
      setWallet({
        ...session,
        connectionState: 'connected',
        networkState,
        isConnected: true,
        isConnecting: false,
        isWrongNetwork: networkState === 'wrong_network',
      });
      
      // Track session restoration
      if (session.chainId) {
        telemetry.trackSessionRestored(session.chainId);
      }
      
      // Track network mismatch if present
      if (networkState === 'wrong_network' && session.chainId) {
        telemetry.trackNetworkMismatchShown(session.chainId);
      }
    }
  }, []);

  /**
   * Check if a chain is supported
   */
  const isChainSupported = useCallback((chainId: number): boolean => {
    return chainId === CHILIZ_CHAIN_ID;
  }, []);

  /**
   * Get shortened address for display
   */
  const getShortAddress = useCallback((): string | null => {
    if (!wallet.address) return null;
    const addr = wallet.address;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  }, [wallet.address]);

  /**
   * Connect wallet
   * This is a placeholder - will be implemented with WalletConnect
   */
  const connect = useCallback(async (options?: ConnectOptions): Promise<void> => {
    setWallet((prev) => ({
      ...prev,
      connectionState: 'connecting',
      isConnecting: true,
    }));
    setError(null);

    try {
      // TODO: Implement actual wallet connection logic
      // This will be implemented in the next steps with WalletConnect

      // Placeholder for demonstration
      throw new Error('Wallet connection not yet implemented');
    } catch (err) {
      const walletError: WalletError = {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Failed to connect wallet',
        details: err,
      };
      setError(walletError);
      setWallet((prev) => ({
        ...prev,
        connectionState: 'disconnected',
        isConnecting: false,
      }));
    }
  }, []);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // TODO: Disconnect from WalletConnect session

      // Track disconnection
      telemetry.trackWalletDisconnected();

      // Clear state and storage
      clearWalletSession();
      setWallet(getInitialWalletState());
      setError(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, []);

  /**
   * Switch to Chiliz network
   * This is a placeholder - will prompt user to switch in their wallet
   */
  const switchToChiliz = useCallback(async (): Promise<void> => {
    try {
      // TODO: Implement chain switching logic
      throw new Error('Chain switching not yet implemented');
    } catch (err) {
      const walletError: WalletError = {
        code: 'UNSUPPORTED_METHOD',
        message: 'Please manually switch to Chiliz network in your wallet',
        details: err,
      };
      setError(walletError);
    }
  }, []);

  const value: WalletContextValue = {
    wallet,
    error,
    connect,
    disconnect,
    switchToChiliz,
    isChainSupported,
    getShortAddress,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

/**
 * Hook to access wallet context
 */
export function useWallet(): WalletContextValue {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
