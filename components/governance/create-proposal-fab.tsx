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
        className={`flex-row items-center gap-2 px-5 py-3 active:opacity-80 ${
          disabled ? 'bg-gray-500 opacity-50' : 'bg-[#FFC043]'
        }`}
      >
        <Text className="font-['PPNeueBit-Bold'] text-lg text-black">+</Text>
        <Text className="font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider text-black">
          Submit
        </Text>
      </Pressable>
    </View>
  );
}
