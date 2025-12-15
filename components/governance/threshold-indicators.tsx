import { Text, View } from 'react-native';

import {
    basisPointsToPercentage,
    calculateCurrentSupport,
    calculateParticipation,
    isMinParticipationReached,
    isSupportThresholdReached,
} from '@/lib/voting-calculations';
import type { ProposalTally, VotingSettings } from '@/types/governance';

interface ThresholdIndicatorsProps {
  tally: ProposalTally;
  votingSettings: VotingSettings;
  totalVotingPower: string;
}

interface ThresholdBarProps {
  label: string;
  current: number;
  threshold: number;
  isReached: boolean;
}

function ThresholdBar(props: ThresholdBarProps) {
  const { label, current, threshold, isReached } = props;
  
  const percentage = Math.min((current / threshold) * 100, 100);
  const barColor = isReached ? '#00FF80' : '#FFEA00';

  return (
    <View className="mb-4">
      {/* Header with label and checkmark */}
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Text className="text-[11px] font-bold text-white">
            {label}
          </Text>
          {isReached ? (
            <Text className="text-[14px] text-[#00FF80]">✓</Text>
          ) : null}
        </View>
        <Text className="text-[11px] font-bold text-white">
          {percentage.toFixed(0)}%
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="h-6 border-4 border-white bg-black">
        <View
          style={{
            width: `${percentage}%`,
            backgroundColor: barColor,
            height: '100%',
          }}
        />
      </View>

      {/* Stats */}
      <View className="mt-1 flex-row items-center justify-between">
        <Text className="text-[10px] text-white/80">
          {current.toFixed(0)} of {threshold.toFixed(0)} required
        </Text>
        <Text className="text-[10px] text-white/80">
          {isReached ? '100%' : `${percentage.toFixed(0)}%`}
        </Text>
      </View>
    </View>
  );
}

export function ThresholdIndicators(props: ThresholdIndicatorsProps) {
  const { tally, votingSettings, totalVotingPower } = props;

  if (!tally || !votingSettings || !totalVotingPower) {
    return null;
  }

  // Calculate support (yes / (yes + no))
  const currentSupportBP = calculateCurrentSupport(tally);
  const currentSupportPercent = basisPointsToPercentage(currentSupportBP);
  const requiredSupportPercent = basisPointsToPercentage(votingSettings.supportThreshold);
  const supportReached = isSupportThresholdReached(tally, votingSettings);

  // Calculate participation ((yes + no + abstain) / total)
  const currentParticipationBP = calculateParticipation(tally, totalVotingPower);
  const currentParticipationPercent = basisPointsToPercentage(currentParticipationBP);
  const requiredParticipationPercent = basisPointsToPercentage(votingSettings.minParticipation);
  const participationReached = isMinParticipationReached(
    tally,
    totalVotingPower,
    votingSettings,
  );

  return (
    <View className="p-4">
      <ThresholdBar
        label="Support reached"
        current={currentSupportPercent}
        threshold={requiredSupportPercent}
        isReached={supportReached}
      />

      <ThresholdBar
        label="Minimum participation reached"
        current={currentParticipationPercent}
        threshold={requiredParticipationPercent}
        isReached={participationReached}
      />
    </View>
  );
}
