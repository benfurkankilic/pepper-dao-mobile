import { Pressable, Text, View } from 'react-native';

import { useRouter } from 'expo-router';

import {
    basisPointsToPercentage,
    calculateCurrentSupport,
    calculateParticipation,
    getVoteDistribution,
} from '@/lib/voting-calculations';
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

interface VotingPreviewProps {
  proposal: GovernanceProposal;
}

function VotingPreview(props: VotingPreviewProps) {
  const { proposal } = props;

  if (!proposal.tally || !proposal.votingSettings || !proposal.totalVotingPower) {
    return null;
  }

  const distribution = getVoteDistribution(proposal.tally);
  const supportPercent = basisPointsToPercentage(
    calculateCurrentSupport(proposal.tally),
  );
  const participationPercent = basisPointsToPercentage(
    calculateParticipation(proposal.tally, proposal.totalVotingPower),
  );

  return (
    <View className="mt-2 border-t-2 border-white/20 pt-2">
      {/* Mini Progress Bar */}
      <View className="mb-1 h-2 flex-row border-2 border-white/40">
        {distribution.yes > 0 ? (
          <View
            style={{
              width: `${distribution.yes}%`,
              backgroundColor: '#00FF80',
              height: '100%',
            }}
          />
        ) : null}
        {distribution.abstain > 0 ? (
          <View
            style={{
              width: `${distribution.abstain}%`,
              backgroundColor: '#6B7280',
              height: '100%',
            }}
          />
        ) : null}
        {distribution.no > 0 ? (
          <View
            style={{
              width: `${distribution.no}%`,
              backgroundColor: '#FF006E',
              height: '100%',
            }}
          />
        ) : null}
      </View>

      {/* Stats */}
      <View className="flex-row items-center gap-3">
        <Text className="text-[9px] text-white/60">
          {supportPercent.toFixed(0)}% Support
        </Text>
        <Text className="text-[9px] text-white/60">•</Text>
        <Text className="text-[9px] text-white/60">
          {participationPercent.toFixed(0)}% Participation
        </Text>
      </View>
    </View>
  );
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
          {proposal.type === 'ADMIN' ? (
            <Text className="text-[10px] text-white/80">Admin</Text>
          ) : proposal.type === 'PEP' ? (
            <Text className="text-[10px] text-white/80">Community</Text>
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

      {/* Voting Preview */}
      <VotingPreview proposal={proposal} />
    </Pressable>
  );
}


