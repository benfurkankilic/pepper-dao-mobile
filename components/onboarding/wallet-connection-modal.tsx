import { useAppKit } from '@reown/appkit-react-native';
import { useEffect, useState } from 'react';
import { Modal, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
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

  function handleConnectPress() {
    try {
      // Track telemetry
      telemetry.trackWalletConnectOpened('reown');
      
      // Open AppKit modal
      open();
    } catch (error) {
      console.error('Failed to open wallet connect modal:', error);
    }
  }

  function handleExplorePress() {
    try {
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
        <View className="w-full max-w-md border-4 border-black bg-white p-8 shadow-[8px_8px_0px_#000000]">
          {/* Title */}
          <Text className="mb-4 text-center font-['PPNeueBit-Bold'] text-2xl uppercase tracking-wider text-[#FF006E]">
            Connect Wallet
          </Text>
          
          {/* Description */}
          <Text className="mb-8 text-center font-['PPMondwest-Regular'] text-sm leading-6 text-gray-800">
            Connect your wallet to participate in governance, staking, and earn rewards.
            {'\n\n'}
            Or explore without connecting in read-only mode.
          </Text>

          {/* Connect Button */}
          <Button
            onPress={handleConnectPress}
            variant="primary"
            className="mb-4"
          >
            Connect Wallet
          </Button>

          {/* Explore Button */}
          <Button
            onPress={handleExplorePress}
            variant="secondary"
          >
            Explore Without Connecting
          </Button>
        </View>
      </View>
    </Modal>
  );
}

/**
 * useWalletConnectionModal
 * 
 * Hook to manage wallet connection modal visibility
 * Shows modal only after onboarding is completed,
 * if user is not connected and hasn't dismissed it
 */
export function useWalletConnectionModal(isConnected: boolean, hasCompletedOnboarding: boolean) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function checkModalVisibility() {
      const isDismissed = StorageService.getBoolean(STORAGE_KEYS.ONBOARDING_DISMISSED) || false;
      setDismissed(isDismissed);

      // Show modal if onboarding completed, not connected, and not dismissed
      if (hasCompletedOnboarding && !isConnected && !isDismissed) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    }

    checkModalVisibility();
  }, [isConnected, hasCompletedOnboarding]);

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

