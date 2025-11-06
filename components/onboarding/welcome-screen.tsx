import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useWalletActions } from '@/hooks/use-wallet-actions';

interface WelcomeScreenProps {
  onComplete: (action: 'explore' | 'connect') => void;
}

/**
 * Retro-styled onboarding welcome screen
 * Shows intro and CTAs for exploring or connecting wallet
 */
export function WelcomeScreen({ onComplete }: WelcomeScreenProps) {
  const { connectWallet } = useWalletActions();

  const handleExplore = useCallback(() => {
    onComplete('explore');
    // Navigate to main app
    router.replace('/(tabs)');
  }, [onComplete]);

  const handleConnect = useCallback(async () => {
    try {
      await connectWallet();
      onComplete('connect');
      router.replace('/(tabs)');
    } catch (error) {
      // If connection fails, still let them explore
      console.error('Connection failed during onboarding:', error);
      handleExplore();
    }
  }, [connectWallet, onComplete, handleExplore]);

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="flex-1 p-6 justify-center min-h-screen">
        {/* Title Section */}
        <View className="items-center mb-12">
          <View className="border-4 border-[#FF006E] bg-[#8000FF] p-6 shadow-[6px_6px_0px_#FF006E] mb-6">
            <Text className="font-bold text-4xl text-white uppercase tracking-wider text-center">
              PEPPER
            </Text>
            <Text className="font-bold text-4xl text-[#00FF80] uppercase tracking-wider text-center">
              DAO
            </Text>
          </View>
          
          <Text className="font-bold text-xl text-white uppercase tracking-wider text-center mb-2">
            WELCOME PLAYER
          </Text>
          <Text className="text-sm text-[#00FF80] uppercase tracking-wide text-center">
            LEVEL 1 • MISSION START
          </Text>
        </View>

        {/* Info Cards */}
        <View className="space-y-4 mb-12">
          <View className="border-4 border-white bg-[#1a1a1a] p-5 shadow-[4px_4px_0px_#FFFFFF]">
            <Text className="font-bold text-lg text-[#00FF80] uppercase tracking-wider mb-3">
              🎮 EXPLORE FREELY
            </Text>
            <Text className="text-white text-base leading-6">
              Browse proposals, check treasury stats, and discover what Pepper DAO is all about.
              No wallet needed to explore!
            </Text>
          </View>

          <View className="border-4 border-white bg-[#1a1a1a] p-5 shadow-[4px_4px_0px_#FFFFFF]">
            <Text className="font-bold text-lg text-[#FF006E] uppercase tracking-wider mb-3">
              🗳️ CONNECT TO VOTE
            </Text>
            <Text className="text-white text-base leading-6">
              Connect your wallet to vote on proposals, stake PEPPER tokens, and participate in
              governance decisions.
            </Text>
          </View>

          <View className="border-4 border-white bg-[#1a1a1a] p-5 shadow-[4px_4px_0px_#FFFFFF]">
            <Text className="font-bold text-lg text-[#0080FF] uppercase tracking-wider mb-3">
              🏆 EARN REWARDS
            </Text>
            <Text className="text-white text-base leading-6">
              Stake your tokens, participate in governance, and earn rewards for being an active DAO
              member.
            </Text>
          </View>
        </View>

        {/* CTA Buttons */}
        <View className="space-y-4 mb-8">
          {/* Primary CTA - Explore */}
          <Pressable
            onPress={handleExplore}
            className="bg-[#00FF80] border-4 border-white px-8 py-5 shadow-[6px_6px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Text className="font-bold text-xl text-black uppercase tracking-wider text-center">
              ▶ START EXPLORING
            </Text>
          </Pressable>

          {/* Secondary CTA - Connect */}
          <Pressable
            onPress={handleConnect}
            className="bg-[#FF006E] border-4 border-white px-8 py-5 shadow-[6px_6px_0px_#000000] active:shadow-none active:translate-x-1 active:translate-y-1"
          >
            <Text className="font-bold text-xl text-white uppercase tracking-wider text-center">
              🔗 CONNECT WALLET
            </Text>
          </Pressable>
        </View>

        {/* Footer Info */}
        <View className="border-3 border-[#808080] bg-[#0a0a0a] p-4">
          <Text className="text-[#808080] text-xs uppercase tracking-wide text-center">
            You can connect your wallet anytime from settings
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

