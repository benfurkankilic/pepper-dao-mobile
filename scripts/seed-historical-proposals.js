/**
 * Seed Historical Proposals Script
 *
 * This script fetches historical proposals from the blockchain and inserts them into Supabase.
 * Run once to populate the database with existing proposals that were created before sync was set up.
 *
 * Usage:
 *   SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx node scripts/seed-historical-proposals.js
 *
 * Or with dotenv:
 *   node -r dotenv/config scripts/seed-historical-proposals.js
 */

const { createPublicClient, http, hexToString, getAbiItem } = require('viem');

// Supabase credentials from environment
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  SUPABASE_URL or EXPO_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Contract addresses (Pepper DAO on Chiliz)
const STAGED_PROCESSOR_ADDRESS = '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415';
const TOKEN_VOTING_ADDRESS = '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff';
const MULTISIG_ADDRESS = '0x1FecF1c23dD2E8C7adF937583b345277d39bD554';

// Historical proposals to seed
const HISTORICAL_PROPOSALS = [
  {
    id: '58239165368147564883577661335437827568316383161788826404648226987043626091928',
    type: 'SPP',
    displayId: 'PEP-0',
    address: STAGED_PROCESSOR_ADDRESS,
  },
  {
    id: '66799868001677841860451654411931268130443340490176816206954588488426265374296',
    type: 'MULTISIG',
    displayId: 'ADMIN-2',
    address: MULTISIG_ADDRESS,
  },
  {
    id: '77173798969794963145771906131201696986889064883969050521469664979485271142851',
    type: 'MULTISIG',
    displayId: 'ADMIN-1',
    address: MULTISIG_ADDRESS,
  },
  {
    id: '75132513500322177377946604650745245804416921070518263406835679832361687243635',
    type: 'MULTISIG',
    displayId: 'ADMIN-0',
    address: MULTISIG_ADDRESS,
  },
];

// ABIs
const SPP_ABI = [
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
];

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
];

const MULTISIG_ABI = [
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
];

// ProposalCreated event topics
const SPP_PROPOSAL_CREATED_TOPIC = '0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92';
const MULTISIG_PROPOSAL_CREATED_TOPIC = '0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92';

// Helpers
function sanitizeForPostgres(str) {
  return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

// Initialize viem client
const client = createPublicClient({
  transport: http('https://rpc.ankr.com/chiliz'),
});

/**
 * Find ProposalCreated event for a given proposal ID
 */
async function findProposalEvent(proposalId, contractAddress, abi) {
  const proposalIdHex = '0x' + BigInt(proposalId).toString(16).padStart(64, '0');
  const event = getAbiItem({ abi, name: 'ProposalCreated' });

  // Scan block ranges - Pepper DAO proposals are from ~Sep 2025 onwards
  // Chiliz produces ~2.5 blocks/sec, ~216K blocks/day
  const ranges = [
    [27000000n, 27500000n],
    [27500000n, 28000000n],
    [28000000n, 28500000n],
    [28500000n, 29000000n],
    [29000000n, 29500000n],
    [29500000n, 30000000n],
    [30000000n, 30500000n],
  ];

  for (const [startBlock, endBlock] of ranges) {
    console.log(`    Scanning blocks ${startBlock} - ${endBlock}...`);

    for (let from = startBlock; from < endBlock; from += 1000n) {
      const to = from + 999n > endBlock ? endBlock : from + 999n;

      try {
        const logs = await client.getLogs({
          address: contractAddress,
          event,
          fromBlock: from,
          toBlock: to,
          strict: true,
        });

        for (const log of logs) {
          if (log.args.proposalId.toString() === proposalId) {
            console.log(`    Found at block ${log.blockNumber}`);
            return log;
          }
        }
      } catch (e) {
        // Rate limit or other error, continue
      }

      await new Promise(r => setTimeout(r, 30));
    }
  }

  return null;
}

/**
 * Process SPP (Pepper Evolution Proposal)
 */
async function processSppProposal(proposalId) {
  const proposalIdBigInt = BigInt(proposalId);

  // Find the event
  const log = await findProposalEvent(proposalId, STAGED_PROCESSOR_ADDRESS, SPP_ABI);
  if (!log) {
    throw new Error(`Could not find ProposalCreated event for ${proposalId}`);
  }

  const eventStartDate = Number(log.args.startDate);
  const eventEndDate = Number(log.args.endDate);
  const eventMetadata = log.args.metadata;
  const eventActions = log.args.actions;

  // Get current state from contract
  const sppResult = await client.readContract({
    address: STAGED_PROCESSOR_ADDRESS,
    abi: SPP_ABI,
    functionName: 'getProposal',
    args: [proposalIdBigInt],
  });

  const sppData = sppResult;
  const currentStage = Number(sppData.currentStage);
  const executed = sppData.executed;
  const canceled = sppData.canceled;

  // Get Token Voting details if available
  let votingDetails = null;
  try {
    const tvResult = await client.readContract({
      address: TOKEN_VOTING_ADDRESS,
      abi: TOKEN_VOTING_ABI,
      functionName: 'getProposal',
      args: [proposalIdBigInt],
    });
    votingDetails = {
      open: tvResult[0],
      executed: tvResult[1],
      parameters: tvResult[2],
      tally: tvResult[3],
    };
  } catch (e) {
    console.log(`    No Token Voting data (stage 0)`);
  }

  // Parse metadata
  let title = `PEP Proposal`;
  let description = `Governance proposal with ${eventActions.length} action(s)`;
  if (eventMetadata && eventMetadata.length > 2) {
    try {
      const rawMetadata = hexToString(eventMetadata);
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
      console.log(`    Could not decode metadata`);
    }
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
    status = 'PENDING';
  }

  return {
    proposal_id: proposalId,
    plugin_address: STAGED_PROCESSOR_ADDRESS.toLowerCase(),
    plugin_type: 'SPP',
    title,
    description,
    status,
    start_date: new Date(eventStartDate * 1000).toISOString(),
    end_date: new Date(eventEndDate * 1000).toISOString(),
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
    actions: sppData.actions.map((a) => ({
      to: a.to,
      value: a.value.toString(),
      data: a.data,
    })),
    block_number: Number(log.blockNumber),
    transaction_hash: log.transactionHash,
  };
}

/**
 * Process Multisig (Admin) Proposal
 */
async function processMultisigProposal(proposalId) {
  const proposalIdBigInt = BigInt(proposalId);

  // Find the event
  const log = await findProposalEvent(proposalId, MULTISIG_ADDRESS, MULTISIG_ABI);
  if (!log) {
    throw new Error(`Could not find ProposalCreated event for ${proposalId}`);
  }

  const eventStartDate = Number(log.args.startDate);
  const eventEndDate = Number(log.args.endDate);
  const eventMetadata = log.args.metadata;
  const eventActions = log.args.actions;

  // Get current state from contract
  const msResult = await client.readContract({
    address: MULTISIG_ADDRESS,
    abi: MULTISIG_ABI,
    functionName: 'getProposal',
    args: [proposalIdBigInt],
  });

  const executed = msResult[0];
  const approvals = Number(msResult[1]);
  const parameters = msResult[2];
  const actions = msResult[3] || [];
  const minApprovals = Number(parameters.minApprovals);

  // Parse metadata
  let title = `ADMIN Proposal`;
  let description = `Multisig proposal with ${eventActions.length} action(s)`;
  if (eventMetadata && eventMetadata.length > 2) {
    try {
      const rawMetadata = hexToString(eventMetadata);
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
      console.log(`    Could not decode metadata`);
    }
  }

  // Derive status
  let status = 'ACTIVE';
  if (executed) {
    status = 'EXECUTED';
  } else if (Date.now() > eventEndDate * 1000) {
    status = approvals >= minApprovals ? 'SUCCEEDED' : 'DEFEATED';
  }

  return {
    proposal_id: proposalId,
    plugin_address: MULTISIG_ADDRESS.toLowerCase(),
    plugin_type: 'MULTISIG',
    title,
    description,
    status,
    start_date: new Date(eventStartDate * 1000).toISOString(),
    end_date: new Date(eventEndDate * 1000).toISOString(),
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
    actions: actions.map((a) => ({
      to: a.to,
      value: a.value.toString(),
      data: a.data,
    })),
    block_number: Number(log.blockNumber),
    transaction_hash: log.transactionHash,
    approvals,
    min_approvals: minApprovals,
  };
}

/**
 * Insert proposal into Supabase
 */
async function insertProposal(proposal) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/proposals`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(proposal),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to insert: ${error}`);
  }

  return response.json();
}

/**
 * Check if proposal already exists
 */
async function proposalExists(proposalId, pluginAddress) {
  const response = await fetch(
    `${SUPABASE_URL}/rest/v1/proposals?proposal_id=eq.${proposalId}&plugin_address=eq.${pluginAddress.toLowerCase()}&select=id`,
    {
      headers: {
        'apikey': SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    return false;
  }

  const data = await response.json();
  return data.length > 0;
}

/**
 * Main function
 */
async function main() {
  console.log('=== Seeding Historical Proposals ===\n');
  console.log(`Supabase URL: ${SUPABASE_URL}`);
  console.log(`Proposals to seed: ${HISTORICAL_PROPOSALS.length}\n`);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  for (const proposal of HISTORICAL_PROPOSALS) {
    console.log(`\nProcessing ${proposal.displayId} (${proposal.type})...`);
    console.log(`  ID: ${proposal.id}`);

    try {
      // Check if already exists
      const exists = await proposalExists(proposal.id, proposal.address);
      if (exists) {
        console.log(`  SKIPPED: Already exists in database`);
        skipCount++;
        continue;
      }

      // Fetch and process
      let proposalData;
      if (proposal.type === 'SPP') {
        proposalData = await processSppProposal(proposal.id);
      } else {
        proposalData = await processMultisigProposal(proposal.id);
      }

      console.log(`  Title: ${proposalData.title}`);
      console.log(`  Status: ${proposalData.status}`);
      console.log(`  Block: ${proposalData.block_number}`);

      // Insert into Supabase
      await insertProposal(proposalData);
      console.log(`  INSERTED successfully`);
      successCount++;

    } catch (error) {
      console.error(`  ERROR: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n=== Summary ===');
  console.log(`  Inserted: ${successCount}`);
  console.log(`  Skipped: ${skipCount}`);
  console.log(`  Errors: ${errorCount}`);
}

main().catch(console.error);
