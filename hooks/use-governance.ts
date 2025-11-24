import { useQuery } from '@tanstack/react-query';

import {
  fetchGovernanceProposalById,
  fetchGovernanceProposals,
} from '@/services/governance-api';
import type {
  GovernanceProposal,
  GovernanceProposalFilter,
} from '@/types/governance';

const GOVERNANCE_PROPOSALS_QUERY_KEY = ['governance', 'proposals'] as const;

interface UseGovernanceProposalsOptions extends GovernanceProposalFilter {
  enabled?: boolean;
}

export function useGovernanceProposals(options?: UseGovernanceProposalsOptions) {
  const { status, type, enabled = true } = options ?? {};

  return useQuery<Array<GovernanceProposal>>({
    queryKey: [
      ...GOVERNANCE_PROPOSALS_QUERY_KEY,
      status ?? 'ALL',
      type ?? 'ALL',
    ],
    queryFn: () => fetchGovernanceProposals({ status, type }),
    enabled,
  });
}

interface UseGovernanceProposalOptions {
  proposalId: string | undefined;
  enabled?: boolean;
}

export function useGovernanceProposal(options: UseGovernanceProposalOptions) {
  const { proposalId, enabled = true } = options;

  return useQuery<GovernanceProposal | null>({
    queryKey: ['governance', 'proposal', proposalId],
    queryFn: () => {
      if (!proposalId) {
        return Promise.resolve(null);
      }
      return fetchGovernanceProposalById(proposalId);
    },
    enabled: enabled && Boolean(proposalId),
  });
}


