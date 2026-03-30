/**
 * Voting Hook
 *
 * React hook for governance voting operations.
 * Integrates with Reown AppKit for wallet provider access and
 * uses react-query for data fetching and caching.
 */

import { useProvider } from '@reown/appkit-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { ACTIVE_CHAIN_ID } from '@/config/chains';
import { useWallet } from '@/contexts/wallet-context';
import { telemetry } from '@/lib/telemetry';
import { canVote, getVotingPower, submitVote } from '@/services/voting-api';
import type { VoteOption } from '@/types/governance';

import { ProtectedActionError, useProtectedAction } from './use-protected-action';

/**
 * Transaction status type
 */
type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Voting operation result
 */
interface VotingOperationResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Voting hook return type
 */
interface UseVotingReturn {
  // Data
  votingPower: bigint;
  formattedVotingPower: string;
  isLoading: boolean;
  canUserVote: boolean;

  // Transaction state
  txStatus: TransactionStatus;
  txError: string | null;

  // Actions
  vote: (proposalId: string, option: VoteOption) => Promise<VotingOperationResult>;
  resetTxState: () => void;

  // Utilities
  isReady: boolean;
}

/**
 * Query key for voting power data
 */
function getVotingPowerQueryKey(address: string | undefined, proposalId: number) {
  return ['voting-power', address, proposalId, ACTIVE_CHAIN_ID] as const;
}

/**
 * Format voting power for display (divide by 1e18 for ERC20 tokens)
 */
function formatVotingPower(power: bigint): string {
  if (power === BigInt(0)) {
    return '0';
  }

  // Convert from wei to tokens (18 decimals)
  const asNumber = Number(power) / 1e18;

  // Format with appropriate precision
  if (asNumber >= 1_000_000) {
    return `${(asNumber / 1_000_000).toFixed(1)}M`;
  }
  if (asNumber >= 1_000) {
    return `${(asNumber / 1_000).toFixed(1)}K`;
  }
  if (asNumber >= 1) {
    return asNumber.toFixed(0);
  }

  return asNumber.toFixed(2);
}

/**
 * Hook for governance voting operations
 * @param proposalId - On-chain proposal ID (numeric string from pluginProposalId)
 */
export function useVoting(proposalId?: string): UseVotingReturn {
  const { address, isConnected } = useWallet();
  const { provider: walletProvider } = useProvider();
  const { executeProtected, isReady } = useProtectedAction();
  const queryClient = useQueryClient();

  // Transaction state
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txError, setTxError] = useState<string | null>(null);

  // Parse proposal ID
  const numericProposalId = proposalId ? parseInt(proposalId, 10) : 0;

  // Fetch voting power
  const {
    data: votingPower = BigInt(0),
    isLoading,
  } = useQuery({
    queryKey: getVotingPowerQueryKey(address, numericProposalId),
    queryFn: () => getVotingPower(address!, numericProposalId),
    enabled: !!address && isConnected && numericProposalId > 0,
    staleTime: 30_000, // 30 seconds
  });

  // Check if user can vote
  const { data: canUserVote = false } = useQuery({
    queryKey: ['can-vote', address, numericProposalId, ACTIVE_CHAIN_ID],
    queryFn: () => canVote(address!, numericProposalId, 'YES'),
    enabled: !!address && isConnected && numericProposalId > 0,
    staleTime: 30_000,
  });

  // Format voting power for display
  const formattedVotingPower = formatVotingPower(votingPower);

  // Reset transaction state
  const resetTxState = useCallback(() => {
    setTxStatus('idle');
    setTxError(null);
  }, []);

  // Invalidate and refetch governance data
  const invalidateGovernanceData = useCallback(
    (propId: string) => {
      // Invalidate the specific proposal query
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposal', propId] });
      // Invalidate the proposals list
      queryClient.invalidateQueries({ queryKey: ['governance', 'proposals'] });
      // Invalidate voting power query
      queryClient.invalidateQueries({
        queryKey: getVotingPowerQueryKey(address, parseInt(propId, 10)),
      });
      // Invalidate can-vote query
      queryClient.invalidateQueries({
        queryKey: ['can-vote', address, parseInt(propId, 10), ACTIVE_CHAIN_ID],
      });
    },
    [queryClient, address]
  );

  // Submit vote
  const vote = useCallback(
    async (propId: string, option: VoteOption): Promise<VotingOperationResult> => {
      setTxStatus('pending');
      setTxError(null);

      try {
        const result = await executeProtected(async () => {
          if (!walletProvider) {
            throw new Error('Wallet provider not available');
          }

          if (!address) {
            throw new Error('Wallet address not available');
          }

          const numericId = parseInt(propId, 10);
          if (isNaN(numericId)) {
            throw new Error('Invalid proposal ID');
          }

          telemetry.track('vote_initiated', { proposalId: propId, voteOption: option });

          const txResult = await submitVote(
            walletProvider,
            numericId,
            address,
            option
          );

          if (txResult.status === 'error') {
            throw new Error(txResult.error);
          }

          return txResult;
        });

        setTxStatus('success');
        telemetry.track('vote_success', {
          proposalId: propId,
          voteOption: option,
          txHash: result.txHash,
        });

        // Refetch data after successful vote
        invalidateGovernanceData(propId);

        return { success: true, txHash: result.txHash };
      } catch (err) {
        const errorMessage =
          err instanceof ProtectedActionError
            ? err.message
            : err instanceof Error
              ? err.message
              : 'Vote failed';

        setTxStatus('error');
        setTxError(errorMessage);
        telemetry.track('vote_failure', { proposalId: propId, error: errorMessage });

        return { success: false, error: errorMessage };
      }
    },
    [executeProtected, walletProvider, address, invalidateGovernanceData]
  );

  return {
    // Data
    votingPower,
    formattedVotingPower,
    isLoading,
    canUserVote,

    // Transaction state
    txStatus,
    txError,

    // Actions
    vote,
    resetTxState,

    // Utilities
    isReady,
  };
}
