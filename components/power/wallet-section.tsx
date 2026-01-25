import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { StakeModal } from '@/components/staking';
import { Card } from '@/components/ui/card';
import { NetworkMismatchWarning, WalletConnectButton, WalletStatusPill } from '@/components/wallet';
import { useWallet } from '@/contexts/wallet-context';
import { useStaking } from '@/hooks/use-staking';

/**
 * Wallet Section Component
 *
 * Displays wallet connection status and staking button
 */
export function WalletSection() {
  const { isConnected, isWrongNetwork, disconnect, switchToChiliz } = useWallet();
  const { formattedStakedBalance, isLoading: isStakingLoading } = useStaking();
  const [showStakeModal, setShowStakeModal] = useState(false);

  const stakedAmount = parseFloat(formattedStakedBalance) || 0;
  const hasStaked = stakedAmount > 0;

  async function handleDisconnect() {
    try {
      await disconnect();
      Alert.alert('Disconnected', 'Wallet disconnected successfully');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to disconnect');
    }
  }

  function handleOpenStakeModal() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowStakeModal(true);
  }

  return (
    <>
      <Card variant="dark" className="p-4">
        <Text className="mb-3 font-['PPNeueBit-Bold'] text-xs uppercase tracking-wider text-[#00FF80]">
          Wallet
        </Text>

        <WalletStatusPill />

        {isWrongNetwork && (
          <View className="mt-3">
            <NetworkMismatchWarning />
          </View>
        )}

        <View className="mt-4 gap-2">
          {!isConnected && <WalletConnectButton />}

          {isConnected && !isWrongNetwork && (
            <Pressable
              onPress={handleOpenStakeModal}
              className="flex-row items-center justify-center border-4 border-black bg-[#FFC043] px-4 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Text className="font-['PPNeueBit-Bold'] text-sm uppercase text-black">
                {hasStaked ? 'Manage Stake' : 'Stake PEPPER'}
              </Text>
              <View className="absolute bottom-0 right-4 top-0 flex-row items-center">
                {isStakingLoading ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text className="font-['PPNeueBit-Bold'] text-xs text-black/60">
                    {stakedAmount.toLocaleString(undefined, { maximumFractionDigits: 0 })} Staked
                  </Text>
                )}
              </View>
            </Pressable>
          )}

          {isConnected && (
            <Pressable
              onPress={handleDisconnect}
              className="border-4 border-black bg-[#FF006E] px-4 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase text-white">
                Disconnect
              </Text>
            </Pressable>
          )}

          {isWrongNetwork && (
            <Pressable
              onPress={switchToChiliz}
              className="border-4 border-black bg-[#0080FF] px-4 py-3 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase text-white">
                Switch Network
              </Text>
            </Pressable>
          )}
        </View>
      </Card>

      {/* Stake Modal */}
      <StakeModal visible={showStakeModal} onClose={() => setShowStakeModal(false)} />
    </>
  );
}
