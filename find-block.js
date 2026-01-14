const { createPublicClient, http, toHex } = require('viem');

const client = createPublicClient({
  transport: http('https://rpc.ankr.com/chiliz'),
});

// ProposalCreated event topic (keccak256 of event signature)
const PROPOSAL_CREATED_TOPIC = '0xa6c1f8f4276dc3f243459e13b557c84e8f4e90b2e09070bad5f6909cee687c92';

async function findProposalBlock() {
  const sppAddress = '0x8d639bd52301D7265Ebd1E6d4B0813f1CF190415';
  const proposalId = 58239165368147564883577661335437827568316383161788826404648226987043626091928n;
  const proposalIdHex = '0x' + proposalId.toString(16).padStart(64, '0');

  console.log('Looking for PEP-0 proposal');
  console.log('Contract:', sppAddress);
  console.log('Proposal ID (hex):', proposalIdHex);

  const latestBlock = await client.getBlockNumber();
  console.log('Latest block:', latestBlock.toString());

  // Binary search to find the block - scan from expected range
  // User said first proposal is Sep 25, 2025 - let's scan around that
  // We're at 30.5M now (Jan 13, 2026), Sep 25 is ~110 days = ~3M blocks back = ~27.5M

  const ranges = [
    [29000000n, 29100000n],
    [29100000n, 29200000n],
    [29200000n, 29300000n],
  ];

  for (const [startBlock, endBlock] of ranges) {
    console.log('\nScanning ' + startBlock + ' to ' + endBlock + '...');

    for (let from = startBlock; from < endBlock; from += 1000n) {
      const to = from + 999n > endBlock ? endBlock : from + 999n;

      try {
        const logs = await client.request({
          method: 'eth_getLogs',
          params: [{
            address: sppAddress,
            topics: [PROPOSAL_CREATED_TOPIC, proposalIdHex],
            fromBlock: '0x' + from.toString(16),
            toBlock: '0x' + to.toString(16),
          }],
        });

        if (logs.length > 0) {
          console.log('\n*** FOUND! ***');
          console.log('Block:', parseInt(logs[0].blockNumber, 16));
          console.log('Transaction:', logs[0].transactionHash);
          return;
        }
      } catch (e) {
        // Ignore errors
      }

      await new Promise(r => setTimeout(r, 30));
    }
  }

  console.log('\nNot found in scanned range');
}

findProposalBlock();
