import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { getRankDisplay, RANK_LABELS } from '@/lib/reputation';
import type { Profile } from '@/types/user';

interface ReputationCardProps {
  profile: Profile;
}

/**
 * Reputation Card Component
 *
 * Displays reputation points and rank side by side
 */
export function ReputationCard({ profile }: ReputationCardProps) {
  const rankDisplay = getRankDisplay(profile);

  return (
    <View className="flex-row gap-3">
      {/* Reputation Points */}
      <Card variant="dark" className="flex-1 p-4">
        <Text className="mb-1 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#00FF80]">
          Reputation
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-3xl text-white">
          {profile.reputation_points.toLocaleString()}
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-xs text-white/60">
          points
        </Text>
      </Card>

      {/* Rank */}
      <Card variant="dark" className="flex-1 p-4">
        <Text className="mb-1 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#8B5CF6]">
          Rank
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-2xl text-white">
          {RANK_LABELS[profile.rank]}
        </Text>
        <View className="mt-1 flex-row">
          {Array.from({ length: rankDisplay.maxLevel }).map((_, i) => (
            <Text
              key={i}
              className={`text-sm ${i < rankDisplay.level ? 'text-yellow-400' : 'text-white/20'}`}
            >
              ★
            </Text>
          ))}
        </View>
      </Card>
    </View>
  );
}

/**
 * Compact reputation display
 */
export function ReputationBadge({ points }: { points: number }) {
  return (
    <View className="flex-row items-center gap-1 border-2 border-[#00FF80] bg-[#00FF80]/20 px-2 py-1">
      <Text className="font-['PPNeueBit-Bold'] text-xs text-[#00FF80]">
        {points.toLocaleString()} REP
      </Text>
    </View>
  );
}
