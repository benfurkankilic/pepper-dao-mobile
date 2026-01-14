import { Pressable, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

interface CreateProposalFABProps {
  onPress: () => void;
  disabled?: boolean;
}

/**
 * Floating Action Button for creating proposals
 * Positioned at bottom-right of the governance screen
 */
export function CreateProposalFAB(props: CreateProposalFABProps) {
  const { onPress, disabled = false } = props;

  function handlePress() {
    if (disabled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }

  return (
    <View className="absolute bottom-6 right-4">
      <Pressable
        onPress={handlePress}
        disabled={disabled}
        className={`h-14 w-14 items-center justify-center border-4 border-white shadow-[4px_4px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none ${
          disabled ? 'bg-gray-500 opacity-50' : 'bg-[#E54545]'
        }`}
      >
        <Text className="font-['PPNeueBit-Bold'] text-2xl text-white">+</Text>
      </Pressable>
    </View>
  );
}
