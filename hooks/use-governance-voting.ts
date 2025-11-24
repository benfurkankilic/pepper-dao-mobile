import { useMutation } from '@tanstack/react-query';

import { CHILIZ_CHAIN_ID } from '@/config/chains';
import { useWallet } from '@/contexts/wallet-context';
import { getGovernanceConfig } from '@/services/governance-api';
import type { GovernanceProposal } from '@/types/governance';

type VoteChoice = 'FOR' | 'AGAINST' | 'ABSTAIN';

interface CastVoteArgs {
  proposal: GovernanceProposal;
  choice: VoteChoice;
}

interface UseGovernanceVotingOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

async function castVoteOnChain(args: CastVoteArgs): Promise<void> {
  const config = getGovernanceConfig();

  if (!config.voting || !config.voting.contractAddress || !config.voting.abi) {
    throw new Error(
      'Voting contract configuration is missing. Please configure `voting` in aragon-governance.ts.',
    );
  }

  // NOTE:
  // The concrete Aragon OSx voting call (TokenVoting / Multisig) depends on the
  // deployed contracts and ABIs, which are not wired into this mobile app yet.
  // Once available, use the configured contract data together with the
  // connected wallet provider to submit the transaction here.
  //
  // For now we fail fast with a descriptive error to avoid implying votes were sent.
  throw new Error(
    `Voting is not implemented yet for proposal ${args.proposal.key}. This is a placeholder hook.`,
  );
}

export function useGovernanceVoting(options?: UseGovernanceVotingOptions) {
  const { onSuccess, onError } = options ?? {};
  const { isConnected, chainId, isWrongNetwork } = useWallet();

  const mutation = useMutation({
    mutationFn: async (args: CastVoteArgs) => {
      if (!isConnected) {
        throw new Error('Connect your wallet to vote on proposals.');
      }

      const numericChainId =
        typeof chainId === 'string' ? parseInt(chainId, 10) : chainId;

      if (!numericChainId || numericChainId !== CHILIZ_CHAIN_ID || isWrongNetwork) {
        throw new Error('Please switch to Chiliz Chain (88888) to vote.');
      }

      await castVoteOnChain(args);
    },
    onSuccess,
    onError,
  });

  return {
    castVote: mutation.mutateAsync,
    isCastingVote: mutation.isPending,
    error: mutation.error,
  };
}


