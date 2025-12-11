/**
 * Stake Input Component
 *
 * Amount input with percentage chips for quick amount selection.
 * Used for both stake and unstake operations.
 */

import * as Haptics from 'expo-haptics';
import { Pressable, Text, TextInput, View } from 'react-native';

interface StakeInputProps {
  value: string;
  onChange: (value: string) => void;
  maxAmount: string;
  label: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
}

const PERCENTAGE_CHIPS = [25, 50, 75, 100] as const;

/**
 * Stake amount input with percentage quick-select chips
 */
export function StakeInput({
  value,
  onChange,
  maxAmount,
  label,
  placeholder = '0.00',
  disabled = false,
  error,
}: StakeInputProps) {
  async function handlePercentagePress(percentage: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const maxNum = parseFloat(maxAmount);
    if (isNaN(maxNum) || maxNum <= 0) {
      onChange('0');
      return;
    }
    
    const amount = (maxNum * percentage) / 100;
    // Round down to avoid exceeding max
    const rounded = Math.floor(amount * 1e6) / 1e6;
    onChange(rounded.toString());
  }

  function handleMaxPress() {
    handlePercentagePress(100);
  }

  function handleTextChange(text: string) {
    // Only allow numbers and decimals
    const cleaned = text.replace(/[^0-9.]/g, '');
    // Prevent multiple decimals
    const parts = cleaned.split('.');
    if (parts.length > 2) {
      return;
    }
    onChange(cleaned);
  }

  return (
    <View className="space-y-3">
      {/* Label and Balance */}
      <View className="flex-row items-center justify-between">
        <Text className="font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider text-[#00FF80]">
          {label}
        </Text>
        <Text className="font-mono text-xs text-gray-400">
          Max: {parseFloat(maxAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })} PEPPER
        </Text>
      </View>

      {/* Input Container */}
      <View className="border-3 border-white bg-[#1a1a1a]">
        <View className="flex-row items-center">
          <TextInput
            value={value}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor="#666666"
            keyboardType="decimal-pad"
            editable={!disabled}
            className="flex-1 px-4 py-3 font-mono text-lg text-white"
          />
          <Pressable
            onPress={handleMaxPress}
            disabled={disabled}
            className="mr-2 border-2 border-[#00FF80] bg-transparent px-3 py-1 active:bg-[#00FF80]/20"
          >
            <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">
              MAX
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Percentage Chips */}
      <View className="flex-row space-x-2">
        {PERCENTAGE_CHIPS.map((percentage) => (
          <Pressable
            key={percentage}
            onPress={() => handlePercentagePress(percentage)}
            disabled={disabled}
            className={`
              flex-1 border-2 border-white py-2
              ${disabled ? 'opacity-50' : 'active:bg-white/10'}
            `}
          >
            <Text className="text-center font-['PPNeueBit-Bold'] text-xs uppercase text-white">
              {percentage}%
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <View className="border-2 border-[#FF006E] bg-[#330011] p-2">
          <Text className="text-center font-['PPNeueBit-Bold'] text-xs text-[#FF006E]">
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}


