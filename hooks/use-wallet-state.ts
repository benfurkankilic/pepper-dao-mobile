import { useMemo } from 'react';

import { useWallet } from '@/contexts/wallet-context';

/**
 * Hook for wallet state queries
 * Provides computed values and utilities for wallet state
 */
export function useWalletState() {
  const { wallet, getShortAddress, isChainSupported } = useWallet();

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
    return wallet.isConnected && !wallet.isWrongNetwork;
  }, [wallet.isConnected, wallet.isWrongNetwork]);

  /**
   * Get user-friendly connection status message
   */
  const statusMessage = useMemo(() => {
    if (wallet.isConnecting) return 'Connecting...';
    if (!wallet.isConnected) return 'Not connected';
    if (wallet.isWrongNetwork) return 'Wrong network';
    return 'Connected';
  }, [wallet.isConnecting, wallet.isConnected, wallet.isWrongNetwork]);

  /**
   * Get status color for UI
   */
  const statusColor = useMemo(() => {
    if (wallet.isConnecting) return 'yellow';
    if (!wallet.isConnected) return 'gray';
    if (wallet.isWrongNetwork) return 'red';
    return 'green';
  }, [wallet.isConnecting, wallet.isConnected, wallet.isWrongNetwork]);

  /**
   * Check if user can perform transactions
   */
  const canTransact = useMemo(() => {
    return isReady && wallet.address !== null;
  }, [isReady, wallet.address]);

  return {
    // Raw state
    address: wallet.address,
    chainId: wallet.chainId,
    providerType: wallet.providerType,
    
    // Connection status
    isConnected: wallet.isConnected,
    isConnecting: wallet.isConnecting,
    isDisconnected: !wallet.isConnected && !wallet.isConnecting,
    
    // Network status
    isWrongNetwork: wallet.isWrongNetwork,
    isCorrectNetwork: wallet.networkState === 'correct',
    
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

