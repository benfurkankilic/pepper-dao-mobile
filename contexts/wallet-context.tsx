import { useAccount, useAppKit } from '@reown/appkit-react-native';
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
 * Save wallet session to storage
 */
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
  
  // Get AppKit state
  const { open, disconnect: appKitDisconnect } = useAppKit();
  const { address, chainId, isConnected } = useAccount();

  // Sync AppKit state to wallet context
  useEffect(() => {
    if (isConnected && address && chainId !== undefined) {
      // Convert chainId to number if it's a string
      const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
      const networkState = getNetworkState(numericChainId);
      const walletAddress = address as `0x${string}`;
      
      const newWalletState: WalletState = {
        address: walletAddress,
        chainId: numericChainId,
        providerType: 'reown',
        connectedAt: Date.now(),
        sessionExpiryMs: null,
        connectionState: 'connected',
        networkState,
        isConnected: true,
        isConnecting: false,
        isWrongNetwork: networkState === 'wrong_network',
      };
      
      setWallet(newWalletState);
      
      // Save session metadata
      saveWalletSession({
        address: walletAddress,
        chainId: numericChainId,
        providerType: 'reown',
        connectedAt: Date.now(),
        sessionExpiryMs: null,
      });
      
      // Track connection
      telemetry.trackWalletConnected('reown', numericChainId, walletAddress);
      
      // Track network mismatch if present
      if (networkState === 'wrong_network') {
        telemetry.trackNetworkMismatchShown(numericChainId);
      }
    } else if (!isConnected) {
      // User disconnected
      setWallet(getInitialWalletState());
    }
  }, [address, chainId, isConnected]);

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
   * Connect wallet using Reown AppKit
   */
  const connect = useCallback(async (options?: ConnectOptions): Promise<void> => {
    setError(null);
    
    try {
      // Open AppKit modal for connection
      open();
    } catch (err) {
      const walletError: WalletError = {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Failed to open wallet connection',
        details: err,
      };
      setError(walletError);
    }
  }, [open]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async (): Promise<void> => {
    try {
      // Disconnect from AppKit
      await appKitDisconnect();

      // Track disconnection
      telemetry.trackWalletDisconnected();

      // Clear state and storage
      clearWalletSession();
      setWallet(getInitialWalletState());
      setError(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
    }
  }, [appKitDisconnect]);

  /**
   * Switch to Chiliz network
   * User must switch manually in their wallet app
   */
  const switchToChiliz = useCallback(async (): Promise<void> => {
    const walletError: WalletError = {
      code: 'UNSUPPORTED_METHOD',
      message: 'Please switch to Chiliz Chain (88888) in your wallet app',
      details: null,
    };
    setError(walletError);
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
