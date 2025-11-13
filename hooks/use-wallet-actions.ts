import { useCallback } from 'react';

import { useWallet } from '@/contexts/wallet-context';

/**
 * Hook for wallet connection actions
 * Provides convenient methods for common wallet operations
 */
export function useWalletActions() {
  const { connect, disconnect, switchToChiliz, isWrongNetwork, error } = useWallet();

  /**
   * Connect wallet with error handling
   */
  const connectWallet = useCallback(async () => {
    try {
      await connect();
    } catch (err) {
      console.error('Failed to connect wallet:', err);
      throw err;
    }
  }, [connect]);

  /**
   * Disconnect wallet with error handling
   */
  const disconnectWallet = useCallback(async () => {
    try {
      await disconnect();
    } catch (err) {
      console.error('Failed to disconnect wallet:', err);
      throw err;
    }
  }, [disconnect]);

  /**
   * Handle network mismatch by prompting user to switch
   */
  const handleNetworkMismatch = useCallback(async () => {
    if (!isWrongNetwork) return;
    
    try {
      await switchToChiliz();
    } catch (err) {
      console.error('Failed to switch network:', err);
      throw err;
    }
  }, [isWrongNetwork, switchToChiliz]);

  return {
    connectWallet,
    disconnectWallet,
    handleNetworkMismatch,
    isLoading: false, // Reown manages loading state internally
    error,
  };
}

