import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Radius, FontSize, FontWeight, Spacing } from '@/constants/theme';

type BadgeType = 'success' | 'warning' | 'error' | 'info' | 'primary' | 'neutral';

interface BadgeProps {
  label: string;
  type?: BadgeType;
  style?: ViewStyle;
  small?: boolean;
}

const badgeColors: Record<BadgeType, { bg: string; text: string }> = {
  success: { bg: '#1B5E20', text: '#66BB6A' },
  warning: { bg: '#E65100', text: '#FFB74D' },
  error: { bg: '#B71C1C', text: '#EF9A9A' },
  info: { bg: '#0D47A1', text: '#90CAF9' },
  primary: { bg: '#4A3800', text: Colors.primary },
  neutral: { bg: '#2A2A2A', text: '#AAAAAA' },
};

export function Badge({ label, type = 'neutral', style, small = false }: BadgeProps) {
  const { bg, text } = badgeColors[type];
  return (
    <View style={[styles.container, { backgroundColor: bg }, small && styles.small, style]}>
      <Text style={[styles.label, { color: text }, small && styles.smallLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  smallLabel: {
    fontSize: FontSize.xs,
  },
});
