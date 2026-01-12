import { View, type ViewProps } from 'react-native';

export interface CardProps extends ViewProps {
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  variant?: 'default' | 'alt' | 'dark';
}

export function Card({
  children,
  elevation = 'md',
  variant = 'default',
  className,
  style,
  ...props
}: CardProps) {
  const baseClasses = 'rounded-none';
  
  const variantStyles = {
    default: { backgroundColor: '#FFFFFF', borderColor: '#1A2A22' },
    alt: { backgroundColor: '#F3F6F4', borderColor: '#1A2A22' },
    dark: { backgroundColor: '#1a1a1a', borderColor: '#000000' },
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
      className={`${baseClasses} border-4 ${className || ''}`}
      style={[
        variantStyles[variant],
        elevationStyles[elevation],
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

