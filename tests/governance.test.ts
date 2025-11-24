import {
  fetchGovernanceProposals,
  getGovernanceSummary,
} from '@/services/governance-api';
import type { GovernanceProposal } from '@/types/governance';

export async function runGovernanceTests(): Promise<void> {
  const allProposals: Array<GovernanceProposal> = await fetchGovernanceProposals();

  if (allProposals.length === 0) {
    throw new Error('Expected mock governance proposals to be available');
  }

  const adminOnly: Array<GovernanceProposal> = await fetchGovernanceProposals({
    type: 'ADMIN',
  });

  const hasOnlyAdmin: boolean = adminOnly.every(
    (proposal) => proposal.type === 'ADMIN',
  );

  if (!hasOnlyAdmin) {
    throw new Error('ADMIN filter returned non-admin proposals');
  }

  const summary = getGovernanceSummary(allProposals);

  if (summary.total !== allProposals.length) {
    throw new Error('Summary total does not match number of proposals');
  }

  if (summary.types <= 0) {
    throw new Error('Summary types should be at least 1');
  }
}


