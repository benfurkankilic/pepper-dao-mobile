import {
    PEPPER_DAO_GOVERNANCE_CONFIG,
    type AragonGovernanceConfig,
} from '@/config/aragon-governance';
import { type OnChainProposal } from '@/lib/aragon-onchain';
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
  proposal: OnChainProposal & {
    tally?: {
      yes: string;
      no: string;
      abstain: string;
    };
    votingSettings?: {
      supportThreshold: number;
      minParticipation: number;
      minDuration: number;
      minProposerVotingPower: string;
    };
    totalVotingPower?: string;
  },
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
    tally: proposal.tally,
    votingSettings: proposal.votingSettings,
    totalVotingPower: proposal.totalVotingPower,
    userVote: undefined,
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
 * Mock proposal data for development
 * Based on Aragon IProposal interface structure
 */
function getMockProposals(): Array<
  OnChainProposal & {
    tally?: {
      yes: string;
      no: string;
      abstain: string;
    };
    votingSettings?: {
      supportThreshold: number;
      minParticipation: number;
      minDuration: number;
      minProposerVotingPower: string;
    };
    totalVotingPower?: string;
  }
> {
  const now = Math.floor(Date.now() / 1000);
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  return [
    // Active Multisig Proposal
    {
      id: `${plugins.multisig.toLowerCase()}_0`,
      proposalId: 0,
      executed: false,
      approvals: 2,
      minApprovals: 3,
      startDate: now - 86400, // Started 1 day ago
      endDate: now + 259200, // Ends in 3 days
      actions: [
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: BigInt('1000000000000000000'), // 1 CHZ
          data: '0x',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.multisig,
      pluginType: 'MULTISIG',
      tally: {
        yes: '60000000000000000000', // 60 CTV
        no: '30000000000000000000', // 30 CTV
        abstain: '10000000000000000000', // 10 CTV
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 150000, // 15%
        minDuration: 259200, // 3 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '100000000000000000000', // 100 CTV total
    },
    // Executed PEP Proposal
    {
      id: `${plugins.spp.toLowerCase()}_0`,
      proposalId: 0,
      executed: true,
      approvals: 5,
      minApprovals: 3,
      startDate: now - 604800, // Started 7 days ago
      endDate: now - 86400, // Ended 1 day ago
      actions: [
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: BigInt('5000000000000000000'), // 5 CHZ
          data: '0x095ea7b3000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.spp,
      pluginType: 'SPP',
      tally: {
        yes: '100000000000000000000', // 100 CTV
        no: '0', // 0 CTV
        abstain: '0', // 0 CTV
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 150000, // 15%
        minDuration: 604800, // 7 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '100000000000000000000', // 100 CTV total
    },
    // Pending Multisig Proposal
    {
      id: `${plugins.multisig.toLowerCase()}_1`,
      proposalId: 1,
      executed: false,
      approvals: 0,
      minApprovals: 3,
      startDate: now + 172800, // Starts in 2 days
      endDate: now + 518400, // Ends in 6 days
      actions: [
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: BigInt('2000000000000000000'), // 2 CHZ
          data: '0x',
        },
        {
          to: '0xDedD0A73c3EC17dfbd057b0bD3FE6D2152b7284B',
          value: BigInt(0),
          data: '0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000000de0b6b3a7640000',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.multisig,
      pluginType: 'MULTISIG',
      tally: {
        yes: '0', // No votes yet
        no: '0',
        abstain: '0',
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 150000, // 15%
        minDuration: 259200, // 3 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '100000000000000000000', // 100 CTV total
    },
    // Succeeded PEP Proposal (not executed)
    {
      id: `${plugins.spp.toLowerCase()}_1`,
      proposalId: 1,
      executed: false,
      approvals: 4,
      minApprovals: 3,
      startDate: now - 432000, // Started 5 days ago
      endDate: now - 3600, // Ended 1 hour ago
      actions: [
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: BigInt('10000000000000000000'), // 10 CHZ
          data: '0x',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.spp,
      pluginType: 'SPP',
      tally: {
        yes: '75000000000000000000', // 75 CTV
        no: '10000000000000000000', // 10 CTV
        abstain: '5000000000000000000', // 5 CTV
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 150000, // 15%
        minDuration: 432000, // 5 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '100000000000000000000', // 100 CTV total
    },
    // Defeated Multisig Proposal
    {
      id: `${plugins.multisig.toLowerCase()}_2`,
      proposalId: 2,
      executed: false,
      approvals: 1,
      minApprovals: 3,
      startDate: now - 345600, // Started 4 days ago
      endDate: now - 7200, // Ended 2 hours ago
      actions: [
        {
          to: '0xDedD0A73c3EC17dfbd057b0bD3FE6D2152b7284B',
          value: BigInt(0),
          data: '0x095ea7b3000000000000000000000000742d35cc6634c0532925a3b844bc9e7595f0beb0000000000000000000000000000000000000000000000056bc75e2d63100000',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.multisig,
      pluginType: 'MULTISIG',
      tally: {
        yes: '20000000000000000000', // 20 CTV
        no: '70000000000000000000', // 70 CTV
        abstain: '5000000000000000000', // 5 CTV
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 150000, // 15%
        minDuration: 345600, // 4 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '100000000000000000000', // 100 CTV total
    },
    // Another Active PEP Proposal
    {
      id: `${plugins.spp.toLowerCase()}_2`,
      proposalId: 2,
      executed: false,
      approvals: 3,
      minApprovals: 5,
      startDate: now - 43200, // Started 12 hours ago
      endDate: now + 302400, // Ends in 3.5 days
      actions: [
        {
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: BigInt('3000000000000000000'), // 3 CHZ
          data: '0x',
        },
      ],
      allowFailureMap: BigInt(0),
      pluginAddress: plugins.spp,
      pluginType: 'SPP',
      tally: {
        yes: '45000000000000000000', // 45 CTV
        no: '25000000000000000000', // 25 CTV
        abstain: '10000000000000000000', // 10 CTV
      },
      votingSettings: {
        supportThreshold: 500000, // 50%
        minParticipation: 200000, // 20%
        minDuration: 302400, // 3.5 days
        minProposerVotingPower: '1000000000000000000', // 1 CTV
      },
      totalVotingPower: '150000000000000000000', // 150 CTV total
    },
  ];
}

/**
 * Fetch governance proposals from on-chain
 */
export async function fetchGovernanceProposals(
  filter?: GovernanceProposalFilter,
  pagination?: { first?: number; skip?: number },
): Promise<Array<GovernanceProposal>> {
  console.log('[Governance API] fetchGovernanceProposals called');
  console.log('[Governance API] Filter:', filter);
  console.log('[Governance API] Pagination:', pagination);

  try {
    // Use mock data instead of on-chain calls
    const onChainProposals = getMockProposals();

    console.log(
      '[Governance API] Mock proposals received:',
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

    // Apply pagination if provided
    let result = filtered;
    if (pagination) {
      const skip = pagination.skip ?? 0;
      const first = pagination.first ?? filtered.length;
      result = filtered.slice(skip, skip + first);
      console.log('[Governance API] After pagination:', result.length);
    }

    return result;
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
    // Use mock data instead of on-chain calls
    const mockProposals = getMockProposals();
    const onChainProposal = mockProposals.find((p) => p.id === id);

    if (!onChainProposal) {
      console.log('[Governance API] Proposal not found in mock data:', id);
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