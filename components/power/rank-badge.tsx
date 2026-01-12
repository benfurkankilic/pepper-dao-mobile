import { Text, View } from 'react-native';

import { getRankLevel, RANK_LABELS, RANK_ORDER } from '@/lib/reputation';
import type { Rank } from '@/types/user';

interface RankBadgeProps {
  rank: Rank;
  size?: 'sm' | 'md' | 'lg';
  showStars?: boolean;
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
export function RankBadge({ rank, size = 'md', showStars = true }: RankBadgeProps) {
  const level = getRankLevel(rank);
  const maxLevel = RANK_ORDER.length;
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

  return (
    <View
      className={`border-4 border-black shadow-[4px_4px_0px_#000000] ${sizeClasses[size]}`}
      style={{ backgroundColor: color }}
    >
      <Text
        className={`text-center font-['PPNeueBit-Bold'] uppercase tracking-wider text-white ${textSizeClasses[size]}`}
      >
        {RANK_LABELS[rank]}
      </Text>
      {showStars && (
        <View className="mt-1 flex-row justify-center">
          {Array.from({ length: maxLevel }).map((_, i) => (
            <Text
              key={i}
              className={`${textSizeClasses[size]} ${i < level ? 'text-yellow-300' : 'text-white/30'}`}
            >
              ★
            </Text>
          ))}
        </View>
      )}
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
