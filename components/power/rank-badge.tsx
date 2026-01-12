import { Image, Text, View } from 'react-native';

import { RANK_IMAGES } from '@/lib/rank-images';
import { getRankLevel, RANK_LABELS } from '@/lib/reputation';
import type { Rank } from '@/types/user';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showImage?: boolean;
}

/**
 * Get rank color
 */
function getRankColor(rank: Rank): string {
  switch (rank) {
    case 'OBSERVER':
      return '#6B7280'; // Gray
    case 'MEMBER':
      return '#10B981'; // Green
    case 'PARTICIPANT':
      return '#3B82F6'; // Blue
    case 'STEWARD':
      return '#8B5CF6'; // Purple
    case 'INITIATOR':
      return '#F59E0B'; // Amber
    case 'GOVERNOR':
      return '#EF4444'; // Red/Gold
    default:
      return '#6B7280';
  }
}

/**
 * Rank Badge Component
 */
export function RankBadge({ rank, size = 'md', showImage = true }: RankBadgeProps) {
  const color = getRankColor(rank);

  const sizeClasses = {
    sm: 'px-2 py-1',
    md: 'px-4 py-2',
    lg: 'px-5 py-3',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const imageSizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  return (
    <View
      className={`items-center border-4 border-black shadow-[4px_4px_0px_#000000] ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      {showImage && (
        <Image
          source={RANK_IMAGES[rank]}
          style={{ width: imageSizes[size], height: imageSizes[size], marginBottom: 4 }}
          resizeMode="contain"
        />
      )}
      <Text
        className={`text-center font-['PPNeueBit-Bold'] uppercase tracking-wider text-white ${textSizeClasses[size]}`}
      >
        {RANK_LABELS[rank]}
      </Text>
    </View>
  );
}

/**
 * Compact rank indicator
 */
export function RankIndicator({ rank }: { rank: Rank }) {
  const color = getRankColor(rank);
  const level = getRankLevel(rank);

  return (
    <View className="flex-row items-center gap-1">
      <View
        className="h-3 w-3 rounded-full border-2 border-black"
        style={{ backgroundColor: color }}
      />
      <Text className="font-['PPNeueBit-Bold'] text-xs text-white">
        Lv.{level}
      </Text>
    </View>
  );
}
