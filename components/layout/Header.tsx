import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';

interface HeaderProps {
  title?: string;
  showOnlineToggle?: boolean;
  showSettings?: boolean;
}

export function Header({ title, showOnlineToggle = false, showSettings = false }: HeaderProps) {
  const { theme, t, isRTL } = useApp();
  const { isOnline, toggleOnlineStatus } = useOrders();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  return (
    <View style={[styles.container, { paddingTop: insets.top + Spacing.sm, backgroundColor: c.surface, borderBottomColor: c.border }]}>
      <View style={[styles.inner, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {/* Logo */}
        <View style={[styles.logoSection, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={styles.logoIcon}>
            <MaterialIcons name="directions-bike" size={20} color="#1A1A1A" />
          </View>
          <Text style={[styles.logoText, { color: c.text }]}>
            {title || 'Etlob'}
            <Text style={{ color: Colors.primary }}> Driver</Text>
          </Text>
        </View>

        {/* Right Actions */}
        <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {showOnlineToggle && (
            <Pressable
              style={[styles.onlineToggle, { backgroundColor: isOnline ? Colors.primary + '22' : c.card }]}
              onPress={toggleOnlineStatus}
            >
              <View style={[styles.onlineDot, { backgroundColor: isOnline ? Colors.primary : c.textMuted }]} />
              <Text style={[styles.onlineText, { color: isOnline ? Colors.primary : c.textMuted }]}>
                {isOnline ? t('online_status') : t('offline_status')}
              </Text>
            </Pressable>
          )}
          <View style={[styles.notificationBtn, { backgroundColor: c.card }]}>
            <MaterialIcons name="notifications-none" size={22} color={c.icon} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: Spacing.sm,
  },
  inner: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  actions: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  onlineToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  notificationBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
