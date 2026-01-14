import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { createPublicClient, getAbiItem, http, hexToString } from 'npm:viem@2.38.6';

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
const MULTISIG_ADDRESS = '0x1FecF1c23dD2E8C7adF937583b345277d39bD554' as const;

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

/**
 * Multisig Plugin ABI (minimal)
 * Full ABI: config/aragon-abis.ts
 */
const MULTISIG_ABI = [
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
        internalType: 'struct IDAO.Action[]',
        name: 'actions',
        type: 'tuple[]',
      },
      { indexed: false, internalType: 'uint256', name: 'allowFailureMap', type: 'uint256' },
    ],
    name: 'ProposalCreated',
    type: 'event',
  },
] as const;

// Rate limiting: minimum 60 seconds between syncs
const MIN_SYNC_INTERVAL_MS = 60_000;

/**
 * Sanitize string for PostgreSQL text storage
 * Removes null bytes and other invalid Unicode characters
 */
function sanitizeForPostgres(str: string): string {
  // Remove null bytes and other control characters that Postgres can't store
  return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

// Ankr Public tier limit: max 1,000 blocks per getLogs request
const BLOCK_CHUNK_SIZE = BigInt(1_000);

// Max blocks to process per function invocation (to avoid timeout)
const MAX_BLOCKS_PER_CALL = BigInt(50_000);

interface ProposalData {
  proposal_id: string;  // Aragon uses 256-bit hash IDs, stored as string
  plugin_address: string;
  plugin_type: 'SPP' | 'MULTISIG';
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
  creator: string;  // Wallet address that created the proposal
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

    // Extract ProposalCreated events from ABIs
    const sppProposalCreatedEvent = getAbiItem({
      abi: STAGED_PROCESSOR_ABI,
      name: 'ProposalCreated',
    });
    const multisigProposalCreatedEvent = getAbiItem({
      abi: MULTISIG_ABI,
      name: 'ProposalCreated',
    });

    const allSppLogs: Array<any> = [];
    const allMultisigLogs: Array<any> = [];
    let currentBlock = startBlock;
    let errorCount = 0;
    const maxErrors = 10;

    // Query logs in chunks of 1000 blocks (Ankr Public tier limit)
    while (currentBlock < targetBlock && errorCount < maxErrors) {
      const toBlock =
        currentBlock + BLOCK_CHUNK_SIZE > targetBlock ? targetBlock : currentBlock + BLOCK_CHUNK_SIZE;

      try {
        // Query SPP events
        const sppLogs = await publicClient.getLogs({
          address: STAGED_PROCESSOR_ADDRESS,
          event: sppProposalCreatedEvent,
          fromBlock: currentBlock,
          toBlock,
          strict: true,
        });

        if (sppLogs.length > 0) {
          console.log(`Found ${sppLogs.length} SPP events in blocks ${currentBlock}-${toBlock}`);
          allSppLogs.push(...sppLogs);
        }

        // Query Multisig events
        const multisigLogs = await publicClient.getLogs({
          address: MULTISIG_ADDRESS,
          event: multisigProposalCreatedEvent,
          fromBlock: currentBlock,
          toBlock,
          strict: true,
        });

        if (multisigLogs.length > 0) {
          console.log(`Found ${multisigLogs.length} Multisig events in blocks ${currentBlock}-${toBlock}`);
          allMultisigLogs.push(...multisigLogs);
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

    console.log(`Found ${allSppLogs.length} SPP and ${allMultisigLogs.length} Multisig ProposalCreated events`);

    // Process new proposals
    const newProposals: ProposalData[] = [];

    // Process SPP proposals
    for (const log of allSppLogs) {
      // Keep proposalId as BigInt for contract calls, string for storage
      const proposalIdBigInt = log.args.proposalId as bigint;
      const proposalId = proposalIdBigInt.toString();  // String for DB storage (256-bit hash)
      // Get dates from event data (not contract query - contract returns 0)
      const eventStartDate = Number(log.args.startDate);
      const eventEndDate = Number(log.args.endDate);
      const eventMetadata = log.args.metadata as string;
      const eventActions = log.args.actions as Array<{ to: string; value: bigint; data: string }>;

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
          args: [proposalIdBigInt],  // Use BigInt for contract call
        });

        const sppData = sppResult as any;
        const currentStage = Number(sppData.currentStage);
        const executed = sppData.executed;
        const canceled = sppData.canceled;
        const actions = sppData.actions || [];

        // NOTE: Stage 0 filter removed - now indexing ALL proposals
        // Stage 0 = Spicy Ministers (Multisig) - waiting for approval
        // Stage 1 = Token Voting (Public voting) - public can vote

        // Get Token Voting details
        let votingDetails: any = null;
        try {
          const tvResult = await publicClient.readContract({
            address: TOKEN_VOTING_ADDRESS,
            abi: TOKEN_VOTING_ABI,
            functionName: 'getProposal',
            args: [proposalIdBigInt],  // Use BigInt for contract call
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
        let status = 'PENDING';
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
        } else if (currentStage === 0) {
          status = 'PENDING'; // Stage 0 - waiting for multisig approval
        }

        // Use event dates (from ProposalCreated event) - these are the correct values
        // Contract getProposal returns 0 for lastStageTransition on new proposals
        const startDate = new Date(eventStartDate * 1000).toISOString();
        const endDate = new Date(eventEndDate * 1000).toISOString();

        // Try to decode metadata (IPFS URL or direct content)
        let title = `PEP Proposal #${proposalId}`;
        let description = `Governance proposal with ${eventActions.length} action(s)`;
        if (eventMetadata && eventMetadata.length > 2) {
          try {
            // Metadata is hex-encoded, use viem's hexToString to decode
            const rawMetadata = hexToString(eventMetadata as `0x${string}`);
            // Sanitize to remove null bytes that Postgres can't store
            const metadataStr = sanitizeForPostgres(rawMetadata);
            // Check if it's an IPFS URL or JSON
            if (metadataStr.startsWith('ipfs://')) {
              description = metadataStr; // Store IPFS URL for later resolution
            } else if (metadataStr.startsWith('{')) {
              const metadataJson = JSON.parse(metadataStr);
              title = sanitizeForPostgres(metadataJson.title || title);
              description = sanitizeForPostgres(metadataJson.description || description);
            } else {
              // Plain text metadata
              title = sanitizeForPostgres(metadataStr.slice(0, 100) || title);
            }
          } catch (e) {
            console.log(`Could not decode metadata for proposal ${proposalId}`);
          }
        }

        const proposalData: ProposalData = {
          proposal_id: proposalId,
          plugin_address: STAGED_PROCESSOR_ADDRESS.toLowerCase(),
          plugin_type: 'SPP',
          title,
          description,
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
          creator: (log.args.creator as string).toLowerCase(),
        };

        newProposals.push(proposalData);
      } catch (e) {
        console.error(`Failed to process proposal ${proposalId}:`, e);
      }
    }

    // Process Multisig proposals
    for (const log of allMultisigLogs) {
      // Keep proposalId as BigInt for contract calls, string for storage
      const proposalIdBigInt = log.args.proposalId as bigint;
      const proposalId = proposalIdBigInt.toString();  // String for DB storage (256-bit hash)
      // Get dates from event data (not contract query - contract may return 0)
      const eventStartDate = Number(log.args.startDate);
      const eventEndDate = Number(log.args.endDate);
      const eventMetadata = log.args.metadata as string;
      const eventActions = log.args.actions as Array<{ to: string; value: bigint; data: string }>;

      // Check if proposal already exists
      const { data: existing } = await supabase
        .from('proposals')
        .select('id')
        .eq('proposal_id', proposalId)
        .eq('plugin_address', MULTISIG_ADDRESS.toLowerCase())
        .single();

      if (existing) {
        console.log(`Multisig proposal ${proposalId} already exists, skipping`);
        continue;
      }

      try {
        console.log(`Processing new Multisig proposal ${proposalId}...`);

        const msResult = await publicClient.readContract({
          address: MULTISIG_ADDRESS,
          abi: MULTISIG_ABI,
          functionName: 'getProposal',
          args: [proposalIdBigInt],  // Use BigInt for contract call
        });

        const executed = (msResult as any)[0];
        const approvals = Number((msResult as any)[1]);
        const parameters = (msResult as any)[2];
        const actions = (msResult as any)[3] || [];

        const minApprovals = Number(parameters.minApprovals);
        // Use event dates (from ProposalCreated event) - these are the correct values
        const startDate = new Date(eventStartDate * 1000).toISOString();
        const endDate = new Date(eventEndDate * 1000).toISOString();

        // Try to decode metadata (IPFS URL or direct content)
        let title = `ADMIN Proposal #${proposalId}`;
        let description = `Multisig proposal with ${eventActions.length} action(s)`;
        if (eventMetadata && eventMetadata.length > 2) {
          try {
            const rawMetadata = hexToString(eventMetadata as `0x${string}`);
            const metadataStr = sanitizeForPostgres(rawMetadata);
            if (metadataStr.startsWith('ipfs://')) {
              description = metadataStr;
            } else if (metadataStr.startsWith('{')) {
              const metadataJson = JSON.parse(metadataStr);
              title = sanitizeForPostgres(metadataJson.title || title);
              description = sanitizeForPostgres(metadataJson.description || description);
            } else {
              title = sanitizeForPostgres(metadataStr.slice(0, 100) || title);
            }
          } catch (e) {
            console.log(`Could not decode metadata for Multisig proposal ${proposalId}`);
          }
        }

        // Derive status for Multisig
        let status = 'ACTIVE';
        if (executed) {
          status = 'EXECUTED';
        } else if (Date.now() > eventEndDate * 1000) {
          status = approvals >= minApprovals ? 'SUCCEEDED' : 'DEFEATED';
        }

        const proposalData: ProposalData = {
          proposal_id: proposalId,
          plugin_address: MULTISIG_ADDRESS.toLowerCase(),
          plugin_type: 'MULTISIG',
          title,
          description,
          status,
          start_date: startDate,
          end_date: endDate,
          executed_at: executed ? new Date().toISOString() : null,
          tally_yes: '0',
          tally_no: '0',
          tally_abstain: '0',
          total_voting_power: '0',
          support_threshold: 0,
          min_participation: 0,
          min_duration: eventEndDate - eventStartDate,
          current_stage: 0,
          is_canceled: false,
          is_open: !executed && Date.now() < eventEndDate * 1000,
          actions: actions.map((a: any) => ({
            to: a.to,
            value: a.value.toString(),
            data: a.data,
          })),
          block_number: Number(log.blockNumber),
          transaction_hash: log.transactionHash,
          creator: (log.args.creator as string).toLowerCase(),
        };

        // Add multisig-specific fields
        (proposalData as any).approvals = approvals;
        (proposalData as any).min_approvals = minApprovals;

        newProposals.push(proposalData);
        console.log(`Multisig proposal ${proposalId} processed (Status: ${status})`);
      } catch (e) {
        console.error(`Failed to process Multisig proposal ${proposalId}:`, e);
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
    // Get detailed error message
    const errorMessage = error instanceof Error
      ? error.message
      : typeof error === 'object'
        ? JSON.stringify(error)
        : String(error);
    console.error('Sync error:', errorMessage, error);

    // Try to update sync state with error
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      await supabase
        .from('sync_state')
        .update({
          sync_in_progress: false,
          error_message: errorMessage.slice(0, 500),  // Truncate for DB
        })
        .eq('id', 'default');
    } catch (e) {
      console.error('Failed to update sync state with error:', e);
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
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

