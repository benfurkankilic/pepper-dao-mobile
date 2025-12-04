import {
  PEPPER_DAO_GOVERNANCE_CONFIG,
  type AragonGovernanceConfig,
} from '@/config/aragon-governance';
import {
  getAllProposals,
  getMultisigProposal,
  getSppProposal,
  type OnChainProposal,
} from '@/lib/aragon-onchain';
import {
  generateTimeLabel,
  type GovernanceProposal,
  type GovernanceProposalFilter,
  type GovernanceProposalType,
  type GovernanceStatus,
} from '@/types/governance';

/**
 * Get the governance configuration
 */
export function getGovernanceConfig(): AragonGovernanceConfig {
  return PEPPER_DAO_GOVERNANCE_CONFIG;
}

/**
 * Map plugin type to GovernanceProposalType
 */
function mapPluginType(
  pluginType: 'MULTISIG' | 'SPP',
): GovernanceProposalType {
  switch (pluginType) {
    case 'MULTISIG':
      return 'MULTISIG';
    case 'SPP':
      return 'PEP';
    default:
      return 'OTHER';
  }
}

/**
 * Derive governance status from on-chain proposal data
 */
function deriveStatus(proposal: OnChainProposal): GovernanceStatus {
  const now = Date.now();
  const startTime = proposal.startDate * 1000;
  const endTime = proposal.endDate * 1000;

  // Check if executed
  if (proposal.executed) {
    return 'EXECUTED';
  }

  // Check timing
  if (now < startTime) {
    return 'PENDING';
  }

  if (now > endTime) {
    // Check if approval threshold was reached
    return proposal.approvals >= proposal.minApprovals ? 'SUCCEEDED' : 'DEFEATED';
  }

  return 'ACTIVE';
}

/**
 * Transform an on-chain proposal to our app's GovernanceProposal type
 */
function transformOnChainProposal(
  proposal: OnChainProposal,
): GovernanceProposal {
  console.log(
    '[Governance API] Transforming proposal:',
    proposal.pluginType,
    proposal.proposalId,
  );

  const status = deriveStatus(proposal);
  const type = mapPluginType(proposal.pluginType);

  const transformed: GovernanceProposal = {
    id: proposal.id,
    pluginProposalId: proposal.proposalId.toString(),
    key: `${type}-${proposal.proposalId}`,
    title: `${type} Proposal #${proposal.proposalId}`,
    description: `${type} proposal with ${proposal.actions.length} action(s)`,
    status,
    type,
    proposer: proposal.pluginAddress,
    createdAt: new Date(proposal.startDate * 1000).toISOString(),
    startDate: new Date(proposal.startDate * 1000).toISOString(),
    endDate: new Date(proposal.endDate * 1000).toISOString(),
    executedAt: proposal.executed
      ? new Date().toISOString() // On-chain doesn't store execution timestamp
      : null,
    approvals: proposal.approvals,
    minApprovals: proposal.minApprovals,
    approvalReached: proposal.approvals >= proposal.minApprovals,
    actions: proposal.actions.map((a) => ({
      to: a.to,
      value: a.value.toString(),
      data: a.data,
    })),
    timeLabel: null,
  };

  // Generate time label based on status and dates
  transformed.timeLabel = generateTimeLabel({
    status: transformed.status,
    startDate: (proposal.startDate * 1000).toString(),
    endDate: (proposal.endDate * 1000).toString(),
    executedAt: proposal.executed ? Date.now().toString() : null,
  });

  console.log(
    '[Governance API] Transformed:',
    transformed.key,
    transformed.status,
  );

  return transformed;
}

/**
 * Filter proposals by status
 */
function filterProposals(
  proposals: Array<GovernanceProposal>,
  filter?: GovernanceProposalFilter,
): Array<GovernanceProposal> {
  if (!filter) {
    return proposals;
  }

  return proposals.filter((proposal) => {
    const matchesStatus: boolean =
      !filter.status ||
      filter.status === 'ALL' ||
      proposal.status === filter.status;

    return matchesStatus;
  });
}

/**
 * Fetch governance proposals from on-chain
 */
export async function fetchGovernanceProposals(
  filter?: GovernanceProposalFilter,
): Promise<Array<GovernanceProposal>> {
  console.log('[Governance API] fetchGovernanceProposals called');
  console.log('[Governance API] Filter:', filter);

  try {
    // Fetch proposals from all plugins on-chain
    const onChainProposals = await getAllProposals();

    console.log(
      '[Governance API] On-chain proposals received:',
      onChainProposals.length,
    );

    if (onChainProposals.length === 0) {
      console.log('[Governance API] No proposals found');
      return [];
    }

    // Transform all proposals
    const proposals = onChainProposals.map(transformOnChainProposal);
    console.log('[Governance API] Transformed proposals:', proposals.length);

    // Apply filtering
    const filtered = filterProposals(proposals, filter);
    console.log('[Governance API] After filtering:', filtered.length);

    return filtered;
  } catch (error) {
    console.error('[Governance API] Error fetching proposals:', error);
    // Return empty array instead of throwing to prevent app crashes
    return [];
  }
}

/**
 * Fetch a single governance proposal by ID
 */
export async function fetchGovernanceProposalById(
  id: string,
): Promise<GovernanceProposal | null> {
  console.log('[Governance API] Fetching proposal by ID:', id);

  try {
    // Parse the ID to determine plugin and proposal ID
    // Format: pluginAddress_proposalId
    const parts = id.split('_');
    if (parts.length !== 2) {
      console.error('[Governance API] Invalid proposal ID format:', id);
      return null;
    }

    const [pluginAddress, proposalIdStr] = parts;
    const proposalId = parseInt(proposalIdStr, 10);

    if (isNaN(proposalId)) {
      console.error('[Governance API] Invalid proposal ID number:', id);
      return null;
    }

    // Determine which plugin to query
    const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;
    let onChainProposal: OnChainProposal | null = null;

    if (pluginAddress.toLowerCase() === plugins.multisig.toLowerCase()) {
      onChainProposal = await getMultisigProposal(proposalId);
    } else if (pluginAddress.toLowerCase() === plugins.spp.toLowerCase()) {
      onChainProposal = await getSppProposal(proposalId);
    } else {
      console.error('[Governance API] Unknown plugin address:', pluginAddress);
      return null;
    }

    if (!onChainProposal) {
      return null;
    }

    return transformOnChainProposal(onChainProposal);
  } catch (error) {
    console.error('[Governance API] Error fetching proposal:', error);
    return null;
  }
}

/**
 * Get summary statistics for governance proposals
 */
export function getGovernanceSummary(proposals: Array<GovernanceProposal>): {
  total: number;
  active: number;
  executed: number;
  mostRecentLabel: string;
} {
  if (proposals.length === 0) {
    return {
      total: 0,
      active: 0,
      executed: 0,
      mostRecentLabel: 'N/A',
    };
  }

  const total: number = proposals.length;

  const active: number = proposals.filter(
    (proposal) => proposal.status === 'ACTIVE',
  ).length;

  const executed: number = proposals.filter(
    (proposal) => proposal.status === 'EXECUTED',
  ).length;

  const mostRecent: GovernanceProposal = proposals[0];
  const label: string = mostRecent.timeLabel ?? 'Most recent';

  return {
    total,
    active,
    executed,
    mostRecentLabel: label,
  };
}
