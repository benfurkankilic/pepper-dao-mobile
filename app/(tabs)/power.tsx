import { ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    ActivityList,
    ProfileHeader,
    ReputationCard,
    StreakCard,
    WalletSection,
} from '@/components/power';
import { ThemedView } from '@/components/themed-view';
import { FOREST_GREEN } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { useActivities } from '@/hooks/use-activities';
import { useStreaks } from '@/hooks/use-streaks';

/**
 * Power (Membership) Tab
 *
 * Shows user profile, reputation, streaks, wallet, and activity feed
 */
export default function PowerScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isLoading: isUserLoading } = useUser();
  const { activities, isLoading: isActivitiesLoading } = useActivities({
    profileId: profile?.id,
    limit: 20,
  });
  const { activeStreak } = useStreaks({ profile });

  if (isUserLoading) {
    return (
      <ThemedView className="flex-1 items-center justify-center" style={{ backgroundColor: FOREST_GREEN }}>
        <Text className="font-['PPNeueBit-Bold'] text-lg text-white">
          Loading...
        </Text>
      </ThemedView>
    );
  }

  if (!profile) {
    return (
      <ThemedView className="flex-1 items-center justify-center" style={{ backgroundColor: FOREST_GREEN }}>
        <Text className="font-['PPNeueBit-Bold'] text-lg text-white">
          Unable to load profile
        </Text>
      </ThemedView>
    );
  }

  return (
    <ThemedView className="flex-1" style={{ backgroundColor: FOREST_GREEN }}>
      <ScrollView 
        contentContainerStyle={{ 
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 24,
        }}
      >
        <View className="gap-5">
          {/* Reputation & Rank Cards */}
          <ReputationCard profile={profile} />

          {/* Progress to Next Rank */}
          <ProfileHeader profile={profile} />

          {/* Streak Card */}
          <StreakCard profile={profile} activeStreak={activeStreak} />

          {/* Wallet Section */}
          <WalletSection showStaking={true} />

          {/* Activity Feed */}
          <ActivityList activities={activities} isLoading={isActivitiesLoading} />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
