const { createPublicClient, http, hexToString } = require('viem');

// Sanitize string for PostgreSQL text storage
function sanitizeForPostgres(str) {
  return str.replace(/\u0000/g, '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

const client = createPublicClient({
  transport: http('https://rpc.ankr.com/chiliz'),
});

const sppAbi = [{
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
}];

async function test() {
  const sppAddress = '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415';

  console.log('Fetching ProposalCreated event from block 29075144...');

  const logs = await client.getLogs({
    address: sppAddress,
    event: sppAbi[0],
    fromBlock: 29075144n,
    toBlock: 29075144n,
  });

  console.log('Found', logs.length, 'events');

  if (logs.length > 0) {
    const log = logs[0];
    console.log('\\nProposal ID:', log.args.proposalId.toString());
    console.log('Start Date:', new Date(Number(log.args.startDate) * 1000).toISOString());
    console.log('End Date:', new Date(Number(log.args.endDate) * 1000).toISOString());

    const metadata = log.args.metadata;
    console.log('\\nRaw metadata (hex):', metadata);
    console.log('Metadata length:', metadata.length);

    try {
      const rawDecoded = hexToString(metadata);
      console.log('\\nRaw decoded length:', rawDecoded.length);
      console.log('Raw decoded (first 200 chars):', JSON.stringify(rawDecoded.slice(0, 200)));

      // Check for null bytes
      const hasNullBytes = rawDecoded.includes('\\u0000');
      console.log('\\nHas null bytes:', hasNullBytes);

      // Count null bytes
      const nullCount = (rawDecoded.match(/\\u0000/g) || []).length;
      console.log('Null byte count:', nullCount);

      // Sanitized version
      const sanitized = sanitizeForPostgres(rawDecoded);
      console.log('\\nSanitized length:', sanitized.length);
      console.log('Sanitized (first 200 chars):', JSON.stringify(sanitized.slice(0, 200)));

      // Try to parse as JSON
      if (sanitized.includes('{')) {
        try {
          const jsonStart = sanitized.indexOf('{');
          const jsonEnd = sanitized.lastIndexOf('}') + 1;
          const jsonStr = sanitized.slice(jsonStart, jsonEnd);
          console.log('\\nExtracted JSON:', jsonStr.slice(0, 500));
          const json = JSON.parse(jsonStr);
          console.log('\\nParsed JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('Failed to parse JSON:', e.message);
        }
      }
    } catch (e) {
      console.log('Failed to decode:', e.message);
    }

    // Check actions
    console.log('\\nActions count:', log.args.actions.length);
    log.args.actions.forEach((action, i) => {
      console.log('Action', i + 1, ':', {
        to: action.to,
        value: action.value.toString(),
        dataLength: action.data.length,
      });
    });
  }
}

test().catch(console.error);
