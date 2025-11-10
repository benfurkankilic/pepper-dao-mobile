import { Pressable, Text, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';

import { Colors } from '@/constants/theme';
import { FONTS } from '@/lib/fonts';

export interface ButtonProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  disabled,
  className,
  ...props
}: ButtonProps) {
  function handlePress(e: any) {
    if (onPress && !disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress(e);
    }
  }

  const baseClasses = 'rounded-none border-3 items-center justify-center active:translate-x-0.5 active:translate-y-0.5';
  
  const variantClasses = {
    primary: `bg-pepper-red border-white shadow-retro`,
    secondary: `bg-surface border-border shadow-retro`,
    ghost: `bg-transparent border-transparent`,
  };

  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-4',
    lg: 'px-8 py-5',
  };

  const textColorClasses = {
    primary: 'text-white',
    secondary: 'text-ink',
    ghost: 'text-pepper-red',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className || ''}`}
      style={{
        opacity: disabled ? 0.5 : 1,
      }}
      {...props}
    >
      <Text
        className={`font-pixel uppercase tracking-wide ${textColorClasses[variant]} ${textSizeClasses[size]}`}
        style={{
          fontFamily: FONTS.pixel,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

