import {
  fetchGovernanceProposals,
  getGovernanceSummary,
} from '@/services/governance-api';
import type { GovernanceProposal } from '@/types/governance';

export async function runGovernanceTests(): Promise<void> {
  const allProposals: Array<GovernanceProposal> = await fetchGovernanceProposals();

  if (allProposals.length === 0) {
    console.log('No proposals found - this may be expected if the DAO has no proposals yet');
    return;
  }

  // Test filtering by status
  const activeOnly: Array<GovernanceProposal> = await fetchGovernanceProposals({
    status: 'ACTIVE',
  });

  const hasOnlyActive: boolean = activeOnly.every(
    (proposal) => proposal.status === 'ACTIVE',
  );

  if (!hasOnlyActive) {
    throw new Error('ACTIVE filter returned non-active proposals');
  }

  // Test summary function
  const summary = getGovernanceSummary(allProposals);

  if (summary.total !== allProposals.length) {
    throw new Error('Summary total does not match number of proposals');
  }

  // Test that proposals have required fields
  const firstProposal = allProposals[0];
  if (!firstProposal.id || !firstProposal.pluginProposalId) {
    throw new Error('Proposal missing required id fields');
  }

  if (typeof firstProposal.approvals !== 'number') {
    throw new Error('Proposal missing approvals count');
  }

  if (typeof firstProposal.minApprovals !== 'number') {
    throw new Error('Proposal missing minApprovals count');
  }

  console.log('Governance tests passed successfully');
}
