import { View, type ViewProps } from 'react-native';

import { Colors } from '@/constants/theme';

export interface CardProps extends ViewProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'alt';
}

export function Card({
  children,
  elevation = 'md',
  variant = 'default',
  className,
  style,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-none border-2';
  
  const variantClasses = {
    default: 'bg-surface border-border',
    alt: 'bg-surface-alt border-border',
  };

  const elevationStyles = {
    none: {},
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 2, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 4, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000000',
      shadowOffset: { width: 6, height: 6 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 6,
    },
  };

  return (
    <View
      className={`${baseClasses} ${variantClasses[variant]} ${className || ''}`}
      style={[
        elevationStyles[elevation],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

