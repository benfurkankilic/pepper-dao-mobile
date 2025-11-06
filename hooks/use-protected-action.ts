import { useCallback } from 'react';

import { useWallet } from '@/contexts/wallet-context';

/**
 * Error thrown when trying to execute a protected action
 * without proper wallet connection or network
 */
export class ProtectedActionError extends Error {
  constructor(
    message: string,
    public readonly reason: 'NOT_CONNECTED' | 'WRONG_NETWORK' | 'CONNECTING',
  ) {
    super(message);
    this.name = 'ProtectedActionError';
  }
}

/**
 * Hook for actions that require wallet connection and correct network
 * Enforces chain guard before allowing transactions
 */
export function useProtectedAction() {
  const { wallet } = useWallet();

  /**
   * Execute a protected action (transaction, signature, etc.)
   * Throws ProtectedActionError if wallet is not ready
   */
  const executeProtected = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      // Check if connecting
      if (wallet.isConnecting) {
        throw new ProtectedActionError(
          'Wallet is connecting. Please wait.',
          'CONNECTING',
        );
      }

      // Check if connected
      if (!wallet.isConnected || !wallet.address) {
        throw new ProtectedActionError(
          'Please connect your wallet to continue.',
          'NOT_CONNECTED',
        );
      }

      // Chain guard: Check if on correct network
      if (wallet.isWrongNetwork) {
        throw new ProtectedActionError(
          'Please switch to Chiliz network to continue.',
          'WRONG_NETWORK',
        );
      }

      // Execute the protected action
      return await action();
    },
    [wallet],
  );

  /**
   * Check if action can be executed
   * Returns error message if not ready, null if ready
   */
  const canExecute = useCallback((): string | null => {
    if (wallet.isConnecting) {
      return 'Wallet is connecting. Please wait.';
    }

    if (!wallet.isConnected || !wallet.address) {
      return 'Please connect your wallet to continue.';
    }

    if (wallet.isWrongNetwork) {
      return 'Please switch to Chiliz network to continue.';
    }

    return null;
  }, [wallet]);

  return {
    executeProtected,
    canExecute,
    isReady: wallet.isConnected && !wallet.isWrongNetwork,
  };
}

