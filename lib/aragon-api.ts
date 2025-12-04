import { z } from 'zod';

import { PEPPER_DAO_GOVERNANCE_CONFIG } from '@/config/aragon-governance';

/**
 * Aragon Backend API Client
 *
 * Uses the Aragon app.aragon.org backend API to fetch proposals.
 * This is more reliable than on-chain queries as it:
 * - Includes IPFS metadata (title, description)
 * - Has pagination and filtering built-in
 * - Works without needing the exact plugin instance addresses
 */

const ARAGON_BACKEND_URL = 'https://app.aragon.org/api/backend/v2';

// Schema for executed status
const executedStatusSchema = z.object({
  status: z.boolean(),
  transactionHash: z.string().nullable(),
  blockNumber: z.number().nullable(),
  blockTimestamp: z.number().nullable(),
});

// Schema for proposal metrics
const proposalMetricsSchema = z.object({
  totalVotes: z.number(),
  missingVotes: z.number(),
  votesByOption: z.array(z.unknown()),
});

// Schema for proposal settings
const proposalSettingsSchema = z
  .object({
    minApprovals: z.number().optional(),
    onlyListed: z.boolean().optional(),
    historicalMembersCount: z.number().optional(),
  })
  .passthrough();

// Schema for a single proposal from the API
const aragonProposalSchema = z.object({
  id: z.string(),
  transactionHash: z.string().nullable(),
  blockNumber: z.number().nullable(),
  blockTimestamp: z.number().nullable(),
  network: z.string(),
  pluginAddress: z.string(),
  pluginSubdomain: z.string(),
  daoAddress: z.string(),
  proposalIndex: z.string(),
  incrementalId: z.number(),
  startDate: z.number(),
  endDate: z.number(),
  metadataUri: z.string().nullable(),
  title: z.string().nullable(),
  description: z.string().nullable(),
  summary: z.string().nullable(),
  resources: z.array(z.unknown()),
  executed: executedStatusSchema,
  isSubProposal: z.boolean(),
  metrics: proposalMetricsSchema.optional(),
  settings: proposalSettingsSchema.optional(),
  stageIndex: z.number().optional(),
});

// Schema for the API response
const proposalsResponseSchema = z.object({
  metadata: z.object({
    page: z.number(),
    pageSize: z.number(),
    totalPages: z.number(),
    totalRecords: z.number(),
  }),
  data: z.array(aragonProposalSchema),
});

export type AragonApiProposal = z.infer<typeof aragonProposalSchema>;
export type AragonProposalsResponse = z.infer<typeof proposalsResponseSchema>;

/**
 * Build the DAO ID for API requests
 * Format: network-daoAddress (e.g., "chiliz-mainnet-0xDedD0...")
 */
function buildDaoId(): string {
  const { daoNetworkKey, daoAddress } = PEPPER_DAO_GOVERNANCE_CONFIG;
  return `${daoNetworkKey}-${daoAddress}`;
}

/**
 * Fetch proposals from Aragon Backend API
 */
export async function fetchAragonProposals(options?: {
  pageSize?: number;
  onlyActive?: boolean;
  isExecuted?: boolean;
}): Promise<AragonProposalsResponse> {
  const { pageSize = 10, onlyActive, isExecuted } = options ?? {};

  const daoId = buildDaoId();
  const params = new URLSearchParams({
    daoId,
    pageSize: pageSize.toString(),
    sort: 'blockTimestamp',
    isSubProposal: 'false',
  });

  // Add optional filters
  if (onlyActive !== undefined) {
    params.set('onlyActive', onlyActive.toString());
  }
  if (isExecuted !== undefined) {
    params.set('isExecuted', isExecuted.toString());
  }

  const url = `${ARAGON_BACKEND_URL}/proposals?${params.toString()}`;

  console.log('[Aragon API] Fetching proposals from:', url);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Handle rate limiting
      if (response.status === 429) {
        console.warn('[Aragon API] Rate limited. Please wait before retrying.');
        throw new Error('Rate limited by Aragon API. Please try again later.');
      }
      throw new Error(
        `Aragon API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    console.log('[Aragon API] Response metadata:', data.metadata);

    // Validate the response
    const validated = proposalsResponseSchema.parse(data);
    console.log('[Aragon API] Validated proposals:', validated.data.length);

    return validated;
  } catch (error) {
    console.error('[Aragon API] Error fetching proposals:', error);
    throw error;
  }
}

/**
 * Fetch a single proposal by ID
 */
export async function fetchAragonProposalById(
  proposalId: string,
): Promise<AragonApiProposal | null> {
  const url = `${ARAGON_BACKEND_URL}/proposals/${proposalId}`;

  console.log('[Aragon API] Fetching proposal by ID:', proposalId);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(
        `Aragon API request failed: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    // Validate the response
    const validated = aragonProposalSchema.parse(data);
    console.log('[Aragon API] Fetched proposal:', validated.title);

    return validated;
  } catch (error) {
    console.error('[Aragon API] Error fetching proposal:', error);
    return null;
  }
}

/**
 * Fetch all proposals (up to pageSize limit)
 */
export async function fetchAllAragonProposals(): Promise<
  Array<AragonApiProposal>
> {
  console.log('[Aragon API] Fetching all proposals');

  const response = await fetchAragonProposals({
    pageSize: 50,
  });

  console.log('[Aragon API] Total proposals fetched:', response.data.length);
  return response.data;
}

