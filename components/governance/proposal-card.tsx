import { Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import type { GovernanceProposal } from '@/types/governance';

import { ProposalStatusPill } from './proposal-status-pill';

interface ProposalCardProps {
  proposal: GovernanceProposal;
  onPress?: () => void;
}

function shortenAddress(address: string): string {
  if (address.length <= 10) {
    return address;
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getSecondaryLabel(proposal: GovernanceProposal): string {
  if (proposal.timeLabel) {
    return proposal.timeLabel;
  }

  const date = new Date(proposal.createdAt);
  return date.toLocaleDateString();
}

export function ProposalCard(props: ProposalCardProps) {
  const { proposal, onPress } = props;
  const router = useRouter();

  function handlePress() {
    if (onPress) {
      onPress();
      return;
    }

    router.push({
      pathname: '/governance/[proposalId]',
      params: { proposalId: proposal.id },
    });
  }

  return (
    <Pressable
      onPress={handlePress}
      className="border-4 border-white bg-[#111827] p-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <ProposalStatusPill status={proposal.status} />
          {proposal.stageLabel ? (
            <Text className="text-[10px] text-white/80">
              {proposal.stageLabel}
            </Text>
          ) : null}
        </View>

        <Text className="text-[10px] text-white/80">
          {getSecondaryLabel(proposal)}
        </Text>
      </View>

      <View className="mb-1 flex-row items-baseline gap-2">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-[#FFEA00]">
          {proposal.key}
        </Text>
        <Text className="flex-1 text-[13px] font-bold text-white">
          {proposal.title}
        </Text>
      </View>

      <Text className="mb-2 text-[11px] text-white/80">
        {proposal.description}
      </Text>

      <Text className="text-[10px] text-white/60">
        by {shortenAddress(proposal.proposer)}
      </Text>
    </Pressable>
  );
}


