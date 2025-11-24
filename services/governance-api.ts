import { z } from 'zod';

import {
  PEPPER_DAO_GOVERNANCE_CONFIG,
  type AragonGovernanceConfig,
} from '@/config/aragon-governance';
import type {
  GovernanceProposal,
  GovernanceProposalFilter,
  GovernanceProposalType,
} from '@/types/governance';

const governanceStatusSchema = z.union([
  z.literal('ACTIVE'),
  z.literal('EXECUTED'),
  z.literal('PENDING'),
  z.literal('DEFEATED'),
  z.literal('CANCELLED'),
]);

const governanceProposalTypeSchema = z.union([
  z.literal('ADMIN'),
  z.literal('PEPPER_EVOLUTION'),
  z.literal('OTHER'),
]);

const governanceProposalSchema = z.object({
  id: z.string(),
  key: z.string(),
  title: z.string(),
  description: z.string().default(''),
  status: governanceStatusSchema,
  type: governanceProposalTypeSchema,
  proposer: z.string(),
  createdAt: z.string(),
  executedAt: z.string().nullable().optional(),
  stageLabel: z.string().nullable().optional(),
  timeLabel: z.string().nullable().optional(),
});

type GovernanceProposalInput = z.input<typeof governanceProposalSchema>;

const MOCK_PROPOSALS: Array<GovernanceProposalInput> = [
  {
    id: 'pep-0',
    key: 'PEP-0',
    title: 'This is a test proposal 2',
    description: 'Testing PEPPER DAO app Test #2',
    status: 'ACTIVE',
    type: 'PEPPER_EVOLUTION',
    proposer: '0xCA93F31000000000000000000000000000000000',
    createdAt: new Date().toISOString(),
    executedAt: null,
    stageLabel: 'in Spicy Council Signoff',
    timeLabel: '7 days left',
  },
  {
    id: 'admin-2',
    key: 'ADMIN-2',
    title: 'Testing DAO app Proposal',
    description: 'This is a test Proposal',
    status: 'EXECUTED',
    type: 'ADMIN',
    proposer: '0xCA93F31000000000000000000000000000000000',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    executedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    stageLabel: null,
    timeLabel: '5 hours ago',
  },
  {
    id: 'admin-1',
    key: 'ADMIN-1',
    title: 'Apply plugin installation',
    description: 'This proposal applies the plugin installation to create the new process',
    status: 'EXECUTED',
    type: 'ADMIN',
    proposer: '0xCA93F31000000000000000000000000000000000',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    executedAt: new Date(Date.now() - 59 * 24 * 60 * 60 * 1000).toISOString(),
    stageLabel: null,
    timeLabel: '2 months ago',
  },
  {
    id: 'admin-0',
    key: 'ADMIN-0',
    title: 'Update admins',
    description:
      'One or more changes have been made to who has permission to execute proposals via Pepper DAO.',
    status: 'EXECUTED',
    type: 'ADMIN',
    proposer: '0xCA93F31000000000000000000000000000000000',
    createdAt: new Date(Date.now() - 61 * 24 * 60 * 60 * 1000).toISOString(),
    executedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    stageLabel: null,
    timeLabel: '2 months ago',
  },
];

function normalizeProposal(input: GovernanceProposalInput): GovernanceProposal {
  return governanceProposalSchema.parse(input);
}

function filterProposals(
  proposals: Array<GovernanceProposal>,
  filter?: GovernanceProposalFilter,
): Array<GovernanceProposal> {
  if (!filter) {
    return proposals;
  }

  return proposals.filter((proposal) => {
    const matchesStatus: boolean =
      !filter.status || filter.status === 'ALL' || proposal.status === filter.status;
    const matchesType: boolean =
      !filter.type || filter.type === 'ALL' || proposal.type === filter.type;

    return matchesStatus && matchesType;
  });
}

export function getGovernanceConfig(): AragonGovernanceConfig {
  return PEPPER_DAO_GOVERNANCE_CONFIG;
}

export async function fetchGovernanceProposals(
  filter?: GovernanceProposalFilter,
): Promise<Array<GovernanceProposal>> {
  const config = getGovernanceConfig();

  if (!config.proposalsApiUrl) {
    const normalized: Array<GovernanceProposal> = MOCK_PROPOSALS.map(normalizeProposal);
    return filterProposals(normalized, filter);
  }

  // Remote Aragon API integration will be added once the proposalsApiUrl and schema are finalized.
  // For now, fail fast with a descriptive error to avoid silent misconfiguration.
  throw new Error(
    'Remote Aragon governance API is not implemented yet. Clear `proposalsApiUrl` to use mock data.',
  );
}

export async function fetchGovernanceProposalById(
  id: string,
): Promise<GovernanceProposal | null> {
  const proposals: Array<GovernanceProposal> = await fetchGovernanceProposals();
  const match = proposals.find((proposal) => proposal.id === id);
  return match ?? null;
}

export function getGovernanceSummary(proposals: Array<GovernanceProposal>): {
  total: number;
  types: number;
  executed: number;
  mostRecentLabel: string;
} {
  if (proposals.length === 0) {
    return {
      total: 0,
      types: 0,
      executed: 0,
      mostRecentLabel: 'N/A',
    };
  }

  const total: number = proposals.length;

  const types: number = new Set<GovernanceProposalType>(
    proposals.map((proposal) => proposal.type),
  ).size;

  const executed: number = proposals.filter(
    (proposal) => proposal.status === 'EXECUTED',
  ).length;

  const sorted: Array<GovernanceProposal> = [...proposals].sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const mostRecent: GovernanceProposal = sorted[0];

  const label: string =
    mostRecent.timeLabel ??
    'Most recent';

  return {
    total,
    types,
    executed,
    mostRecentLabel: label,
  };
}


