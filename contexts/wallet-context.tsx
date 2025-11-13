import { useAccount, useAppKit } from '@reown/appkit-react-native';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { clearAppKitStorage } from '@/config/appkit-storage';
import { CHILIZ_CHAIN_ID } from '@/config/chains';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';
import { telemetry } from '@/lib/telemetry';
import type { ConnectOptions, WalletError } from '@/types/wallet';

/**
 * Wallet Context Value
 * Uses Reown's hooks as the source of truth for wallet state
 */
interface WalletContextValue {
  // Connection State (from Reown's useAccount)
  address: string | undefined;
  chainId: number | string | undefined;
  isConnected: boolean;
  
  // Computed State
  isWrongNetwork: boolean;
  error: WalletError | null;

  // Actions (from Reown's useAppKit)
  connect: (options?: ConnectOptions) => Promise<void>;
  disconnect: () => Promise<void>;
  switchToChiliz: () => Promise<void>;
  
  // Utilities
  isChainSupported: (chainId: number) => boolean;
  getShortAddress: () => string | null;
}

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

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
 * Wallet Provider Component
 * Uses Reown's hooks as the single source of truth for wallet state
 */
export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<WalletError | null>(null);
  
  // Use Reown's hooks for wallet state (single source of truth)
  const { open, disconnect: appKitDisconnect } = useAppKit();
  const { address, chainId, isConnected } = useAccount();

  // Clean up stale sessions on mount
  useEffect(() => {
    async function validateSession() {
      try {
        const storedSession = StorageService.getObject(STORAGE_KEYS.WALLET_SESSION);
        if (storedSession && !isConnected) {
          console.log('Clearing stale wallet session from storage');
          clearWalletSession();
          await clearAppKitStorage();
        }
      } catch (err) {
        console.error('Failed to validate session:', err);
        clearWalletSession();
        await clearAppKitStorage();
      }
    }
    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Track connection state changes for telemetry
  useEffect(() => {
    if (isConnected && address && chainId !== undefined) {
      const numericChainId = typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;
      
      // Track connection
      telemetry.trackWalletConnected('reown', numericChainId, address);
      
      // Track network mismatch if present
      if (numericChainId !== CHILIZ_CHAIN_ID) {
        telemetry.trackNetworkMismatchShown(numericChainId);
      }
    } else if (!isConnected) {
      // Clear session on disconnect
      clearWalletSession();
    }
  }, [address, chainId, isConnected]);
  
  // Compute if user is on wrong network
  const isWrongNetwork = isConnected && chainId !== undefined 
    ? (typeof chainId === 'string' ? parseInt(chainId, 10) : chainId) !== CHILIZ_CHAIN_ID
    : false;

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
    if (!address) return null;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, [address]);

  /**
   * Connect wallet using Reown AppKit
   */
  const connect = useCallback(async (options?: ConnectOptions): Promise<void> => {
    setError(null);
    
    try {
      // Open AppKit modal for connection
      // Note: Storage clearing is handled in useEffect on mount for stale sessions
      // and on disconnect. Do NOT clear storage here as it creates race conditions
      // with the AppKit initialization.
      open();
    } catch (err) {
      console.error('Connection error:', err);
      
      const walletError: WalletError = {
        code: 'UNKNOWN',
        message: err instanceof Error ? err.message : 'Failed to open wallet connection',
        details: err,
      };
      setError(walletError);
      
      // Clear potentially corrupted state only on error
      await clearAppKitStorage();
      clearWalletSession();
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
      await clearAppKitStorage();
      setError(null);
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      
      // Even if disconnect fails, clear local state
      clearWalletSession();
      await clearAppKitStorage();
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
    // Reown state (single source of truth)
    address,
    chainId,
    isConnected,
    
    // Computed state
    isWrongNetwork,
    error,
    
    // Actions
    connect,
    disconnect,
    switchToChiliz,
    
    // Utilities
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
