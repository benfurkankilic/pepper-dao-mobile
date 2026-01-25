import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

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
import { useWallet } from '@/contexts/wallet-context';
import { useActivities } from '@/hooks/use-activities';
import { useStreaks } from '@/hooks/use-streaks';
import { clearAppKitStorage } from '@/config/appkit-storage';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';

/**
 * Power (Membership) Tab
 *
 * Shows user profile, reputation, streaks, wallet, and activity feed
 */
export default function PowerScreen() {
  const insets = useSafeAreaInsets();
  const { profile, isLoading: isUserLoading } = useUser();
  const { disconnect } = useWallet();
  const { activities, isLoading: isActivitiesLoading } = useActivities({
    profileId: profile?.id,
    limit: 20,
  });
  const { activeStreak } = useStreaks({ profile });

  async function handleResetWalletState() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    try {
      // Disconnect from AppKit
      await disconnect();

      // Clear all wallet-related storage
      StorageService.removeMultiple([
        STORAGE_KEYS.WALLET_SESSION,
        STORAGE_KEYS.WALLET_PROVIDER_TYPE,
        STORAGE_KEYS.WALLET_CONNECTED_AT,
      ]);

      // Clear AppKit/WalletConnect storage
      await clearAppKitStorage();

      console.log('[DEBUG] Wallet state reset complete');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('[DEBUG] Failed to reset wallet state:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

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

          {/* Debug Section - Only in DEV mode */}
          {__DEV__ && (
            <View className="mt-4 border-2 border-dashed border-white/30 p-4">
              <Text className="mb-3 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-white/50">
                Debug Tools
              </Text>
              <Pressable
                onPress={handleResetWalletState}
                className="border-2 border-[#FF006E] bg-[#330011] px-4 py-3 active:opacity-70"
              >
                <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase text-[#FF006E]">
                  Reset Wallet State
                </Text>
              </Pressable>
              <Text className="mt-2 text-center text-[10px] text-white/40">
                Clears all wallet connection data
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
