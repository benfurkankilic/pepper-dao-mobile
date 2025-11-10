import { useAppKit } from '@reown/appkit-react-native';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { STORAGE_KEYS, StorageService } from '@/lib/storage';
import { telemetry } from '@/lib/telemetry';

interface WalletConnectionModalProps {
  visible: boolean;
  onDismiss: () => void;
}

/**
 * WalletConnectionModal
 * 
 * Retro-styled modal that prompts users to connect their wallet
 * or explore the app without connecting (read-only mode).
 * 
 * Uses Reown AppKit for wallet connection.
 */
export function WalletConnectionModal({ visible, onDismiss }: WalletConnectionModalProps) {
  const { open } = useAppKit();

  async function handleConnectPress() {
    try {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Track telemetry
      telemetry.trackWalletConnectOpened('reown');
      
      // Open AppKit modal
      open();
    } catch (error) {
      console.error('Failed to open wallet connect modal:', error);
    }
  }

  async function handleExplorePress() {
    try {
      // Trigger haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // Mark onboarding as dismissed
      StorageService.setBoolean(STORAGE_KEYS.ONBOARDING_DISMISSED, true);
      
      // Close modal
      onDismiss();
    } catch (error) {
      console.error('Failed to dismiss onboarding:', error);
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View className="flex-1 items-center justify-center bg-black/80 px-6">
        {/* Modal Card */}
        <View className="w-full max-w-md border-4 border-white bg-[#1a0033] p-8 shadow-[8px_8px_0px_#000000]">
          {/* Title */}
          <Text className="mb-4 text-center font-['PPNeueBit-Bold'] text-2xl uppercase tracking-wider text-[#FF006E]">
            Connect Wallet
          </Text>
          
          {/* Description */}
          <Text className="mb-8 text-center font-['PPMondwest-Regular'] text-sm leading-6 text-white">
            Connect your wallet to participate in governance, staking, and earn rewards.
            {'\n\n'}
            Or explore without connecting in read-only mode.
          </Text>

          {/* Connect Button */}
          <Pressable
            onPress={handleConnectPress}
            className="mb-4 border-4 border-white bg-[#FF006E] px-6 py-4 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Text className="text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-white">
              Connect Wallet
            </Text>
          </Pressable>

          {/* Explore Button */}
          <Pressable
            onPress={handleExplorePress}
            className="border-4 border-white bg-transparent px-6 py-4 shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            <Text className="text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider text-white">
              Explore Without Connecting
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/**
 * useWalletConnectionModal
 * 
 * Hook to manage wallet connection modal visibility
 * Shows modal on app start if user is not connected and hasn't dismissed it
 */
export function useWalletConnectionModal(isConnected: boolean) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function checkOnboardingStatus() {
      const isDismissed = StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_DISMISSED) || false;
      setDismissed(isDismissed);

      // Show modal if not connected and not dismissed
      if (!isConnected && !isDismissed) {
        setVisible(true);
      }
    }

    checkOnboardingStatus();
  }, [isConnected]);

  // Hide modal when user connects
  useEffect(() => {
    if (isConnected) {
      setVisible(false);
    }
  }, [isConnected]);

  function handleDismiss() {
    setVisible(false);
    setDismissed(true);
  }

  return { visible, handleDismiss };
}

