/**
 * Stake Modal Component
 *
 * Modal for PEPPER token staking operations.
 */

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';

import { getExplorerTxUrl } from '@/config/chains';
import { useStaking } from '@/hooks/use-staking';

import { StakeInput } from './stake-input';

interface StakeModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'stake' | 'unstake';

export function StakeModal({ visible, onClose }: StakeModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const {
    isLoading,
    txStatus,
    txError,
    formattedWalletBalance,
    formattedStakedBalance,
    formattedEarnedRewards,
    canStake,
    canUnstake,
    canClaim,
    needsApproval,
    approve,
    stake,
    unstake,
    claim,
  } = useStaking();

  const isPending = txStatus === 'pending';

  function handleClose() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStakeAmount('');
    setUnstakeAmount('');
    setLastTxHash(null);
    onClose();
  }

  async function handleTabChange(tab: TabType) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  }

  async function handleApprove() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await approve(stakeAmount);
    if (result.txHash) {
      setLastTxHash(result.txHash);
    }
  }

  async function handleStake() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await stake(stakeAmount);
    if (result.success) {
      setStakeAmount('');
      if (result.txHash) {
        setLastTxHash(result.txHash);
      }
    }
  }

  async function handleUnstake() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await unstake(unstakeAmount);
    if (result.success) {
      setUnstakeAmount('');
      if (result.txHash) {
        setLastTxHash(result.txHash);
      }
    }
  }

  async function handleClaim() {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await claim();
    if (result.txHash) {
      setLastTxHash(result.txHash);
    }
  }

  async function handleViewTransaction() {
    if (lastTxHash) {
      const url = getExplorerTxUrl(lastTxHash);
      await Linking.openURL(url);
    }
  }

  // Validation
  const stakeAmountNum = parseFloat(stakeAmount) || 0;
  const showApproveButton = stakeAmountNum > 0 && needsApproval(stakeAmount);
  const canDoStake = stakeAmountNum > 0 && canStake(stakeAmount);
  const unstakeAmountNum = parseFloat(unstakeAmount) || 0;
  const canDoUnstake = unstakeAmountNum > 0 && canUnstake(unstakeAmount);

  const stakeError =
    stakeAmountNum > 0 && !canStake(stakeAmount) && !needsApproval(stakeAmount)
      ? 'Insufficient balance'
      : null;
  const unstakeError = unstakeAmountNum > 0 && !canDoUnstake ? 'Insufficient staked balance' : null;

  const walletBalance = parseFloat(formattedWalletBalance) || 0;
  const stakedBalance = parseFloat(formattedStakedBalance) || 0;
  const earnedRewards = parseFloat(formattedEarnedRewards) || 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View className="flex-1 items-center justify-center bg-black/85 px-5">
        <View className="w-full max-w-sm border-2 border-[#FFC043] bg-[#1a1a1a] shadow-[4px_4px_0px_#000000]">
          {/* Header */}
          <View className="flex-row items-center justify-between border-b border-[#FFC043]/30 px-4 py-3">
            <Text className="font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-[#FFC043]">
              PEPPER Staking
            </Text>
            <Pressable
              onPress={handleClose}
              className="h-7 w-7 items-center justify-center bg-white/10 active:bg-white/20"
            >
              <Text className="font-['PPNeueBit-Bold'] text-xs text-white">X</Text>
            </Pressable>
          </View>

          <ScrollView className="max-h-[65vh] px-4 py-4" showsVerticalScrollIndicator={false}>
            {/* Balance Overview */}
            <View className="mb-4 flex-row gap-3">
              <View className="flex-1 bg-white/5 p-3">
                <Text className="font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-wider text-white/50">
                  Wallet Balance
                </Text>
                <Text className="mt-1 font-['PPNeueBit-Bold'] text-lg text-white">
                  {isLoading ? '...' : walletBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </View>
              <View className="flex-1 bg-[#FFC043]/10 p-3">
                <Text className="font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-wider text-[#FFC043]">
                  Staked
                </Text>
                <Text className="mt-1 font-['PPNeueBit-Bold'] text-lg text-white">
                  {isLoading ? '...' : stakedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </Text>
              </View>
            </View>

            {/* Rewards */}
            <View className="mb-4 flex-row items-center justify-between bg-[#00FF80]/10 p-3">
              <View>
                <Text className="font-['PPNeueBit-Bold'] text-[10px] uppercase tracking-wider text-[#00FF80]">
                  Rewards
                </Text>
                <Text className="mt-0.5 font-['PPNeueBit-Bold'] text-base text-white">
                  {isLoading ? '...' : earnedRewards.toLocaleString(undefined, { maximumFractionDigits: 2 })} PEPPER
                </Text>
              </View>
              <Pressable
                onPress={handleClaim}
                disabled={!canClaim() || isPending}
                className={`px-4 py-2 ${
                  canClaim() && !isPending ? 'bg-[#00FF80] active:opacity-80' : 'bg-white/20'
                }`}
              >
                {isPending ? (
                  <ActivityIndicator size="small" color="#000000" />
                ) : (
                  <Text
                    className={`font-['PPNeueBit-Bold'] text-xs uppercase ${
                      canClaim() ? 'text-black' : 'text-white/40'
                    }`}
                  >
                    Claim
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Tabs */}
            <View className="mb-4 flex-row bg-white/5">
              <Pressable
                onPress={() => handleTabChange('stake')}
                className={`flex-1 py-2.5 ${activeTab === 'stake' ? 'bg-[#FFC043]' : ''}`}
              >
                <Text
                  className={`text-center font-['PPNeueBit-Bold'] text-sm uppercase ${
                    activeTab === 'stake' ? 'text-black' : 'text-white/50'
                  }`}
                >
                  Stake
                </Text>
              </Pressable>
              <Pressable
                onPress={() => handleTabChange('unstake')}
                className={`flex-1 py-2.5 ${activeTab === 'unstake' ? 'bg-[#FF006E]' : ''}`}
              >
                <Text
                  className={`text-center font-['PPNeueBit-Bold'] text-sm uppercase ${
                    activeTab === 'unstake' ? 'text-white' : 'text-white/50'
                  }`}
                >
                  Unstake
                </Text>
              </Pressable>
            </View>

            {/* Tab Content */}
            {activeTab === 'stake' ? (
              <View className="gap-3">
                <StakeInput
                  value={stakeAmount}
                  onChange={setStakeAmount}
                  maxAmount={formattedWalletBalance}
                  label="Amount to Stake"
                  disabled={isPending}
                  error={stakeError}
                />

                {showApproveButton ? (
                  <Pressable
                    onPress={handleApprove}
                    disabled={isPending}
                    className={`py-3 ${isPending ? 'bg-white/20' : 'bg-[#0080FF] active:opacity-80'}`}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text className="text-center font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider text-white">
                        Approve PEPPER
                      </Text>
                    )}
                  </Pressable>
                ) : (
                  <Pressable
                    onPress={handleStake}
                    disabled={!canDoStake || isPending}
                    className={`py-3 ${
                      canDoStake && !isPending ? 'bg-[#FFC043] active:opacity-80' : 'bg-white/20'
                    }`}
                  >
                    {isPending ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <Text
                        className={`text-center font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider ${
                          canDoStake ? 'text-black' : 'text-white/40'
                        }`}
                      >
                        Stake PEPPER
                      </Text>
                    )}
                  </Pressable>
                )}
              </View>
            ) : (
              <View className="gap-3">
                <StakeInput
                  value={unstakeAmount}
                  onChange={setUnstakeAmount}
                  maxAmount={formattedStakedBalance}
                  label="Amount to Unstake"
                  disabled={isPending}
                  error={unstakeError}
                />

                <Pressable
                  onPress={handleUnstake}
                  disabled={!canDoUnstake || isPending}
                  className={`py-3 ${
                    canDoUnstake && !isPending ? 'bg-[#FF006E] active:opacity-80' : 'bg-white/20'
                  }`}
                >
                  {isPending ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text
                      className={`text-center font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider ${
                        canDoUnstake ? 'text-white' : 'text-white/40'
                      }`}
                    >
                      Unstake PEPPER
                    </Text>
                  )}
                </Pressable>
              </View>
            )}

            {/* Transaction Status */}
            {txError && (
              <View className="mt-3 bg-[#FF006E]/20 p-3">
                <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#FF006E]">Error</Text>
                <Text className="mt-1 font-['PPMondwest-Regular'] text-xs text-white/80">{txError}</Text>
              </View>
            )}

            {txStatus === 'success' && lastTxHash && (
              <View className="mt-3 bg-[#00FF80]/20 p-3">
                <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">Success!</Text>
                <Pressable onPress={handleViewTransaction} className="mt-1">
                  <Text className="font-['PPMondwest-Regular'] text-xs text-[#00FF80] underline">
                    View on Explorer
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
