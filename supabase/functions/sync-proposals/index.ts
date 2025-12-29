import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createPublicClient, getAbiItem, http } from 'npm:viem@2.38.6';

/**
 * Sync Proposals Edge Function
 *
 * Indexes ProposalCreated events from the Aragon Staged Processor contract
 * and stores them in Supabase for fast retrieval.
 *
 * Deployment: supabase functions deploy sync-proposals --no-verify-jwt
 *
 * Usage:
 * - Manual: curl -X POST https://<project>.supabase.co/functions/v1/sync-proposals
 * - Cron: Set up via Supabase Dashboard > Database > Extensions > pg_cron
 *
 * Ankr Public Tier Limits (https://www.ankr.com/docs/rpc-service/service-plans/):
 * - Max block range: 1,000 blocks
 * - Rate limit: ~1,800 requests/minute
 */

// Chiliz mainnet chain configuration
const chiliz = {
  id: 88888,
  name: 'Chiliz',
  nativeCurrency: { name: 'CHZ', symbol: 'CHZ', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.ankr.com/chiliz'] },
  },
  blockExplorers: {
    default: { name: 'Chiliscan', url: 'https://chiliscan.com' },
  },
} as const;

// Contract addresses (Pepper DAO on Chiliz)
const STAGED_PROCESSOR_ADDRESS = '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415' as const;
const TOKEN_VOTING_ADDRESS = '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff' as const;

/**
 * Staged Proposal Processor ABI (minimal)
 * Full ABI: config/aragon-abis.ts
 */
const STAGED_PROCESSOR_ABI = [
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'proposalId', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'creator', type: 'address' },
      { indexed: false, internalType: 'uint64', name: 'startDate', type: 'uint64' },
      { indexed: false, internalType: 'uint64', name: 'endDate', type: 'uint64' },
      { indexed: false, internalType: 'bytes', name: 'metadata', type: 'bytes' },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        indexed: false,
        internalType: 'struct Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { indexed: false, internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      {
        components: [
          { internalType: 'uint128', name: 'allowFailureMap', type: 'uint128' },
          { internalType: 'uint64', name: 'lastStageTransition', type: 'uint64' },
          { internalType: 'uint16', name: 'currentStage', type: 'uint16' },
          { internalType: 'uint16', name: 'stageConfigIndex', type: 'uint16' },
          { internalType: 'bool', name: 'executed', type: 'bool' },
          { internalType: 'bool', name: 'canceled', type: 'bool' },
          { internalType: 'address', name: 'creator', type: 'address' },
          {
            components: [
              { internalType: 'address', name: 'to', type: 'address' },
              { internalType: 'uint256', name: 'value', type: 'uint256' },
              { internalType: 'bytes', name: 'data', type: 'bytes' },
            ],
            internalType: 'struct Action[]',
            name: 'actions',
            type: 'tuple[]',
          },
          {
            components: [
              { internalType: 'address', name: 'target', type: 'address' },
              { internalType: 'enum IPlugin.Operation', name: 'operation', type: 'uint8' },
            ],
            internalType: 'struct IPlugin.TargetConfig',
            name: 'targetConfig',
            type: 'tuple',
          },
        ],
        internalType: 'struct StagedProposalProcessor.Proposal',
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Token Voting ABI (minimal)
 * Full ABI: config/aragon-abis.ts
 */
const TOKEN_VOTING_ABI = [
  {
    inputs: [{ internalType: 'uint256', name: '_proposalId', type: 'uint256' }],
    name: 'getProposal',
    outputs: [
      { internalType: 'bool', name: 'open', type: 'bool' },
      { internalType: 'bool', name: 'executed', type: 'bool' },
      {
        components: [
          { internalType: 'enum MajorityVotingBase.VotingMode', name: 'votingMode', type: 'uint8' },
          { internalType: 'uint32', name: 'supportThresholdRatio', type: 'uint32' },
          { internalType: 'uint64', name: 'startDate', type: 'uint64' },
          { internalType: 'uint64', name: 'endDate', type: 'uint64' },
          { internalType: 'uint256', name: 'minParticipationRatio', type: 'uint256' },
          { internalType: 'uint256', name: 'minApprovalRatio', type: 'uint256' },
        ],
        internalType: 'struct MajorityVotingBase.ProposalParameters',
        name: 'parameters',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'uint256', name: 'abstain', type: 'uint256' },
          { internalType: 'uint256', name: 'yes', type: 'uint256' },
          { internalType: 'uint256', name: 'no', type: 'uint256' },
        ],
        internalType: 'struct MajorityVotingBase.Tally',
        name: 'tally',
        type: 'tuple',
      },
      {
        components: [
          { internalType: 'address', name: 'to', type: 'address' },
          { internalType: 'uint256', name: 'value', type: 'uint256' },
          { internalType: 'bytes', name: 'data', type: 'bytes' },
        ],
        internalType: 'struct Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
      {
        components: [
          { internalType: 'address', name: 'target', type: 'address' },
          { internalType: 'enum IPlugin.Operation', name: 'operation', type: 'uint8' },
        ],
        internalType: 'struct IPlugin.TargetConfig',
        name: 'targetConfig',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// Rate limiting: minimum 60 seconds between syncs
const MIN_SYNC_INTERVAL_MS = 60_000;

// Ankr Public tier limit: max 1,000 blocks per getLogs request
const BLOCK_CHUNK_SIZE = BigInt(1_000);

// Max blocks to process per function invocation (to avoid timeout)
const MAX_BLOCKS_PER_CALL = BigInt(50_000);

interface ProposalData {
  proposal_id: number;
  plugin_address: string;
  plugin_type: 'SPP';
  title: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  executed_at: string | null;
  tally_yes: string;
  tally_no: string;
  tally_abstain: string;
  total_voting_power: string;
  support_threshold: number;
  min_participation: number;
  min_duration: number;
  current_stage: number;
  is_canceled: boolean;
  is_open: boolean;
  actions: Array<{ to: string; value: string; data: string }>;
  block_number: number;
  transaction_hash: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check sync state and rate limiting
    const { data: syncState, error: syncError } = await supabase
      .from('sync_state')
      .select('*')
      .eq('id', 'default')
      .single();

    if (syncError) {
      console.error('Failed to get sync state:', syncError);
      return new Response(JSON.stringify({ error: 'Failed to get sync state' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if sync is already in progress
    if (syncState.sync_in_progress) {
      return new Response(JSON.stringify({ message: 'Sync already in progress', skipped: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting check
    const lastSyncAt = syncState.last_sync_at ? new Date(syncState.last_sync_at).getTime() : 0;
    const now = Date.now();
    if (now - lastSyncAt < MIN_SYNC_INTERVAL_MS) {
      const waitTime = Math.ceil((MIN_SYNC_INTERVAL_MS - (now - lastSyncAt)) / 1000);
      return new Response(
        JSON.stringify({
          message: `Rate limited. Try again in ${waitTime} seconds`,
          skipped: true,
          retryAfter: waitTime,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': waitTime.toString(),
          },
        },
      );
    }

    // Mark sync as in progress
    await supabase
      .from('sync_state')
      .update({ sync_in_progress: true, error_message: null })
      .eq('id', 'default');

    // Initialize viem client
    const publicClient = createPublicClient({
      chain: chiliz,
      transport: http('https://rpc.ankr.com/chiliz'),
    });

    // Get the latest block number
    const latestBlock = await publicClient.getBlockNumber();
    console.log('Latest block:', latestBlock);

    // Query from last synced block
    const startBlock = BigInt(syncState.last_synced_block);

    // Limit blocks per invocation to avoid timeout
    const targetBlock =
      startBlock + MAX_BLOCKS_PER_CALL > latestBlock ? latestBlock : startBlock + MAX_BLOCKS_PER_CALL;

    console.log(`Syncing from block ${startBlock} to ${targetBlock} (latest: ${latestBlock})`);

    // Extract ProposalCreated event from ABI
    const proposalCreatedEvent = getAbiItem({
      abi: STAGED_PROCESSOR_ABI,
      name: 'ProposalCreated',
    });

    const allLogs: Array<any> = [];
    let currentBlock = startBlock;
    let errorCount = 0;
    const maxErrors = 10;

    // Query logs in chunks of 1000 blocks (Ankr Public tier limit)
    while (currentBlock < targetBlock && errorCount < maxErrors) {
      const toBlock =
        currentBlock + BLOCK_CHUNK_SIZE > targetBlock ? targetBlock : currentBlock + BLOCK_CHUNK_SIZE;

      try {
        const logs = await publicClient.getLogs({
          address: STAGED_PROCESSOR_ADDRESS,
          event: proposalCreatedEvent,
          fromBlock: currentBlock,
          toBlock,
          strict: true,
        });

        if (logs.length > 0) {
          console.log(`Found ${logs.length} events in blocks ${currentBlock}-${toBlock}`);
          allLogs.push(...logs);
        }
        errorCount = 0; // Reset on success
      } catch (e: any) {
        console.error(`Error querying blocks ${currentBlock}-${toBlock}:`, e.message || e);
        errorCount++;

        // Add delay before retry on error
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue; // Retry same block range
      }

      currentBlock = toBlock + BigInt(1);

      // Small delay between requests to respect rate limits
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    console.log(`Found ${allLogs.length} total ProposalCreated events`);

    // Process new proposals
    const newProposals: ProposalData[] = [];

    for (const log of allLogs) {
      const proposalId = Number(log.args.proposalId);

      // Check if proposal already exists
      const { data: existing } = await supabase
        .from('proposals')
        .select('id')
        .eq('proposal_id', proposalId)
        .eq('plugin_address', STAGED_PROCESSOR_ADDRESS.toLowerCase())
        .single();

      if (existing) {
        console.log(`Proposal ${proposalId} already exists, skipping`);
        continue;
      }

      try {
        // Get proposal details from Staged Processor
        const sppResult = await publicClient.readContract({
          address: STAGED_PROCESSOR_ADDRESS,
          abi: STAGED_PROCESSOR_ABI,
          functionName: 'getProposal',
          args: [BigInt(proposalId)],
        });

        const sppData = sppResult as any;
        const currentStage = Number(sppData.currentStage);
        const executed = sppData.executed;
        const canceled = sppData.canceled;
        const actions = sppData.actions || [];

        // Stage 0 = Spicy Ministers (Multisig)
        // Stage 1 = Token Voting (Public voting)
        // We want Stage 1+ proposals for public display
        if (currentStage < 1) {
          console.log(`Proposal ${proposalId} is at stage ${currentStage}, skipping (still in Stage 0)`);
          continue;
        }

        // Get Token Voting details
        let votingDetails: any = null;
        try {
          const tvResult = await publicClient.readContract({
            address: TOKEN_VOTING_ADDRESS,
            abi: TOKEN_VOTING_ABI,
            functionName: 'getProposal',
            args: [BigInt(proposalId)],
          });

          votingDetails = {
            open: (tvResult as any)[0],
            executed: (tvResult as any)[1],
            parameters: (tvResult as any)[2],
            tally: (tvResult as any)[3],
            actions: (tvResult as any)[4],
            allowFailureMap: (tvResult as any)[5],
            targetConfig: (tvResult as any)[6],
          };
        } catch (e) {
          console.error(`Failed to get Token Voting details for proposal ${proposalId}:`, e);
        }

        // Derive status
        let status = 'ACTIVE';
        if (executed) {
          status = 'EXECUTED';
        } else if (canceled) {
          status = 'CANCELED';
        } else if (votingDetails) {
          if (votingDetails.open) {
            status = 'ACTIVE';
          } else {
            const yes = BigInt(votingDetails.tally.yes || 0);
            const no = BigInt(votingDetails.tally.no || 0);
            status = yes > no ? 'SUCCEEDED' : 'DEFEATED';
          }
        }

        const startDate = votingDetails
          ? new Date(Number(votingDetails.parameters.startDate) * 1000).toISOString()
          : new Date(Number(sppData.lastStageTransition) * 1000).toISOString();

        const endDate = votingDetails
          ? new Date(Number(votingDetails.parameters.endDate) * 1000).toISOString()
          : new Date((Number(sppData.lastStageTransition) + 7 * 24 * 60 * 60) * 1000).toISOString();

        const proposalData: ProposalData = {
          proposal_id: proposalId,
          plugin_address: STAGED_PROCESSOR_ADDRESS.toLowerCase(),
          plugin_type: 'SPP',
          title: `PEP Proposal #${proposalId}`,
          description: `Governance proposal with ${actions.length} action(s)`,
          status,
          start_date: startDate,
          end_date: endDate,
          executed_at: executed ? new Date().toISOString() : null,
          tally_yes: votingDetails?.tally?.yes?.toString() || '0',
          tally_no: votingDetails?.tally?.no?.toString() || '0',
          tally_abstain: votingDetails?.tally?.abstain?.toString() || '0',
          total_voting_power: '0',
          support_threshold: votingDetails ? Number(votingDetails.parameters.supportThresholdRatio) : 0,
          min_participation: votingDetails ? Number(votingDetails.parameters.minParticipationRatio) : 0,
          min_duration: votingDetails
            ? Number(votingDetails.parameters.endDate) - Number(votingDetails.parameters.startDate)
            : 604800,
          current_stage: currentStage,
          is_canceled: canceled,
          is_open: votingDetails?.open || false,
          actions: actions.map((a: any) => ({
            to: a.to,
            value: a.value.toString(),
            data: a.data,
          })),
          block_number: Number(log.blockNumber),
          transaction_hash: log.transactionHash,
        };

        newProposals.push(proposalData);
      } catch (e) {
        console.error(`Failed to process proposal ${proposalId}:`, e);
      }
    }

    // Insert new proposals
    if (newProposals.length > 0) {
      const { error: insertError } = await supabase.from('proposals').insert(newProposals);

      if (insertError) {
        console.error('Failed to insert proposals:', insertError);
        throw insertError;
      }

      console.log(`Inserted ${newProposals.length} new proposals`);

      // Trigger notifications for new proposals
      for (const proposal of newProposals) {
        try {
          await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${supabaseServiceKey}`,
            },
            body: JSON.stringify({
              type: 'new_proposal',
              proposalId: proposal.proposal_id,
              title: proposal.title,
            }),
          });
        } catch (e) {
          console.error(`Failed to send notification for proposal ${proposal.proposal_id}:`, e);
        }
      }
    }

    // Update existing proposals (refresh vote tallies for active ones)
    const { data: activeProposals } = await supabase
      .from('proposals')
      .select('proposal_id')
      .eq('status', 'ACTIVE');

    let updatedCount = 0;
    if (activeProposals && activeProposals.length > 0) {
      for (const prop of activeProposals) {
        try {
          const tvResult = await publicClient.readContract({
            address: TOKEN_VOTING_ADDRESS,
            abi: TOKEN_VOTING_ABI,
            functionName: 'getProposal',
            args: [BigInt(prop.proposal_id)],
          });

          const votingDetails = {
            open: (tvResult as any)[0],
            executed: (tvResult as any)[1],
            parameters: (tvResult as any)[2],
            tally: (tvResult as any)[3],
          };

          let status = 'ACTIVE';
          if (votingDetails.executed) {
            status = 'EXECUTED';
          } else if (!votingDetails.open) {
            const yes = BigInt(votingDetails.tally.yes || 0);
            const no = BigInt(votingDetails.tally.no || 0);
            status = yes > no ? 'SUCCEEDED' : 'DEFEATED';
          }

          await supabase
            .from('proposals')
            .update({
              status,
              tally_yes: votingDetails.tally.yes?.toString() || '0',
              tally_no: votingDetails.tally.no?.toString() || '0',
              tally_abstain: votingDetails.tally.abstain?.toString() || '0',
              is_open: votingDetails.open,
              executed_at: votingDetails.executed ? new Date().toISOString() : null,
            })
            .eq('proposal_id', prop.proposal_id);

          updatedCount++;
        } catch (e) {
          console.error(`Failed to update proposal ${prop.proposal_id}:`, e);
        }
      }
    }

    // Update sync state with where we actually got to
    const syncedToBlock = currentBlock > BigInt(1) ? currentBlock - BigInt(1) : startBlock;
    const needsMoreSync = syncedToBlock < latestBlock;

    await supabase
      .from('sync_state')
      .update({
        last_synced_block: Number(syncedToBlock),
        last_sync_at: new Date().toISOString(),
        sync_in_progress: false,
        error_message: null,
      })
      .eq('id', 'default');

    return new Response(
      JSON.stringify({
        success: true,
        message: `Synced to block ${syncedToBlock}`,
        newProposals: newProposals.length,
        updatedProposals: updatedCount,
        needsMoreSync,
        latestBlock: Number(latestBlock),
        blocksRemaining: Number(latestBlock - syncedToBlock),
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('Sync error:', error);

    // Try to update sync state with error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('sync_state')
        .update({
          sync_in_progress: false,
          error_message: error instanceof Error ? error.message : 'Unknown error',
        })
        .eq('id', 'default');
    } catch (e) {
      console.error('Failed to update sync state with error:', e);
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  }
});

