import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

interface ButtonProps {
  children: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'success';
  disabled?: boolean;
  className?: string;
}

/**
 * Retro-styled button component
 * Follows the design system with chunky borders, shadows, and pixel fonts
 */
export function Button({ 
  children, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  className = '',
}: ButtonProps) {
  async function handlePress() {
    // Trigger haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await onPress();
  }

  const variantStyles = {
    primary: 'bg-[#FF006E]',
    secondary: 'bg-white',
    success: 'bg-[#00FF80]',
  };

  const textColorStyles = {
    primary: 'text-white',
    secondary: 'text-black',
    success: 'text-white',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`
        border-4 border-black px-6 py-4
        shadow-[4px_4px_0px_#000000]
        active:translate-x-1 active:translate-y-1 active:shadow-none
        ${variantStyles[variant]}
        ${disabled ? 'opacity-50' : 'opacity-100'}
        ${className}
      `}
    >
      <Text 
        className={`
          text-center font-['PPNeueBit-Bold'] text-base uppercase tracking-wider
          ${textColorStyles[variant]}
        `}
      >
        {children}
      </Text>
    </Pressable>
  );
}
