/**
 * Voting API Service
 *
 * Provides contract interaction methods for governance voting.
 * Uses ethers.js for contract calls and integrates with Reown AppKit
 * for wallet provider access.
 */

import { BrowserProvider, Contract } from 'ethers';
import { createPublicClient, http, type Address } from 'viem';

import { ARAGON_CONTRACTS, TOKEN_VOTING_ABI } from '@/config/aragon-abis';
import { chiliz } from '@/config/chains';
import type { VoteOption } from '@/types/governance';

/**
 * EIP-1193 compatible provider interface
 */
interface Eip1193Provider {
  request: (args: { method: string; params?: Array<unknown> }) => Promise<unknown>;
}

/**
 * Voting transaction result
 */
export interface VotingTransactionResult {
  status: 'success' | 'error';
  txHash?: string;
  error?: string;
}

/**
 * Vote option mapping to contract enum values
 * Matches IMajorityVoting.VoteOption enum:
 * - None = 0 (not voted)
 * - Abstain = 1
 * - Yes = 2
 * - No = 3
 */
const VOTE_OPTION_MAP: Record<VoteOption, number> = {
  NONE: 0,
  ABSTAIN: 1,
  YES: 2,
  NO: 3,
};

/**
 * Public client for read-only operations
 */
const publicClient = createPublicClient({
  chain: chiliz,
  transport: http(),
});

/**
 * Create ethers provider and signer from wallet provider
 */
async function getProviderAndSigner(walletProvider: Eip1193Provider) {
  const provider = new BrowserProvider(walletProvider);
  const signer = await provider.getSigner();
  return { provider, signer };
}

/**
 * Get user's voting power for a proposal at its snapshot block
 * @param userAddress - User's wallet address
 * @param proposalId - On-chain proposal ID (numeric)
 */
export async function getVotingPower(
  userAddress: string,
  proposalId: number
): Promise<bigint> {
  try {
    // First check if user can vote (this validates voting power at snapshot)
    const canVoteResult = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: TOKEN_VOTING_ABI,
      functionName: 'canVote',
      args: [BigInt(proposalId), userAddress as Address, VOTE_OPTION_MAP.YES],
    });

    if (!canVoteResult) {
      return BigInt(0);
    }

    // Get the user's vote data (if they've already voted)
    const voteData = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: TOKEN_VOTING_ABI,
      functionName: 'getVote',
      args: [BigInt(proposalId), userAddress as Address],
    });

    // If user has voted, return their voting power from the vote
    const typedVoteData = voteData as unknown as [number, bigint];
    if (typedVoteData[0] !== VOTE_OPTION_MAP.NONE) {
      return typedVoteData[1];
    }

    // User hasn't voted yet but can vote - they have voting power
    // The actual voting power will be determined at vote submission
    // For now we return a placeholder indicating eligibility
    return BigInt(1);
  } catch (error) {
    console.error('[VotingAPI] Failed to get voting power:', error);
    throw new Error('Unable to check voting power. Please try again.');
  }
}

/**
 * Check if a user can vote on a proposal
 * @param userAddress - User's wallet address
 * @param proposalId - On-chain proposal ID
 * @param voteOption - Vote option to check
 */
export async function canVote(
  userAddress: string,
  proposalId: number,
  voteOption: VoteOption
): Promise<boolean> {
  try {
    const result = await publicClient.readContract({
      address: ARAGON_CONTRACTS.tokenVoting.address,
      abi: TOKEN_VOTING_ABI,
      functionName: 'canVote',
      args: [
        BigInt(proposalId),
        userAddress as Address,
        VOTE_OPTION_MAP[voteOption],
      ],
    });

    return result;
  } catch (error) {
    console.warn('[VotingAPI] Failed to check if can vote:', error);
    throw new Error('Unable to verify voting eligibility. Please try again.');
  }
}

/**
 * Submit a vote on a governance proposal
 * @param walletProvider - EIP-1193 provider from Reown AppKit
 * @param proposalId - On-chain proposal ID (numeric)
 * @param voterAddress - Voter's wallet address
 * @param voteOption - Vote option (YES, NO, ABSTAIN)
 */
export async function submitVote(
  walletProvider: Eip1193Provider,
  proposalId: number,
  voterAddress: string,
  voteOption: VoteOption
): Promise<VotingTransactionResult> {
  try {
    const { signer } = await getProviderAndSigner(walletProvider);

    const tokenVotingContract = new Contract(
      ARAGON_CONTRACTS.tokenVoting.address,
      TOKEN_VOTING_ABI,
      signer
    );

    const voteOptionValue = VOTE_OPTION_MAP[voteOption];

    console.log('[VotingAPI] Submitting vote:', {
      contractAddress: ARAGON_CONTRACTS.tokenVoting.address,
      proposalId,
      voterAddress,
      voteOption,
      voteOptionValue,
    });

    // Token Voting vote function signature:
    // vote(uint256 _proposalId, address _voter, uint8 _voteOption, uint256 _newVotingPower)
    // _newVotingPower is used for increasing voting power (0 = use current power)
    const tx = await tokenVotingContract.vote(
      BigInt(proposalId),
      voterAddress,
      voteOptionValue,
      BigInt(0) // Use current voting power
    );

    console.log('[VotingAPI] Vote tx submitted:', tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    const txHash = receipt?.hash ?? tx.hash;

    console.log('[VotingAPI] Vote confirmed:', txHash);

    return {
      status: 'success',
      txHash,
    };
  } catch (error) {
    console.error('[VotingAPI] Vote failed:', error);
    return {
      status: 'error',
      error: parseVotingError(error),
    };
  }
}

/**
 * Parse voting errors to user-friendly messages
 */
export function parseVotingError(error: unknown): string {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // User rejected transaction
  if (
    errorMessage.includes('user rejected') ||
    errorMessage.includes('User rejected') ||
    errorMessage.includes('ACTION_REJECTED')
  ) {
    return 'Transaction was cancelled';
  }

  // Proposal not active
  if (
    errorMessage.includes('ProposalExecutionForbidden') ||
    errorMessage.includes('not active')
  ) {
    return 'This proposal is no longer accepting votes';
  }

  // Already voted
  if (errorMessage.includes('VoteCastForbidden')) {
    return 'You have already voted on this proposal';
  }

  // No voting power
  if (
    errorMessage.includes('insufficient voting power') ||
    errorMessage.includes('no voting power')
  ) {
    return 'You do not have voting power for this proposal';
  }

  // Insufficient funds for gas
  if (
    errorMessage.includes('insufficient funds') ||
    errorMessage.includes('INSUFFICIENT_FUNDS')
  ) {
    return 'Insufficient CHZ for transaction fee';
  }

  // Network error
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('NETWORK_ERROR')
  ) {
    return 'Network error. Please check your connection';
  }

  // Generic error
  return 'Vote failed. Please try again';
}
