import { createPublicClient, getAbiItem, http, type Address } from 'viem';

import {
  ARAGON_CONTRACTS
} from '@/config/aragon-abis';
import { chiliz } from '@/config/chains';

/**
 * Aragon OSx On-Chain Query Module
 *
 * Reads proposals directly from the blockchain using viem.
 * Uses the correct IMPLEMENTATION ABIs with PROXY addresses:
 * 
 * - Staged Processor Proxy: 0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415
 *   Implementation: 0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135
 * 
 * - Token Voting Proxy: 0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff
 *   Implementation: 0xf1b3ed4f41509f1661def5518d198e0b0257ffe1
 * 
 * - Multisig: 0x1FecF1c23dD2E8C7adF937583b345277d39bD554
 */

// Public client for reading from Chiliz chain
const publicClient = createPublicClient({
  chain: chiliz,
  transport: http(),
});

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
  currentStage?: number;
  canceled?: boolean;
  open?: boolean;
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

/**
 * Get the total number of proposals from the Multisig plugin
 */
export async function getMultisigProposalCount(): Promise<number> {
  console.log(
    '[Aragon OnChain] Getting proposal count from Multisig plugin:',
    ARAGON_CONTRACTS.multisig.address,
  );

  try {
    const count = await publicClient.readContract({
      address: ARAGON_CONTRACTS.multisig.address,
      abi: ARAGON_CONTRACTS.multisig.abi,
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
  console.log('[Aragon OnChain] Getting Multisig proposal:', proposalId);

  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.multisig.address,
      abi: ARAGON_CONTRACTS.multisig.abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });

    const [executed, approvals, parameters, actions, allowFailureMap] = result;

    return {
      id: `${ARAGON_CONTRACTS.multisig.address.toLowerCase()}_${proposalId}`,
      proposalId,
      executed,
      approvals: Number(approvals),
      minApprovals: Number(parameters.minApprovals),
      startDate: Number(parameters.startDate),
      endDate: Number(parameters.endDate),
      actions: actions.map((action: { to: Address; value: bigint; data: string }) => ({
        to: action.to,
        value: action.value,
        data: action.data,
      })),
      allowFailureMap,
      pluginAddress: ARAGON_CONTRACTS.multisig.address,
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
 * Get proposal details from Token Voting plugin (Stage 2)
 * Returns vote tallies and voting parameters
 */
export async function getTokenVotingProposal(
  proposalId: number,
): Promise<{
  open: boolean;
  executed: boolean;
  parameters: {
    votingMode: number;
    supportThresholdRatio: number;
    startDate: bigint;
    endDate: bigint;
    minParticipationRatio: bigint;
    minApprovalRatio: bigint;
  };
  tally: {
    abstain: bigint;
    yes: bigint;
    no: bigint;
  };
  actions: Array<{
    to: Address;
    value: bigint;
    data: string;
  }>;
  allowFailureMap: bigint;
} | null> {
  console.log('[Aragon OnChain] Getting Token Voting proposal:', proposalId);

  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });

    // Token Voting getProposal returns a tuple
    // [open, executed, parameters, tally, actions, allowFailureMap]
    const proposalData = result as any;
    const open = proposalData[0];
    const executed = proposalData[1];
    const parameters = proposalData[2];
    const tally = proposalData[3];
    const actions = proposalData[4];
    const allowFailureMap = proposalData[5];

    return {
      open,
      executed,
      parameters,
      tally,
      actions: actions.map((action: { to: Address; value: bigint; data: string }) => ({
        to: action.to,
        value: action.value,
        data: action.data,
      })),
      allowFailureMap,
    };
  } catch (error) {
    console.error(
      '[Aragon OnChain] Failed to get Token Voting proposal:',
      proposalId,
      error,
    );
    return null;
  }
}

/**
 * Get all proposal IDs from the Staged Processor using ProposalCreated events
 * This replaces the deprecated proposalCount() function
 * 
 * Uses chunked queries to avoid "Block range is too large" RPC errors
 */
export async function getSppProposalIds(): Promise<Array<number>> {
  console.log(
    '[Aragon OnChain] Querying ProposalCreated events from Staged Processor:',
    ARAGON_CONTRACTS.stagedProcessor.address,
  );

  try {
    // Extract the ProposalCreated event from the ABI
    const proposalCreatedEvent = getAbiItem({
      abi: ARAGON_CONTRACTS.stagedProcessor.abi,
      name: 'ProposalCreated',
    });

    // Get the latest block number
    const latestBlock = await publicClient.getBlockNumber();
    console.log('[Aragon OnChain] Latest block:', latestBlock);

    // Chiliz Spicy mainnet contract was deployed around block 10,000,000
    // Use a conservative starting block or earliest
    const startBlock = BigInt(10_000_000);
    const chunkSize = BigInt(100_000); // Query 2k blocks at a time - Ankr has strict limits

    const allLogs = [];
    let currentBlock = startBlock;

    // Query logs in chunks to avoid RPC limits
    while (currentBlock < latestBlock) {
      const toBlock = currentBlock + chunkSize > latestBlock 
        ? latestBlock 
        : currentBlock + chunkSize;

      console.log(
        '[Aragon OnChain] Querying blocks',
        currentBlock.toString(),
        'to',
        toBlock.toString(),
      );

      const logs = await publicClient.getLogs({
        address: ARAGON_CONTRACTS.stagedProcessor.address,
        event: proposalCreatedEvent,
        fromBlock: currentBlock,
        toBlock,
        strict: true, // Ensure all logs match the event signature
      });

      allLogs.push(...logs);
      currentBlock = toBlock + BigInt(1);
    }

    console.log('[Aragon OnChain] Found', allLogs.length, 'ProposalCreated events');

    // Extract proposal IDs from logs
    const proposalIds = allLogs
      .map((log) => log.args.proposalId)
      .filter((id): id is bigint => id !== undefined)
      .map((id) => Number(id));

    console.log('[Aragon OnChain] SPP proposal IDs:', proposalIds);
    return proposalIds;
  } catch (error) {
    console.error('[Aragon OnChain] Failed to query ProposalCreated events:', error);
    return [];
  }
}

/**
 * Get a single proposal by ID from the Staged Processor
 */
export async function getSppProposal(
  proposalId: number,
): Promise<OnChainProposal | null> {
  console.log('[Aragon OnChain] Getting Staged Processor proposal:', proposalId);

  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.stagedProcessor.address,
      abi: ARAGON_CONTRACTS.stagedProcessor.abi,
      functionName: 'getProposal',
      args: [BigInt(proposalId)],
    });

    // Staged Processor returns 8 values
    // [allowFailureMap, lastStageTransition, currentStage, stageConfigIndex, executed, canceled, creator, actions, targetConfig]
    const proposalData = result as any;
    const allowFailureMap = proposalData[0];
    const lastStageTransition = proposalData[1];
    const currentStage = proposalData[2];
    const stageConfigIndex = proposalData[3];
    const executed = proposalData[4];
    const canceled = proposalData[5];
    const actions = proposalData[7];

    // For Stage 2 proposals, fetch vote tallies from Token Voting using SAME ID
    let votingDetails = null;
    if (currentStage === 1) {
      votingDetails = await getTokenVotingProposal(proposalId);
    }

    return {
      id: `${ARAGON_CONTRACTS.stagedProcessor.address.toLowerCase()}_${proposalId}`,
      proposalId,
      executed,
      approvals: 0, // Not applicable for Staged Processor
      minApprovals: 0, // Not applicable for Staged Processor
      startDate: votingDetails 
        ? Number(votingDetails.parameters.startDate)
        : Number(lastStageTransition),
      endDate: votingDetails
        ? Number(votingDetails.parameters.endDate)
        : Number(lastStageTransition) + 7 * 24 * 60 * 60,
      actions: actions.map((action: { to: Address; value: bigint; data: string }) => ({
        to: action.to,
        value: action.value,
        data: action.data,
      })),
      allowFailureMap,
      pluginAddress: ARAGON_CONTRACTS.stagedProcessor.address,
      pluginType: 'SPP',
      currentStage,
      canceled,
      open: votingDetails?.open,
      tally: votingDetails
        ? {
            yes: votingDetails.tally.yes.toString(),
            no: votingDetails.tally.no.toString(),
            abstain: votingDetails.tally.abstain.toString(),
          }
        : undefined,
      votingSettings: votingDetails
        ? {
            supportThreshold: Number(votingDetails.parameters.supportThresholdRatio),
            minParticipation: Number(votingDetails.parameters.minParticipationRatio),
            minDuration: Number(votingDetails.parameters.endDate - votingDetails.parameters.startDate),
            minProposerVotingPower: '0',
          }
        : undefined,
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
 * Filters to only return Stage 2 (Public Governance) proposals
 * Uses event-based discovery instead of deprecated proposalCount()
 */
export async function getAllSppProposals(): Promise<Array<OnChainProposal>> {
  console.log('[Aragon OnChain] Fetching all SPP proposals');

  // Get proposal IDs from ProposalCreated events
  const proposalIds = await getSppProposalIds();

  if (proposalIds.length === 0) {
    console.log('[Aragon OnChain] No SPP proposals found');
    return [];
  }

  // Sort IDs in descending order (most recent first)
  const sortedIds = proposalIds.sort((a, b) => b - a);

  // Fetch proposals in parallel
  const proposals = await Promise.all(sortedIds.map(getSppProposal));

  // Filter for Stage 2 (Public Governance) proposals only
  const stage2Proposals = proposals.filter(
    (p): p is OnChainProposal => 
      p !== null && 
      p.currentStage === 1 && // ONLY Stage 2 (currentStage 1 = Stage 2)
      !p.canceled,
  );

  console.log(
    '[Aragon OnChain] Fetched Stage 2 SPP proposals:',
    stage2Proposals.length,
  );
  return stage2Proposals;
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
 * Check if an address is a member of the Multisig plugin (Spicy Ministers)
 */
export async function isMember(address: Address): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.multisig.address,
      abi: ARAGON_CONTRACTS.multisig.abi,
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
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.multisig.address,
      abi: ARAGON_CONTRACTS.multisig.abi,
      functionName: 'hasApproved',
      args: [BigInt(proposalId), address],
    });

    return result;
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to check approval status:', error);
    return false;
  }
}

/**
 * Check if a user can vote on a Token Voting proposal
 */
export async function canVote(
  proposalId: number,
  voterAddress: Address,
  voteOption: number,
): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'canVote',
      args: [BigInt(proposalId), voterAddress, voteOption],
    });

    return result;
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to check if can vote:', error);
    return false;
  }
}

/**
 * Get a user's vote on a Token Voting proposal
 */
export async function getUserVote(
  proposalId: number,
  voterAddress: Address,
): Promise<{ voteOption: number; votingPower: bigint } | null> {
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'getVote',
      args: [BigInt(proposalId), voterAddress],
    });

    // Cast to any to handle tuple return type
    const voteData = result as any;
    const voteOption = Number(voteData[0]);
    const votingPower = BigInt(voteData[1]);
    
    return {
      voteOption,
      votingPower,
    };
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to get user vote:', error);
    return null;
  }
}

/**
 * Check if a user is eligible to vote (has PEPPER tokens)
 */
export async function isEligibleToVote(address: Address): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: ARAGON_CONTRACTS.tokenVoting.abi,
      functionName: 'isMember',
      args: [address],
    });

    return result;
  } catch (error) {
    console.warn('[Aragon OnChain] Failed to check voting eligibility:', error);
    return false;
  }
}

