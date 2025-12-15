import { Text, View } from 'react-native';

import { formatVotingPower, getVoteDistribution } from '@/lib/voting-calculations';
import type { ProposalTally } from '@/types/governance';

interface VotingBreakdownProps {
  tally: ProposalTally;
  totalVotingPower?: string;
}

interface VoteOptionCardProps {
  label: string;
  votes: string;
  percentage: number;
  color: string;
  totalVotingPower?: string;
}

function VoteOptionCard(props: VoteOptionCardProps) {
  const { label, votes, percentage, color, totalVotingPower } = props;
  
  const formattedVotes = totalVotingPower 
    ? formatVotingPower(votes)
    : '0 CTV';

  return (
    <View className="mb-3">
      {/* Header */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-[11px] font-bold uppercase tracking-wider text-white">
          {label}
        </Text>
        <Text className="text-[11px] font-bold text-white">
          {percentage.toFixed(1)}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-8 border-4 border-white bg-black">
        <View
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
            height: '100%',
          }}
        />
      </View>

      {/* Vote Count */}
      <View className="mt-1">
        <Text className="text-[10px] text-white/80">
          {formattedVotes}
        </Text>
      </View>
    </View>
  );
}

export function VotingBreakdown(props: VotingBreakdownProps) {
  const { tally, totalVotingPower } = props;

  if (!tally) {
    return (
      <View className="p-4">
        <Text className="text-center text-[12px] text-white/60">
          No voting data available
        </Text>
      </View>
    );
  }

  const distribution = getVoteDistribution(tally);

  return (
    <View className="p-4">
      {/* Title */}
      <Text className="mb-4 text-[12px] font-bold uppercase tracking-wider text-white">
        Voting Breakdown
      </Text>

      {/* Vote Options */}
      <VoteOptionCard
        label="Yes to approve"
        votes={tally.yes}
        percentage={distribution.yes}
        color="#00FF80"
        totalVotingPower={totalVotingPower}
      />

      <VoteOptionCard
        label="Abstain"
        votes={tally.abstain}
        percentage={distribution.abstain}
        color="#6B7280"
        totalVotingPower={totalVotingPower}
      />

      <VoteOptionCard
        label="No to approve"
        votes={tally.no}
        percentage={distribution.no}
        color="#FF006E"
        totalVotingPower={totalVotingPower}
      />
    </View>
  );
}
