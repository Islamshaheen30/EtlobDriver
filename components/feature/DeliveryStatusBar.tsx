import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { OrderStatus } from '@/services/mockData';

const STATUS_STEPS: OrderStatus[] = [
  'accepted',
  'heading_to_pickup',
  'picked_up',
  'delivering',
  'delivered',
];

const STATUS_ICONS: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  accepted: 'check-circle',
  heading_to_pickup: 'directions-bike',
  picked_up: 'inventory',
  delivering: 'local-shipping',
  delivered: 'celebration',
};

interface DeliveryStatusBarProps {
  currentStatus: OrderStatus;
}

export function DeliveryStatusBar({ currentStatus }: DeliveryStatusBarProps) {
  const { t, theme } = useApp();
  const c = theme.colors;
  const currentIndex = STATUS_STEPS.indexOf(currentStatus);

  const statusLabels: Record<string, string> = {
    accepted: t('statusAccepted'),
    heading_to_pickup: t('statusHeadingToPickup'),
    picked_up: t('statusPickedUp'),
    delivering: t('statusDelivering'),
    delivered: t('statusDelivered'),
  };

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.border }]}>
      <View style={styles.stepsRow}>
        {STATUS_STEPS.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          return (
            <React.Fragment key={step}>
              <View style={styles.step}>
                <View
                  style={[
                    styles.iconCircle,
                    isCompleted && { backgroundColor: Colors.primary },
                    isActive && { backgroundColor: Colors.primary + '33', borderColor: Colors.primary, borderWidth: 2 },
                    !isCompleted && !isActive && { backgroundColor: c.cardElevated },
                  ]}
                >
                  <MaterialIcons
                    name={STATUS_ICONS[step]}
                    size={16}
                    color={isCompleted ? '#1A1A1A' : isActive ? Colors.primary : c.textMuted}
                  />
                </View>
              </View>
              {index < STATUS_STEPS.length - 1 && (
                <View style={[styles.connector, { backgroundColor: index < currentIndex ? Colors.primary : c.border }]} />
              )}
            </React.Fragment>
          );
        })}
      </View>
      <Text style={[styles.statusLabel, { color: c.text }]}>
        {statusLabels[currentStatus]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  step: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connector: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  statusLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    textAlign: 'center',
  },
});
