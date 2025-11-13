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
  const { address, isConnected, isWrongNetwork } = useWallet();

  /**
   * Execute a protected action (transaction, signature, etc.)
   * Throws ProtectedActionError if wallet is not ready
   */
  const executeProtected = useCallback(
    async <T>(action: () => Promise<T>): Promise<T> => {
      // Check if connected
      if (!isConnected || !address) {
        throw new ProtectedActionError(
          'Please connect your wallet to continue.',
          'NOT_CONNECTED',
        );
      }

      // Chain guard: Check if on correct network
      if (isWrongNetwork) {
        throw new ProtectedActionError(
          'Please switch to Chiliz network to continue.',
          'WRONG_NETWORK',
        );
      }

      // Execute the protected action
      return await action();
    },
    [isConnected, address, isWrongNetwork],
  );

  /**
   * Check if action can be executed
   * Returns error message if not ready, null if ready
   */
  const canExecute = useCallback((): string | null => {
    if (!isConnected || !address) {
      return 'Please connect your wallet to continue.';
    }

    if (isWrongNetwork) {
      return 'Please switch to Chiliz network to continue.';
    }

    return null;
  }, [isConnected, address, isWrongNetwork]);

  return {
    executeProtected,
    canExecute,
    isReady: isConnected && !isWrongNetwork,
  };
}

