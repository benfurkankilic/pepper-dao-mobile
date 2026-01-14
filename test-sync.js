const { createPublicClient, http, hexToString, getAbiItem } = require('viem');

// Sanitize string for PostgreSQL text storage
function sanitizeForPostgres(str) {
  return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

// Check if string has null bytes
function checkForNullBytes(name, value) {
  if (typeof value === 'string') {
    const hasNull = value.includes('\u0000');
    if (hasNull) {
      console.log('  NULL BYTES FOUND in', name);
      console.log('    Value (first 100 chars):', JSON.stringify(value.slice(0, 100)));
    }
  } else if (typeof value === 'object' && value !== null) {
    for (const [k, v] of Object.entries(value)) {
      checkForNullBytes(name + '.' + k, v);
    }
  }
}

const client = createPublicClient({
  transport: http('https://rpc.ankr.com/chiliz'),
});

const STAGED_PROCESSOR_ADDRESS = '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415';
const TOKEN_VOTING_ADDRESS = '0x4D1a5e3AFe6d5bC9dfE72A8332b67C916CEb77ff';

const sppAbi = [
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

const tvAbi = [
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

async function test() {
  console.log('=== Testing SPP Proposal Sync ===\n');

  // Get event from block
  const sppProposalCreatedEvent = getAbiItem({ abi: sppAbi, name: 'ProposalCreated' });

  const logs = await client.getLogs({
    address: STAGED_PROCESSOR_ADDRESS,
    event: sppProposalCreatedEvent,
    fromBlock: 29075144n,
    toBlock: 29075144n,
    strict: true,
  });

  console.log('Found', logs.length, 'events\n');

  if (logs.length === 0) return;

  const log = logs[0];
  const proposalIdBigInt = log.args.proposalId;
  const proposalId = proposalIdBigInt.toString();
  const eventStartDate = Number(log.args.startDate);
  const eventEndDate = Number(log.args.endDate);
  const eventMetadata = log.args.metadata;
  const eventActions = log.args.actions;

  console.log('Event data:');
  console.log('  proposalId:', proposalId);
  console.log('  startDate:', new Date(eventStartDate * 1000).toISOString());
  console.log('  endDate:', eventEndDate, '-> ' + (eventEndDate > 0 ? new Date(eventEndDate * 1000).toISOString() : 'ZERO!'));
  console.log('  metadata:', eventMetadata.slice(0, 50) + '...');
  console.log('  actionsCount:', eventActions.length);
  console.log('  blockNumber:', log.blockNumber);
  console.log('  transactionHash:', log.transactionHash);

  // Get SPP contract data
  console.log('\n--- Fetching SPP contract data ---');
  const sppResult = await client.readContract({
    address: STAGED_PROCESSOR_ADDRESS,
    abi: sppAbi,
    functionName: 'getProposal',
    args: [proposalIdBigInt],
  });

  const sppData = sppResult;
  console.log('SPP data:');
  console.log('  currentStage:', Number(sppData.currentStage));
  console.log('  executed:', sppData.executed);
  console.log('  canceled:', sppData.canceled);
  console.log('  actions:', sppData.actions.length);

  // Get Token Voting data
  console.log('\n--- Fetching Token Voting data ---');
  let votingDetails = null;
  try {
    const tvResult = await client.readContract({
      address: TOKEN_VOTING_ADDRESS,
      abi: tvAbi,
      functionName: 'getProposal',
      args: [proposalIdBigInt],
    });
    votingDetails = {
      open: tvResult[0],
      executed: tvResult[1],
      parameters: tvResult[2],
      tally: tvResult[3],
      actions: tvResult[4],
    };
    console.log('Token Voting data:');
    console.log('  open:', votingDetails.open);
    console.log('  executed:', votingDetails.executed);
    console.log('  tally:', {
      yes: votingDetails.tally.yes.toString(),
      no: votingDetails.tally.no.toString(),
      abstain: votingDetails.tally.abstain.toString(),
    });
  } catch (e) {
    console.log('Token Voting fetch failed:', e.message);
  }

  // Build proposal data
  console.log('\n--- Building proposal data ---');

  const startDate = new Date(eventStartDate * 1000).toISOString();
  const endDate = new Date(eventEndDate * 1000).toISOString();

  let title = `PEP Proposal #${proposalId}`;
  let description = `Governance proposal with ${eventActions.length} action(s)`;

  if (eventMetadata && eventMetadata.length > 2) {
    try {
      const rawMetadata = hexToString(eventMetadata);
      const metadataStr = sanitizeForPostgres(rawMetadata);
      if (metadataStr.startsWith('ipfs://')) {
        description = metadataStr;
      }
    } catch (e) {
      console.log('Metadata decode failed:', e.message);
    }
  }

  // Derive status
  let status = 'PENDING';
  if (sppData.executed) {
    status = 'EXECUTED';
  } else if (sppData.canceled) {
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

  const proposalData = {
    proposal_id: proposalId,
    plugin_address: STAGED_PROCESSOR_ADDRESS.toLowerCase(),
    plugin_type: 'SPP',
    title,
    description,
    status,
    start_date: startDate,
    end_date: endDate,
    executed_at: sppData.executed ? new Date().toISOString() : null,
    tally_yes: votingDetails?.tally?.yes?.toString() || '0',
    tally_no: votingDetails?.tally?.no?.toString() || '0',
    tally_abstain: votingDetails?.tally?.abstain?.toString() || '0',
    total_voting_power: '0',
    support_threshold: votingDetails ? Number(votingDetails.parameters.supportThresholdRatio) : 0,
    min_participation: votingDetails ? Number(votingDetails.parameters.minParticipationRatio) : 0,
    min_duration: votingDetails
      ? Number(votingDetails.parameters.endDate) - Number(votingDetails.parameters.startDate)
      : 604800,
    current_stage: Number(sppData.currentStage),
    is_canceled: sppData.canceled,
    is_open: votingDetails?.open || false,
    actions: sppData.actions.map((a) => ({
      to: a.to,
      value: a.value.toString(),
      data: a.data,
    })),
    block_number: Number(log.blockNumber),
    transaction_hash: log.transactionHash,
  };

  console.log('\nFinal proposal data:');
  console.log(JSON.stringify(proposalData, null, 2));

  console.log('\n--- Checking for null bytes ---');
  checkForNullBytes('proposalData', proposalData);

  // Try to stringify with JSON (similar to what Supabase does)
  console.log('\n--- Testing JSON stringify ---');
  try {
    const json = JSON.stringify(proposalData);
    console.log('JSON stringify successful, length:', json.length);

    // Check the JSON for null bytes
    if (json.includes('\u0000') || json.includes('\\u0000')) {
      console.log('WARNING: JSON contains null bytes!');
    } else {
      console.log('JSON is clean, no null bytes');
    }
  } catch (e) {
    console.log('JSON stringify failed:', e.message);
  }

  console.log('\n=== Test Complete ===');
}

test().catch(console.error);
