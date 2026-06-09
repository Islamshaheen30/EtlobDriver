import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const { theme } = useApp();
  const c = theme.colors;

  const getContainerStyle = (): ViewStyle => {
    const base: ViewStyle = {
      borderRadius: Radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    const sizes: Record<Size, ViewStyle> = {
      sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 2, minHeight: 36 },
      md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm + 2, minHeight: 48 },
      lg: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, minHeight: 56 },
    };

    const variants: Record<Variant, ViewStyle> = {
      primary: { backgroundColor: Colors.primary },
      secondary: { backgroundColor: c.card },
      danger: { backgroundColor: c.error },
      ghost: { backgroundColor: 'transparent' },
      outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: Colors.primary },
    };

    return { ...base, ...sizes[size], ...variants[variant], ...(fullWidth ? { width: '100%' } : {}), opacity: disabled || loading ? 0.6 : 1 };
  };

  const getTextStyle = (): TextStyle => {
    const variants: Record<Variant, TextStyle> = {
      primary: { color: '#1A1A1A' },
      secondary: { color: c.text },
      danger: { color: '#FFFFFF' },
      ghost: { color: Colors.primary },
      outline: { color: Colors.primary },
    };
    const sizes: Record<Size, TextStyle> = {
      sm: { fontSize: FontSize.sm },
      md: { fontSize: FontSize.md },
      lg: { fontSize: FontSize.lg },
    };
    return { fontWeight: FontWeight.semibold, ...variants[variant], ...sizes[size] };
  };

  return (
    <Pressable
      style={({ pressed }) => [getContainerStyle(), { opacity: pressed ? 0.8 : disabled || loading ? 0.6 : 1 }, style]}
      onPress={onPress}
      disabled={disabled || loading}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? '#1A1A1A' : Colors.primary} />
      ) : (
        <Text style={[getTextStyle(), textStyle]}>{label}</Text>
      )}
    </Pressable>
  );
}
