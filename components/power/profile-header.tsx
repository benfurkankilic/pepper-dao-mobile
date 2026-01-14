import { Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { getRankDisplay, RANK_LABELS, RANK_REQUIREMENTS } from '@/lib/reputation';
import type { Profile, Rank } from '@/types/user';

interface ProfileHeaderProps {
  profile: Profile;
}

interface RankTask {
  label: string;
  completed: boolean;
}

/**
 * Get tasks needed to reach next rank
 */
function getNextRankTasks(profile: Profile, nextRank: Rank): Array<RankTask> {
  const requirements = RANK_REQUIREMENTS[nextRank];
  const tasks: Array<RankTask> = [];

  if (requirements.requiresWallet) {
    tasks.push({
      label: 'Connect wallet',
      completed: !!profile.wallet_address,
    });
  }

  if (requirements.points > 0) {
    tasks.push({
      label: `Earn ${requirements.points} reputation pts`,
      completed: profile.reputation_points >= requirements.points,
    });
  }

  if (requirements.requiresVote) {
    tasks.push({
      label: 'Vote on a proposal',
      completed: profile.reputation_points >= 10, // Assume voted if has any points
    });
  }

  if (requirements.requiresStreak > 0) {
    tasks.push({
      label: `Maintain ${requirements.requiresStreak}-week streak`,
      completed: profile.current_streak_weeks >= requirements.requiresStreak,
    });
  }

  if (requirements.requiresEngagedProposal) {
    tasks.push({
      label: 'Submit a proposal that gets engagement',
      completed: false, // Would need to check proposal history
    });
  }

  if (requirements.requiresPassedProposal) {
    tasks.push({
      label: 'Get a proposal passed',
      completed: false, // Would need to check proposal history
    });
  }

  return tasks;
}

/**
 * Profile Header Component
 *
 * Displays progress to next rank with tasks
 */
export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const rankDisplay = getRankDisplay(profile);

  // Don't show header if already at max rank
  if (!rankDisplay.nextRank) {
    return (
      <Card variant="default" className="p-4">
        <View className="items-center">
          <Text className="font-['PPNeueBit-Bold'] text-sm text-[#B8860B]">
            🏆 Maximum Rank Achieved!
          </Text>
        </View>
      </Card>
    );
  }

  const tasks = getNextRankTasks(profile, rankDisplay.nextRank);
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <Card variant="default" className="p-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#B8860B]">
          Next Rank
        </Text>
        <Text className="font-['PPNeueBit-Bold'] text-sm text-[#1A2A22]">
          {RANK_LABELS[rankDisplay.nextRank]}
        </Text>
      </View>

      {/* Progress Bar */}
      <View className="mt-3 h-4 w-full overflow-hidden border-2 border-black bg-[#E5E5E5]">
        <View
          className="h-full bg-[#FFD700]"
          style={{ width: `${progressPercent}%` }}
        />
      </View>

      <Text className="mt-2 font-['PPNeueBit-Bold'] text-xs text-[#1A2A22]/60">
        {completedTasks}/{tasks.length} completed
      </Text>

      {/* Task List */}
      <View className="mt-3">
        <Text className="font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#1A2A22]/60">
          Tasks
        </Text>
        <View className="gap-2">
          {tasks.map((task, index) => (
          <View key={index} className="flex-row items-center gap-2">
            <Text className={`text-sm ${task.completed ? 'text-[#10B981]' : 'text-[#1A2A22]/40'}`}>
              {task.completed ? '✓' : '○'}
            </Text>
            <Text
              className={`flex-1 font-['PPNeueBit-Bold'] text-xs ${
                task.completed ? 'text-[#1A2A22]/40 line-through' : 'text-[#1A2A22]'
              }`}
            >
              {task.label}
            </Text>
          </View>
        ))}
        </View>
      </View>
    </Card>
  );
}
