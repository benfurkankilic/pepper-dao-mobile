import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { ActivityIndicator, Alert, Pressable, Text, View } from 'react-native';

import { StakeModal } from '@/components/staking';
import { Card } from '@/components/ui/card';
import { PixelAlertModal } from '@/components/ui/pixel-alert-modal';
import { NetworkMismatchWarning, WalletConnectButton, WalletStatusPill } from '@/components/wallet';
import { getExplorerTxUrl } from '@/config/chains';
import { useWallet } from '@/contexts/wallet-context';
import { useStaking } from '@/hooks/use-staking';
import { STORAGE_KEYS, StorageService } from '@/lib/storage';

type OperationType = 'stake' | 'unstake';

interface SuccessModalState {
  visible: boolean;
  txHash: string;
  operation: OperationType;
}

const OPERATION_MESSAGES: Record<OperationType, { title: string; message: string }> = {
  stake: {
    title: 'Stake Successful',
    message: 'Your PEPPER tokens have been staked successfully. You can now earn rewards!',
  },
  unstake: {
    title: 'Unstake Successful',
    message: 'Your PEPPER tokens have been unstaked and returned to your wallet.',
  },
  claim: {
    title: 'Claim Successful',
    message: 'Your staking rewards have been claimed and added to your wallet.',
  },
};

/**
 * Wallet Section Component
 *
 * Displays wallet connection status and staking button
 */
export function WalletSection() {
  const { isConnected, isWrongNetwork, disconnect, switchToChiliz } = useWallet();
  const { formattedStakedBalance, isLoading: isStakingLoading } = useStaking();
  const [showStakeModal, setShowStakeModal] = useState(() => {
    return StorageService.getBoolean(STORAGE_KEYS.STAKING_MODAL_OPEN) ?? false;
  });
  const [successModal, setSuccessModal] = useState<SuccessModalState>({
    visible: false,
    txHash: '',
    operation: 'stake',
  });

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
    StorageService.setBoolean(STORAGE_KEYS.STAKING_MODAL_OPEN, true);
    setShowStakeModal(true);
  }

  function handleCloseStakeModal() {
    StorageService.setBoolean(STORAGE_KEYS.STAKING_MODAL_OPEN, false);
    setShowStakeModal(false);
  }

  function handleStakeSuccess(txHash: string, operation: OperationType) {
    StorageService.setBoolean(STORAGE_KEYS.STAKING_MODAL_OPEN, false);
    setSuccessModal({
      visible: true,
      txHash,
      operation,
    });
  }

  function handleCloseSuccessModal() {
    setSuccessModal((prev) => ({ ...prev, visible: false }));
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
      <StakeModal
        visible={showStakeModal}
        onClose={handleCloseStakeModal}
        onSuccess={handleStakeSuccess}
      />

      {/* Success Modal */}
      <PixelAlertModal
        visible={successModal.visible}
        onClose={handleCloseSuccessModal}
        title={OPERATION_MESSAGES[successModal.operation].title}
        message={OPERATION_MESSAGES[successModal.operation].message}
        type="success"
        copyableAddress={successModal.txHash}
        explorerUrl={successModal.txHash ? getExplorerTxUrl(successModal.txHash) : undefined}
      />
    </>
  );
}
