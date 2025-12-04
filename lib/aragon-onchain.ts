import { createPublicClient, http, type Address } from 'viem';

import { PEPPER_DAO_GOVERNANCE_CONFIG } from '@/config/aragon-governance';
import { chiliz } from '@/config/chains';

/**
 * Aragon OSx On-Chain Query Module
 *
 * Reads proposals directly from the blockchain using viem.
 * Uses the correct installed plugin instance addresses:
 * - Multisig: 0x1FecF1c23dD2E8C7adF937583b345277d39bD554
 * - SPP: 0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
 */

// Public client for reading from Chiliz chain
const publicClient = createPublicClient({
  chain: chiliz,
  transport: http(),
});

// Minimal ABI for Aragon Multisig plugin
const MULTISIG_PLUGIN_ABI = [
  {
    inputs: [],
    name: 'proposalCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'bool', name: 'executed', type: 'bool' },
      { internalType: 'uint16', name: 'approvals', type: 'uint16' },
      {
        components: [
          { internalType: 'uint16', name: 'minApprovals', type: 'uint16' },
          { internalType: 'uint64', name: 'snapshotBlock', type: 'uint64' },
          { internalType: 'uint64', name: 'startDate', type: 'uint64' },
          { internalType: 'uint64', name: 'endDate', type: 'uint64' },
        ],
        internalType: 'struct Multisig.ProposalParameters',
        name: 'parameters',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct IDAO.Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: '_member', type: 'address' }],
    name: 'isMember',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'uint256', name: '_proposalId', type: 'uint256' },
      { internalType: 'address', name: '_approver', type: 'address' },
    ],
    name: 'hasApproved',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'canExecute',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Minimal ABI for SPP (Staged Proposal Plugin)
const SPP_PLUGIN_ABI = [
  {
    inputs: [],
    name: 'proposalCount',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'bool', name: 'executed', type: 'bool' },
      { internalType: 'uint16', name: 'approvals', type: 'uint16' },
      {
        components: [
          { internalType: 'uint16', name: 'minApprovals', type: 'uint16' },
          { internalType: 'uint64', name: 'snapshotBlock', type: 'uint64' },
          { internalType: 'uint64', name: 'startDate', type: 'uint64' },
          { internalType: 'uint64', name: 'endDate', type: 'uint64' },
        ],
        internalType: 'struct ProposalParameters',
        name: 'parameters',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct IDAO.Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Proposal structure from on-chain query
export interface OnChainProposal {
  id: string;
  proposalId: number;
  executed: boolean;
  approvals: number;
  minApprovals: number;
  startDate: number;
  endDate: number;
  actions: Array<{
    to: Address;
    value: bigint;
    data: string;
  }>;
  allowFailureMap: bigint;
  pluginAddress: Address;
  pluginType: 'MULTISIG' | 'SPP';
}

/**
 * Get the total number of proposals from the Multisig plugin
 */
export async function getMultisigProposalCount(): Promise<number> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  console.log(
    '[Aragon OnChain] Getting proposal count from Multisig plugin:',
    plugins.multisig,
  );

  try {
    const count = await publicClient.readContract({
      address: plugins.multisig,
      abi: MULTISIG_PLUGIN_ABI,
      functionName: 'proposalCount',
    });

    console.log('[Aragon OnChain] Multisig proposal count:', count.toString());
    return Number(count);
  } catch (error) {
    console.error(
      '[Aragon OnChain] Failed to get Multisig proposal count:',
      error,
    );
    return 0;
  }
}

/**
 * Get a single proposal by ID from the Multisig plugin
 */
export async function getMultisigProposal(
  proposalId: number,
): Promise<OnChainProposal | null> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  console.log('[Aragon OnChain] Getting Multisig proposal:', proposalId);

  try {
    const result = await publicClient.readContract({
      address: plugins.multisig,
      abi: MULTISIG_PLUGIN_ABI,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });

    const [executed, approvals, parameters, actions, allowFailureMap] = result;

    return {
      id: `${plugins.multisig.toLowerCase()}_${proposalId}`,
      proposalId,
      executed,
      approvals: Number(approvals),
      minApprovals: Number(parameters.minApprovals),
      startDate: Number(parameters.startDate),
      endDate: Number(parameters.endDate),
      actions: actions.map((action) => ({
        to: action.to,
        value: action.value,
        data: action.data,
      })),
      allowFailureMap,
      pluginAddress: plugins.multisig,
      pluginType: 'MULTISIG',
    };
  } catch (error) {
    console.error(
      '[Aragon OnChain] Failed to get Multisig proposal:',
      proposalId,
      error,
    );
    return null;
  }
}

/**
 * Get all proposals from the Multisig plugin
 */
export async function getAllMultisigProposals(): Promise<
  Array<OnChainProposal>
> {
  console.log('[Aragon OnChain] Fetching all Multisig proposals');

  const count = await getMultisigProposalCount();

  if (count === 0) {
    console.log('[Aragon OnChain] No Multisig proposals found');
    return [];
  }

  // Fetch proposals in parallel (most recent first)
  const proposalIds = Array.from({ length: count }, (_, i) => count - 1 - i);
  const proposals = await Promise.all(proposalIds.map(getMultisigProposal));

  // Filter out any null results
  const validProposals = proposals.filter(
    (p): p is OnChainProposal => p !== null,
  );

  console.log(
    '[Aragon OnChain] Fetched Multisig proposals:',
    validProposals.length,
  );
  return validProposals;
}

/**
 * Get the total number of proposals from the SPP plugin
 */
export async function getSppProposalCount(): Promise<number> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  console.log(
    '[Aragon OnChain] Getting proposal count from SPP plugin:',
    plugins.spp,
  );

  try {
    const count = await publicClient.readContract({
      address: plugins.spp,
      abi: SPP_PLUGIN_ABI,
      functionName: 'proposalCount',
    });

    console.log('[Aragon OnChain] SPP proposal count:', count.toString());
    return Number(count);
  } catch (error) {
    console.error('[Aragon OnChain] Failed to get SPP proposal count:', error);
    return 0;
  }
}

/**
 * Get a single proposal by ID from the SPP plugin
 */
export async function getSppProposal(
  proposalId: number,
): Promise<OnChainProposal | null> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  console.log('[Aragon OnChain] Getting SPP proposal:', proposalId);

  try {
    const result = await publicClient.readContract({
      address: plugins.spp,
      abi: SPP_PLUGIN_ABI,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });

    const [executed, approvals, parameters, actions, allowFailureMap] = result;

    return {
      id: `${plugins.spp.toLowerCase()}_${proposalId}`,
      proposalId,
      executed,
      approvals: Number(approvals),
      minApprovals: Number(parameters.minApprovals),
      startDate: Number(parameters.startDate),
      endDate: Number(parameters.endDate),
      actions: actions.map((action) => ({
        to: action.to,
        value: action.value,
        data: action.data,
      })),
      allowFailureMap,
      pluginAddress: plugins.spp,
      pluginType: 'SPP',
    };
  } catch (error) {
    console.error(
      '[Aragon OnChain] Failed to get SPP proposal:',
      proposalId,
      error,
    );
    return null;
  }
}

/**
 * Get all proposals from the SPP plugin
 */
export async function getAllSppProposals(): Promise<Array<OnChainProposal>> {
  console.log('[Aragon OnChain] Fetching all SPP proposals');

  const count = await getSppProposalCount();

  if (count === 0) {
    console.log('[Aragon OnChain] No SPP proposals found');
    return [];
  }

  // Fetch proposals in parallel (most recent first)
  const proposalIds = Array.from({ length: count }, (_, i) => count - 1 - i);
  const proposals = await Promise.all(proposalIds.map(getSppProposal));

  // Filter out any null results
  const validProposals = proposals.filter(
    (p): p is OnChainProposal => p !== null,
  );

  console.log('[Aragon OnChain] Fetched SPP proposals:', validProposals.length);
  return validProposals;
}

/**
 * Get all proposals from all plugins
 */
export async function getAllProposals(): Promise<Array<OnChainProposal>> {
  console.log('[Aragon OnChain] Fetching all proposals from all plugins');

  // Fetch from both plugins in parallel
  const [multisigProposals, sppProposals] = await Promise.all([
    getAllMultisigProposals(),
    getAllSppProposals(),
  ]);

  // Combine and sort by startDate (most recent first)
  const allProposals = [...multisigProposals, ...sppProposals].sort(
    (a, b) => b.startDate - a.startDate,
  );

  console.log('[Aragon OnChain] Total proposals:', allProposals.length);
  return allProposals;
}

/**
 * Check if an address is a member of the Multisig plugin
 */
export async function isMember(address: Address): Promise<boolean> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  try {
    const result = await publicClient.readContract({
      address: plugins.multisig,
      abi: MULTISIG_PLUGIN_ABI,
      functionName: 'isMember',
      args: [address],
    });

    return result;
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to check membership:', error);
    return false;
  }
}

/**
 * Check if an address has approved a specific proposal
 */
export async function hasApproved(
  proposalId: number,
  address: Address,
): Promise<boolean> {
  const { plugins } = PEPPER_DAO_GOVERNANCE_CONFIG;

  try {
    const result = await publicClient.readContract({
      address: plugins.multisig,
      abi: MULTISIG_PLUGIN_ABI,
      functionName: 'hasApproved',
      args: [BigInt(proposalId), address],
    });

    return result;
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to check approval status:', error);
    return false;
  }
}

