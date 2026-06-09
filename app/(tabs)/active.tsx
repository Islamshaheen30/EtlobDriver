import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { MockMap, DeliveryStatusBar, RatingStars } from '@/components';
import { OrderStatus } from '@/services/mockData';

const STATUS_FLOW: Record<string, OrderStatus> = {
  accepted: 'heading_to_pickup',
  heading_to_pickup: 'arrived_pickup',
  arrived_pickup: 'picked_up',
  picked_up: 'delivering',
  delivering: 'delivered',
};

const NEXT_ACTION_LABELS: Record<string, string> = {
  accepted: 'statusHeadingToPickup',
  heading_to_pickup: 'arrived',
  arrived_pickup: 'markPickedUp',
  picked_up: 'markPickedUp',
  delivering: 'markDelivered',
};

export default function ActiveDeliveryScreen() {
  const { theme, t, isRTL } = useApp();
  const { activeOrder, updateOrderStatus } = useOrders();
  const { showAlert } = useAlert();
  const c = theme.colors;

  const handleStatusUpdate = () => {
    if (!activeOrder) return;
    const nextStatus = STATUS_FLOW[activeOrder.status];
    if (nextStatus === 'delivered') {
      showAlert(t('markDelivered'), 'Confirm delivery completion?', [
        { text: t('cancel'), style: 'cancel' },
        { text: t('confirm'), style: 'default', onPress: () => updateOrderStatus('delivered') },
      ]);
    } else if (nextStatus) {
      updateOrderStatus(nextStatus);
    }
  };

  const handleCancel = () => {
    showAlert(t('cancelDelivery'), 'Cancel this delivery? This may affect your rating.', [
      { text: t('cancel'), style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => updateOrderStatus('cancelled') },
    ]);
  };

  if (!activeOrder) {
    return (
      <View style={[styles.screen, { backgroundColor: c.background }]}>
        <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.emptyContainer}>
          <View style={[styles.emptyBike, { backgroundColor: Colors.primary + '22' }]}>
            <MaterialIcons name="directions-bike" size={56} color={Colors.primary} />
          </View>
          <Text style={[styles.emptyTitle, { color: c.text }]}>{t('noActiveDelivery')}</Text>
          <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>{t('noActiveSubtitle')}</Text>
        </View>
      </View>
    );
  }

  const getActionLabel = (): string => {
    const key = NEXT_ACTION_LABELS[activeOrder.status];
    if (!key) return t('markDelivered');
    return t(key as any);
  };

  const showPickupAction = ['accepted', 'heading_to_pickup', 'arrived_pickup'].includes(activeOrder.status);

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Map */}
        <MockMap
          pickupLabel={activeOrder.restaurantName}
          dropoffLabel={activeOrder.customerName}
          height={240}
          showRoute
        />

        {/* Status Bar */}
        <View style={{ marginTop: Spacing.md }}>
          <DeliveryStatusBar currentStatus={activeOrder.status} />
        </View>

        {/* Order Info Card */}
        <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[styles.orderIdLabel, { color: c.textSecondary }]}>{t('orderID')}</Text>
            <Text style={[styles.orderId, { color: Colors.primary }]}>#{activeOrder.orderNumber}</Text>
          </View>

          <View style={[styles.divider, { backgroundColor: c.border }]} />

          {/* Pickup */}
          <View style={[styles.locationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.locationDot, { backgroundColor: '#4CAF50' }]} />
            <View style={[styles.locationInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
              <Text style={[styles.locationLabel, { color: c.textMuted }]}>{t('pickupAddress')}</Text>
              <Text style={[styles.locationValue, { color: c.text }]}>{activeOrder.restaurantName}</Text>
              <Text style={[styles.locationAddress, { color: c.textSecondary }]}>{activeOrder.restaurantAddress}</Text>
            </View>
            <Pressable style={[styles.navBtn, { backgroundColor: Colors.primary + '22' }]}>
              <MaterialIcons name="navigation" size={20} color={Colors.primary} />
            </Pressable>
          </View>

          <View style={[styles.routeConnector, { borderColor: c.border }]} />

          {/* Dropoff */}
          <View style={[styles.locationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.locationDot, { backgroundColor: Colors.primary }]} />
            <View style={[styles.locationInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
              <Text style={[styles.locationLabel, { color: c.textMuted }]}>{t('dropoffAddress')}</Text>
              <Text style={[styles.locationValue, { color: c.text }]}>{activeOrder.customerName}</Text>
              <Text style={[styles.locationAddress, { color: c.textSecondary }]}>{activeOrder.deliveryAddress}</Text>
            </View>
            <Pressable style={[styles.navBtn, { backgroundColor: Colors.primary + '22' }]}>
              <MaterialIcons name="call" size={20} color={Colors.primary} />
            </Pressable>
          </View>
        </View>

        {/* Earnings Preview */}
        <View style={[styles.earningsRow, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.earningItem}>
            <Text style={[styles.earningValue, { color: Colors.primary }]}>{activeOrder.earnings} {t('egp')}</Text>
            <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('basePay')}</Text>
          </View>
          <View style={[styles.earningDivider, { backgroundColor: c.border }]} />
          <View style={styles.earningItem}>
            <Text style={[styles.earningValue, { color: '#4CAF50' }]}>{activeOrder.tip} {t('egp')}</Text>
            <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('tips')}</Text>
          </View>
          <View style={[styles.earningDivider, { backgroundColor: c.border }]} />
          <View style={styles.earningItem}>
            <Text style={[styles.earningValue, { color: c.text }]}>{activeOrder.distance} {t('km')}</Text>
            <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('totalDistance')}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Pressable
            style={({ pressed }) => [styles.cancelBtn, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
            onPress={handleCancel}
          >
            <MaterialIcons name="close" size={20} color={c.error} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.mainActionBtn, { backgroundColor: Colors.primary, ...Shadow.lg, opacity: pressed ? 0.85 : 1 }]}
            onPress={handleStatusUpdate}
          >
            <MaterialIcons
              name={showPickupAction ? 'inventory' : 'check-circle'}
              size={22}
              color="#1A1A1A"
            />
            <Text style={styles.mainActionText}>{getActionLabel()}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyBike: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
    lineHeight: 24,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  infoCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderIdLabel: {
    fontSize: FontSize.sm,
  },
  orderId: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  locationRow: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  locationDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
  },
  locationInfo: {
    flex: 1,
  },
  locationLabel: {
    fontSize: FontSize.xs,
    marginBottom: 1,
  },
  locationValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  locationAddress: {
    fontSize: FontSize.sm,
    marginTop: 1,
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeConnector: {
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    height: 20,
    marginLeft: 5,
    marginVertical: 4,
  },
  earningsRow: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    justifyContent: 'space-around',
  },
  earningItem: {
    alignItems: 'center',
    flex: 1,
  },
  earningValue: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  earningLabel: {
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  earningDivider: {
    width: 1,
    height: 36,
  },
  actions: {
    marginHorizontal: Spacing.md,
    gap: Spacing.sm,
    alignItems: 'center',
  },
  cancelBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  mainActionBtn: {
    flex: 1,
    height: 56,
    borderRadius: Radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  mainActionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
});
