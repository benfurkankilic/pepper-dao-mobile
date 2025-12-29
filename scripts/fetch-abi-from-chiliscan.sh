#!/bin/bash

# Script to fetch ABIs from Chiliscan API
# Usage: ./scripts/fetch-abi-from-chiliscan.sh

echo "📥 Fetching Aragon Contract ABIs from Chiliscan..."
echo ""

# Staged Processor Implementation
echo "1️⃣ Fetching Staged Processor ABI..."
echo "   Contract: 0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135"

curl -s "https://api.chiliscan.com/api?module=contract&action=getabi&address=0xfca5b9bbe4f2a8b1bbcc0a6b32e9df53c6b7c135" \
  | jq -r '.result' \
  > /tmp/staged-processor-abi.json

if [ -s /tmp/staged-processor-abi.json ]; then
  echo "   ✅ Saved to: /tmp/staged-processor-abi.json"
else
  echo "   ❌ Failed to fetch ABI"
fi

echo ""

# Token Voting Implementation
echo "2️⃣ Fetching Token Voting ABI..."
echo "   Contract: 0xf1b3ed4f41509f1661def5518d198e0b0257ffe1"

curl -s "https://api.chiliscan.com/api?module=contract&action=getabi&address=0xf1b3ed4f41509f1661def5518d198e0b0257ffe1" \
  | jq -r '.result' \
  > /tmp/token-voting-abi.json

if [ -s /tmp/token-voting-abi.json ]; then
  echo "   ✅ Saved to: /tmp/token-voting-abi.json"
else
  echo "   ❌ Failed to fetch ABI"
fi

echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Open the JSON files:"
echo "   - Staged Processor: /tmp/staged-processor-abi.json"
echo "   - Token Voting: /tmp/token-voting-abi.json"
echo ""
echo "2. Copy the ABI arrays into config/aragon-abis.ts:"
echo "   - Replace STAGED_PROCESSOR_ABI"
echo "   - Replace TOKEN_VOTING_ABI"
echo ""
echo "3. Verify the ABIs work:"
echo "   npm run test:abi-connection"
echo ""
