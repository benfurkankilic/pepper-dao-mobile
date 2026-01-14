import { useQuery } from '@tanstack/react-query';

import { useWallet } from '@/contexts/wallet-context';
import { checkProposerEligibility } from '@/services/proposal-api';
import type { ProposerEligibility } from '@/types/proposal-form';

/**
 * Hook to check if the current user is eligible to create proposals
 *
 * Queries the Token Voting contract to:
 * 1. Get minProposerVotingPower threshold
 * 2. Get user's current voting power (locked PEPPER)
 * 3. Compare to determine eligibility
 */
export function useProposerEligibility() {
  const { address, isConnected } = useWallet();

  return useQuery<ProposerEligibility>({
    queryKey: ['proposer-eligibility', address],
    queryFn: async () => {
      if (!address) {
        return {
          minRequired: BigInt(0),
          userPower: BigInt(0),
          isEligible: false,
        };
      }
      return checkProposerEligibility(address);
    },
    enabled: isConnected && !!address,
    staleTime: 60_000, // 1 minute
    gcTime: 5 * 60_000, // 5 minutes
  });
}
