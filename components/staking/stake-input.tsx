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
 * Format number with thousand separators (dots)
 * e.g., 1000000 -> 1.000.000
 */
function formatWithThousandSeparators(value: string): string {
  // Remove any existing separators
  const cleaned = value.replace(/\./g, '').replace(/,/g, '');

  if (!cleaned) return '';

  // Handle decimal numbers - we don't expect decimals for PEPPER but handle just in case
  const parts = cleaned.split(',');
  const integerPart = parts[0];

  // Add thousand separators
  const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  return formatted;
}

/**
 * Remove thousand separators to get raw number
 */
function removeThousandSeparators(value: string): string {
  return value.replace(/\./g, '');
}

/**
 * Stake amount input with percentage quick-select chips
 */
export function StakeInput({
  value,
  onChange,
  maxAmount,
  label,
  placeholder = '0',
  disabled = false,
  error,
}: StakeInputProps) {
  // Display formatted value
  const displayValue = formatWithThousandSeparators(value);

  async function handlePercentagePress(percentage: number) {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const maxNum = parseFloat(maxAmount);
    if (isNaN(maxNum) || maxNum <= 0) {
      onChange('0');
      return;
    }

    const amount = (maxNum * percentage) / 100;
    // Round down to avoid exceeding max (no decimals for display)
    const rounded = Math.floor(amount);
    onChange(rounded.toString());
  }

  function handleMaxPress() {
    handlePercentagePress(100);
  }

  function handleTextChange(text: string) {
    // Remove thousand separators first
    const withoutSeparators = removeThousandSeparators(text);

    // Only allow numbers
    const cleaned = withoutSeparators.replace(/[^0-9]/g, '');

    // Remove leading zeros
    const noLeadingZeros = cleaned.replace(/^0+/, '') || '';

    onChange(noLeadingZeros);
  }

  // Format max amount for display
  const maxNum = parseFloat(maxAmount) || 0;
  const formattedMax = Math.floor(maxNum).toLocaleString('de-DE');

  return (
    <View>
      {/* Label and Balance */}
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="font-['PPNeueBit-Bold'] text-sm uppercase tracking-wider text-[#00FF80]">
          {label}
        </Text>
        <Text className="font-mono text-xs text-gray-400">Max: {formattedMax} PEPPER</Text>
      </View>

      {/* Input Container */}
      <View className="mb-2 flex-row items-center bg-white/10">
        <TextInput
          value={displayValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#666666"
          keyboardType="number-pad"
          editable={!disabled}
          style={{
            flex: 1,
            textAlign: 'center',
            paddingVertical: 12,
            paddingHorizontal: 60,
            fontFamily: 'PPNeueBit-Bold',
            fontSize: 20,
            lineHeight: 16,
            color: '#FFFFFF',
          }}
        />
        <Pressable
          onPress={handleMaxPress}
          disabled={disabled}
          style={{
            position: 'absolute',
            right: 8,
            backgroundColor: 'rgba(0, 255, 128, 0.2)',
            paddingHorizontal: 12,
            paddingVertical: 4,
          }}
        >
          <Text className="font-['PPNeueBit-Bold'] text-xs uppercase text-[#00FF80]">MAX</Text>
        </Pressable>
      </View>

      {/* Percentage Chips */}
      <View className="flex-row gap-2">
        {PERCENTAGE_CHIPS.map((percentage) => (
          <Pressable
            key={percentage}
            onPress={() => handlePercentagePress(percentage)}
            disabled={disabled}
            className={`flex-1 bg-white/10 py-2 ${disabled ? 'opacity-50' : 'active:bg-white/20'}`}
          >
            <Text className="text-center font-['PPNeueBit-Bold'] text-xs uppercase text-white/70">
              {percentage}%
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Error Message */}
      {error && (
        <View className="mt-2 border-2 border-[#FF006E] bg-[#330011] p-2">
          <Text className="text-center font-['PPNeueBit-Bold'] text-xs text-[#FF006E]">{error}</Text>
        </View>
      )}
    </View>
  );
}
