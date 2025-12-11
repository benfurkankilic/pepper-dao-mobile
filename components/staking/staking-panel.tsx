/**
 * Staking Panel Component
 *
 * Main UI for PEPPER token staking operations.
 * Displays balances, rewards, and provides stake/unstake/claim actions.
 */

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { getExplorerTxUrl } from '@/config/chains';
import { useStaking } from '@/hooks/use-staking';

import { StakeInput } from './stake-input';

type TabType = 'stake' | 'unstake';

/**
 * Staking panel with tabs for stake/unstake operations
 */
export function StakingPanel() {
  const [activeTab, setActiveTab] = useState<TabType>('stake');
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [lastTxHash, setLastTxHash] = useState<string | null>(null);

  const {
    stakingData,
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
    isReady,
  } = useStaking();

  const isPending = txStatus === 'pending';

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

  // Validation for stake action
  const stakeAmountNum = parseFloat(stakeAmount) || 0;
  const showApproveButton = stakeAmountNum > 0 && needsApproval(stakeAmount);
  const canDoStake = stakeAmountNum > 0 && canStake(stakeAmount);
  
  // Validation for unstake action
  const unstakeAmountNum = parseFloat(unstakeAmount) || 0;
  const canDoUnstake = unstakeAmountNum > 0 && canUnstake(unstakeAmount);

  // Error messages
  const stakeError =
    stakeAmountNum > 0 && !canStake(stakeAmount) && !needsApproval(stakeAmount)
      ? 'Insufficient balance'
      : null;
  const unstakeError =
    unstakeAmountNum > 0 && !canDoUnstake ? 'Insufficient staked balance' : null;

  if (!isReady) {
    return (
      <Card elevation="lg" className="border-4 border-white p-6">
        <View className="items-center py-8">
          <Text className="font-['PPNeueBit-Bold'] text-lg uppercase text-white">
            Connect wallet to stake
          </Text>
          <Text className="mt-2 text-center text-sm text-gray-400">
            Please connect your wallet to access staking features
          </Text>
        </View>
      </Card>
    );
  }

  return (
    <Card elevation="lg" className="border-4 border-white p-6">
      {/* Header */}
      <View className="mb-6">
        <Text className="font-['PPNeueBit-Bold'] text-xl uppercase tracking-wider text-white">
          PEPPER Staking
        </Text>
      </View>

      {/* Balance Overview */}
      <View className="mb-6 flex-row space-x-4">
        <View className="flex-1 border-2 border-white bg-[#1a1a1a] p-3">
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">
            Wallet
          </Text>
          <Text className="mt-1 font-mono text-sm text-white">
            {isLoading ? '...' : parseFloat(formattedWalletBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
        </View>
        <View className="flex-1 border-2 border-white bg-[#1a1a1a] p-3">
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">
            Staked
          </Text>
          <Text className="mt-1 font-mono text-sm text-white">
            {isLoading ? '...' : parseFloat(formattedStakedBalance).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </Text>
        </View>
      </View>

      {/* Rewards Section */}
      <View className="mb-6 border-2 border-[#00FF80] bg-[#003311] p-4">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">
              Claimable Rewards
            </Text>
            <Text className="mt-1 font-mono text-lg text-white">
              {isLoading ? '...' : parseFloat(formattedEarnedRewards).toLocaleString(undefined, { maximumFractionDigits: 6 })} PEPPER
            </Text>
          </View>
          <Pressable
            onPress={handleClaim}
            disabled={!canClaim() || isPending}
            className={`
              border-3 border-white px-4 py-2
              shadow-[3px_3px_0px_#000000]
              active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
              ${canClaim() && !isPending ? 'bg-[#00FF80]' : 'bg-gray-600 opacity-50'}
            `}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#000000" />
            ) : (
              <Text className="font-['PPNeueBit-Bold'] text-sm uppercase text-black">
                Claim
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Tabs */}
      <View className="mb-4 flex-row">
        <Pressable
          onPress={() => handleTabChange('stake')}
          className={`
            flex-1 border-2 py-3
            ${activeTab === 'stake' ? 'border-[#00FF80] bg-[#00FF80]/20' : 'border-white bg-transparent'}
          `}
        >
          <Text
            className={`
              text-center font-['PPNeueBit-Bold'] text-sm uppercase
              ${activeTab === 'stake' ? 'text-[#00FF80]' : 'text-white'}
            `}
          >
            Stake
          </Text>
        </Pressable>
        <Pressable
          onPress={() => handleTabChange('unstake')}
          className={`
            flex-1 border-2 py-3
            ${activeTab === 'unstake' ? 'border-[#FF006E] bg-[#FF006E]/20' : 'border-white bg-transparent'}
          `}
        >
          <Text
            className={`
              text-center font-['PPNeueBit-Bold'] text-sm uppercase
              ${activeTab === 'unstake' ? 'text-[#FF006E]' : 'text-white'}
            `}
          >
            Unstake
          </Text>
        </Pressable>
      </View>

      {/* Tab Content */}
      {activeTab === 'stake' ? (
        <View className="space-y-4">
          <StakeInput
            value={stakeAmount}
            onChange={setStakeAmount}
            maxAmount={formattedWalletBalance}
            label="Amount to Stake"
            disabled={isPending}
            error={stakeError}
          />

          {/* Stake/Approve Button */}
          {showApproveButton ? (
            <Pressable
              onPress={handleApprove}
              disabled={isPending}
              className={`
                border-4 border-white py-4
                shadow-[4px_4px_0px_#000000]
                active:translate-x-1 active:translate-y-1 active:shadow-none
                ${isPending ? 'bg-gray-600' : 'bg-[#0080FF]'}
              `}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text className="text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-white">
                  Approve PEPPER
                </Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              onPress={handleStake}
              disabled={!canDoStake || isPending}
              className={`
                border-4 border-white py-4
                shadow-[4px_4px_0px_#000000]
                active:translate-x-1 active:translate-y-1 active:shadow-none
                ${canDoStake && !isPending ? 'bg-[#00FF80]' : 'bg-gray-600 opacity-50'}
              `}
            >
              {isPending ? (
                <ActivityIndicator size="small" color="#000000" />
              ) : (
                <Text className="text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-black">
                  Stake PEPPER
                </Text>
              )}
            </Pressable>
          )}
        </View>
      ) : (
        <View className="space-y-4">
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
            className={`
              border-4 border-white py-4
              shadow-[4px_4px_0px_#000000]
              active:translate-x-1 active:translate-y-1 active:shadow-none
              ${canDoUnstake && !isPending ? 'bg-[#FF006E]' : 'bg-gray-600 opacity-50'}
            `}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text className="text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-white">
                Unstake PEPPER
              </Text>
            )}
          </Pressable>
        </View>
      )}

      {/* Transaction Status */}
      {txError && (
        <View className="mt-4 border-2 border-[#FF006E] bg-[#330011] p-3">
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#FF006E]">
            Error
          </Text>
          <Text className="mt-1 text-sm text-white">{txError}</Text>
        </View>
      )}

      {txStatus === 'success' && lastTxHash && (
        <View className="mt-4 border-2 border-[#00FF80] bg-[#003311] p-3">
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">
            Transaction Successful
          </Text>
          <Pressable onPress={handleViewTransaction} className="mt-2">
            <Text className="text-sm text-[#00FF80] underline">
              View on Explorer →
            </Text>
          </Pressable>
        </View>
      )}
    </Card>
  );
}


