import { Image, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { RANK_IMAGES } from '@/lib/rank-images';
import { RANK_LABELS } from '@/lib/reputation';
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
  return (
    <View className="flex-row gap-3">
      {/* Rank */}
      <Card variant="default" className="flex-1 flex-row items-center gap-3 p-3">
        <Image
          source={RANK_IMAGES[profile.rank]}
          style={{ width: 48, height: 48 }}
          resizeMode="contain"
        />
        <View>
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#8B5CF6]">
            Rank
          </Text>
          <Text className="font-['PPNeueBit-Bold'] text-xl text-[#1A2A22]">
            {RANK_LABELS[profile.rank]}
          </Text>
        </View>
      </Card>

      {/* Reputation */}
      <Card variant="default" className="flex-1 items-center justify-center p-3">
        <Text className="font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#1E4F3A]">
          Reputation
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-3xl text-[#1A2A22]">
          {profile.reputation_points.toLocaleString()}
        </Text>
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
