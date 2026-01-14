import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { getNextStreakMilestone } from '@/lib/reputation';
import { formatStreakWeeks, getStreakProgress, getStreakStatusMessage } from '@/lib/streaks';
import type { Profile, Streak } from '@/types/user';

interface StreakCardProps {
  profile: Profile;
  activeStreak: Streak | null;
}

/**
 * Streak Card Component
 *
 * Displays current streak, progress, and next milestone
 */
export function StreakCard({ profile, activeStreak }: StreakCardProps) {
  const progress = getStreakProgress(profile.current_streak_weeks);
  const statusMessage = getStreakStatusMessage(profile);
  const nextMilestone = getNextStreakMilestone(profile.current_streak_weeks);
  const isActive = profile.current_streak_weeks > 0;

  return (
    <Card variant="default" className="p-4">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#F59E0B]">
          Current Streak
        </Text>
        {profile.longest_streak_weeks > 0 && (
          <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/60">
            Best: {formatStreakWeeks(profile.longest_streak_weeks)}
          </Text>
        )}
      </View>

      {/* Streak Display */}
      <View className="mb-3 flex-row items-center gap-3">
        <Text className="text-3xl">{isActive ? '🔥' : '❄️'}</Text>
        <View>
          <Text className="font-['PPNeueBit-Bold'] text-2xl text-[#1A2A22]">
            {formatStreakWeeks(profile.current_streak_weeks)}
          </Text>
          {isActive && activeStreak && (
            <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/60">
              Started {new Date(activeStreak.start_date).toLocaleDateString()}
            </Text>
          )}
        </View>
      </View>

      {/* Progress Bar */}
      {nextMilestone && (
        <View className="mb-2">
          <View className="h-3 w-full overflow-hidden border-2 border-black/20 bg-[#E5E5E5]">
            <View
              className="h-full bg-[#F59E0B]"
              style={{ width: `${progress}%` }}
            />
          </View>
          <View className="mt-1 flex-row justify-between">
            <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/60">
              {profile.current_streak_weeks}w
            </Text>
            <Text className="font-['PPNeueBit-Bold'] text-xs text-[#F59E0B]">
              {nextMilestone.weeks}w (+{nextMilestone.points} pts)
            </Text>
          </View>
        </View>
      )}

      {/* Status Message */}
      <Text className="font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/80">
        {statusMessage}
      </Text>
    </Card>
  );
}

/**
 * Compact streak indicator
 */
export function StreakIndicator({ weeks }: { weeks: number }) {
  const isActive = weeks > 0;

  return (
    <View className="flex-row items-center gap-1">
      <Text>{isActive ? '🔥' : '❄️'}</Text>
      <Text className="font-['PPNeueBit-Bold'] text-xs text-white">
        {weeks}w
      </Text>
    </View>
  );
}
