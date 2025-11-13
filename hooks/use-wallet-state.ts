import { useMemo } from 'react';

import { useWallet } from '@/contexts/wallet-context';

/**
 * Hook for wallet state queries
 * Provides computed values and utilities for wallet state
 */
export function useWalletState() {
  const { address, chainId, isConnected, isWrongNetwork, getShortAddress, isChainSupported } = useWallet();

  /**
   * Get display-friendly wallet address
   */
  const displayAddress = useMemo(() => {
    return getShortAddress();
  }, [getShortAddress]);

  /**
   * Check if wallet is connected and on correct network
   */
  const isReady = useMemo(() => {
    return isConnected && !isWrongNetwork;
  }, [isConnected, isWrongNetwork]);

  /**
   * Get user-friendly connection status message
   */
  const statusMessage = useMemo(() => {
    if (!isConnected) return 'Not connected';
    if (isWrongNetwork) return 'Wrong network';
    return 'Connected';
  }, [isConnected, isWrongNetwork]);

  /**
   * Get status color for UI
   */
  const statusColor = useMemo(() => {
    if (!isConnected) return 'gray';
    if (isWrongNetwork) return 'red';
    return 'green';
  }, [isConnected, isWrongNetwork]);

  /**
   * Check if user can perform transactions
   */
  const canTransact = useMemo(() => {
    return isReady && address !== undefined;
  }, [isReady, address]);

  return {
    // Raw state (from Reown)
    address,
    chainId,
    
    // Connection status
    isConnected,
    isConnecting: false, // Reown manages this internally
    isDisconnected: !isConnected,
    
    // Network status
    isWrongNetwork,
    isCorrectNetwork: !isWrongNetwork,
    
    // Computed values
    displayAddress,
    isReady,
    canTransact,
    statusMessage,
    statusColor,
    
    // Utilities
    isChainSupported,
  };
}

