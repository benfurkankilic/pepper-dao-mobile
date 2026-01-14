import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useProvider } from '@reown/appkit-react-native';

import { useProtectedAction } from './use-protected-action';
import { createProposal } from '@/services/proposal-api';
import { refreshProposals } from '@/services/governance-api';
import type { CreateProposalParams, CreateProposalResult } from '@/types/proposal-form';

export type CreateProposalStatus = 'idle' | 'pending' | 'success' | 'error';

interface UseCreateProposalReturn {
  /** Submit a new proposal */
  submit: (params: CreateProposalParams) => Promise<CreateProposalResult>;
  /** Current submission status */
  status: CreateProposalStatus;
  /** Error message if submission failed */
  error: string | null;
  /** Transaction hash if successful */
  txHash: string | null;
  /** Proposal ID if extracted from events */
  proposalId: string | null;
  /** Whether a submission is in progress */
  isSubmitting: boolean;
  /** Reset status back to idle */
  reset: () => void;
}

/**
 * Hook for creating proposals on-chain
 *
 * Handles:
 * - Wallet connection validation
 * - Transaction submission
 * - Status tracking
 * - Cache invalidation after success
 */
export function useCreateProposal(): UseCreateProposalReturn {
  const { provider: walletProvider } = useProvider();
  const { executeProtected } = useProtectedAction();
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<CreateProposalStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [proposalId, setProposalId] = useState<string | null>(null);

  const submit = useCallback(
    async (params: CreateProposalParams): Promise<CreateProposalResult> => {
      setStatus('pending');
      setError(null);
      setTxHash(null);
      setProposalId(null);

      try {
        const result = await executeProtected(async () => {
          if (!walletProvider) {
            throw new Error('Wallet provider not available');
          }

          return createProposal(walletProvider, params);
        });

        if (result.status === 'error') {
          setStatus('error');
          setError(result.error ?? 'Failed to create proposal');
          return result;
        }

        // Success
        setStatus('success');
        setTxHash(result.txHash ?? null);
        setProposalId(result.proposalId ?? null);

        // Invalidate governance queries to refetch proposals
        await queryClient.invalidateQueries({ queryKey: ['governance'] });

        // Trigger backend sync to index the new proposal
        try {
          await refreshProposals();
        } catch (syncError) {
          // Non-critical: sync will happen automatically
          console.warn('[useCreateProposal] Failed to trigger sync:', syncError);
        }

        return result;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create proposal';
        setStatus('error');
        setError(errorMessage);
        return {
          status: 'error',
          error: errorMessage,
        };
      }
    },
    [executeProtected, walletProvider, queryClient]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setTxHash(null);
    setProposalId(null);
  }, []);

  return {
    submit,
    status,
    error,
    txHash,
    proposalId,
    isSubmitting: status === 'pending',
    reset,
  };
}
