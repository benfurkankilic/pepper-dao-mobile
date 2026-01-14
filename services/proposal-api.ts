/**
 * Proposal API Service
 *
 * Provides contract interaction methods for creating PEP proposals.
 * Uses ethers.js for contract calls and integrates with Reown AppKit
 * for wallet provider access.
 */

import { BrowserProvider, Contract, hexlify, toUtf8Bytes, Interface } from 'ethers';
import { createPublicClient, http } from 'viem';

import { ACTIVE_CHAIN } from '@/config/chains';
import { ARAGON_CONTRACTS, STAGED_PROCESSOR_ABI, TOKEN_VOTING_ABI } from '@/config/aragon-abis';
import type { CreateProposalParams, CreateProposalResult, ProposerEligibility } from '@/types/proposal-form';

/**
 * EIP-1193 compatible provider interface
 * Works with both ethers Eip1193Provider and AppKit's Provider
 */
interface Eip1193Provider {
  request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
}

/**
 * Public client for read-only operations
 */
const publicClient = createPublicClient({
  chain: ACTIVE_CHAIN,
  transport: http(),
});

/**
 * Create ethers provider and signer from Reown wallet provider
 */
async function getProviderAndSigner(walletProvider: Eip1193Provider) {
  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  return { provider, signer };
}

/**
 * Parse proposal creation errors into user-friendly messages
 */
function parseProposalError(error: unknown): string {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes('user rejected') || message.includes('user denied')) {
      return 'Transaction was rejected by user';
    }

    if (message.includes('insufficient funds')) {
      return 'Insufficient CHZ for gas fees';
    }

    if (message.includes('proposer voting power')) {
      return 'Insufficient voting power to create proposals';
    }

    return error.message;
  }

  return 'Failed to create proposal';
}

/**
 * Build metadata JSON for on-chain storage
 */
function buildProposalMetadata(params: CreateProposalParams): string {
  const description = [params.summary, params.body].filter(Boolean).join('\n\n');

  const metadata: Record<string, unknown> = {
    title: params.title,
  };

  if (description) {
    metadata.description = description;
  }

  if (params.resources && params.resources.length > 0) {
    metadata.resources = params.resources;
  }

  return JSON.stringify(metadata);
}

/**
 * Fetch minimum proposer voting power from Token Voting contract
 */
export async function getMinProposerVotingPower(): Promise<bigint> {
  try {
    const minPower = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: TOKEN_VOTING_ABI,
      functionName: 'minProposerVotingPower',
    });

    return minPower as bigint;
  } catch (error) {
    console.error('[ProposalAPI] Failed to fetch minProposerVotingPower:', error);
    // Return 0 if we can't fetch (allow proposals)
    return BigInt(0);
  }
}

/**
 * Fetch user's voting power from Token Voting contract
 * Uses votingToken().balanceOf() to check locked PEPPER balance
 */
export async function getUserVotingPower(userAddress: string): Promise<bigint> {
  try {
    // First get the voting token address from Token Voting contract
    const votingToken = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: TOKEN_VOTING_ABI,
      functionName: 'votingToken',
    });

    // Then get user's balance of the voting token (locked PEPPER)
    const balance = await publicClient.readContract({
      address: votingToken as `0x${string}`,
      abi: [
        {
          type: 'function',
          name: 'balanceOf',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ] as const,
      functionName: 'balanceOf',
      args: [userAddress as `0x${string}`],
    });

    return balance as bigint;
  } catch (error) {
    console.error('[ProposalAPI] Failed to fetch user voting power:', error);
    return BigInt(0);
  }
}

/**
 * Check if user is eligible to create proposals
 */
export async function checkProposerEligibility(userAddress: string): Promise<ProposerEligibility> {
  const [minRequired, userPower] = await Promise.all([
    getMinProposerVotingPower(),
    getUserVotingPower(userAddress),
  ]);

  return {
    minRequired,
    userPower,
    isEligible: userPower >= minRequired,
  };
}

/**
 * Create a PEP proposal on-chain via the Staged Proposal Processor
 *
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 * @param params - Proposal content (title, summary, body, resources)
 */
export async function createProposal(
  walletProvider: Eip1193Provider,
  params: CreateProposalParams
): Promise<CreateProposalResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);

    // Build metadata
    const metadataJson = buildProposalMetadata(params);
    const metadataBytes = hexlify(toUtf8Bytes(metadataJson));

    console.log('[ProposalAPI] Creating proposal:', {
      title: params.title,
      metadataLength: metadataJson.length,
    });

    // Create contract instance
    const contract = new Contract(
      ARAGON_CONTRACTS.stagedProcessor.address,
      STAGED_PROCESSOR_ABI,
      signer
    );

    // Call createProposal with:
    // - metadata: hex-encoded JSON
    // - actions: empty array (text-only proposal)
    // - startDate: 0 (use contract default)
    // - endDate: 0 (use contract default)
    // - data: empty bytes
    const tx = await contract.createProposal(
      metadataBytes, // _metadata
      [], // _actions (empty for text-only)
      0, // _startDate (0 = immediate)
      0, // _endDate (0 = use default duration)
      '0x' // _data (empty)
    );

    console.log('[ProposalAPI] Proposal tx submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;

    console.log('[ProposalAPI] Proposal confirmed:', txHash);

    // Extract proposalId from event logs
    let proposalId: string | undefined;
    try {
      const iface = new Interface(STAGED_PROCESSOR_ABI);
      for (const log of receipt.logs) {
        try {
          const parsed = iface.parseLog({
            topics: log.topics as Array<string>,
            data: log.data,
          });
          if (parsed?.name === 'ProposalCreated') {
            proposalId = parsed.args.proposalId?.toString();
            console.log('[ProposalAPI] Extracted proposalId:', proposalId);
            break;
          }
        } catch {
          // Not our event, continue
        }
      }
    } catch (error) {
      console.warn('[ProposalAPI] Failed to extract proposalId from logs:', error);
    }

    return {
      status: 'success',
      proposalId,
      txHash,
    };
  } catch (error) {
    console.error('[ProposalAPI] Create proposal failed:', error);
    return {
      status: 'error',
      error: parseProposalError(error),
    };
  }
}
