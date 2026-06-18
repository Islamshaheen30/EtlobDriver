import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { MockMap, DeliveryStatusBar, RatingStars } from '@/components';
import { ProofPhotoCapture } from '@/components/feature/ProofPhotoCapture';
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
  const { activeOrders, activeOrder, updateOrderStatus, setOrderProofPhoto, adminConfig, isLocationSharing, locationPermissionDenied } = useOrders();
  const { showAlert } = useAlert();
  const c = theme.colors;

  // Which order is currently selected (default first)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [proofModalVisible, setProofModalVisible] = useState(false);
  const [pendingPickupOrderId, setPendingPickupOrderId] = useState<string | null>(null);

  const displayOrder = selectedOrderId
    ? activeOrders.find((o) => o.id === selectedOrderId) ?? activeOrder
    : activeOrder;

  const handleStatusUpdate = (orderId?: string) => {
    const order = orderId ? activeOrders.find((o) => o.id === orderId) : displayOrder;
    if (!order) return;
    const nextStatus = STATUS_FLOW[order.status];

    if (order.status === 'arrived_pickup') {
      // Trigger proof photo before marking picked up
      setPendingPickupOrderId(order.id);
      setProofModalVisible(true);
      return;
    }

    if (nextStatus === 'delivered') {
      showAlert(t('markDelivered'), 'Confirm delivery completion?', [
        { text: t('cancel'), style: 'cancel' },
        { text: t('confirm'), style: 'default', onPress: () => updateOrderStatus('delivered', order.id) },
      ]);
    } else if (nextStatus) {
      updateOrderStatus(nextStatus, order.id);
    }
  };

  const handleProofConfirm = (uri: string) => {
    if (pendingPickupOrderId) {
      setOrderProofPhoto(pendingPickupOrderId, uri);
      updateOrderStatus('picked_up', pendingPickupOrderId);
    }
    setProofModalVisible(false);
    setPendingPickupOrderId(null);
  };

  const handleProofSkip = () => {
    if (pendingPickupOrderId) {
      updateOrderStatus('picked_up', pendingPickupOrderId);
    }
    setProofModalVisible(false);
    setPendingPickupOrderId(null);
  };

  const handleCancel = (orderId?: string) => {
    const id = orderId ?? displayOrder?.id;
    if (!id) return;
    showAlert(t('cancelDelivery'), 'Cancel this delivery? This may affect your rating.', [
      { text: t('cancel'), style: 'cancel' },
      { text: 'Yes, Cancel', style: 'destructive', onPress: () => updateOrderStatus('cancelled', id) },
    ]);
  };

  const getActionLabel = (order: typeof displayOrder): string => {
    if (!order) return t('markDelivered');
    const key = NEXT_ACTION_LABELS[order.status];
    if (!key) return t('markDelivered');
    return t(key as any);
  };

  const showPickupAction = (status: string) =>
    ['accepted', 'heading_to_pickup', 'arrived_pickup'].includes(status);

  if (activeOrders.length === 0) {
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

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Multi-order tab selector */}
      {activeOrders.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.orderTabsScroll, { backgroundColor: c.surface, borderBottomColor: c.border }]}
          contentContainerStyle={styles.orderTabsContent}
        >
          {activeOrders.map((o, idx) => {
            const isSelected = (selectedOrderId ?? activeOrders[0].id) === o.id;
            return (
              <Pressable
                key={o.id}
                style={[
                  styles.orderTab,
                  { backgroundColor: isSelected ? Colors.primary : c.card, borderColor: isSelected ? Colors.primary : c.border },
                ]}
                onPress={() => setSelectedOrderId(o.id)}
              >
                <MaterialIcons name="receipt-long" size={14} color={isSelected ? '#1A1A1A' : c.textSecondary} />
                <Text style={[styles.orderTabText, { color: isSelected ? '#1A1A1A' : c.textSecondary }]}>
                  #{o.orderNumber}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {/* GPS banner */}
      {(isLocationSharing || locationPermissionDenied) && (
        <View
          style={[
            styles.gpsBanner,
            {
              backgroundColor: locationPermissionDenied ? c.error + '18' : Colors.primary + '18',
              borderColor: locationPermissionDenied ? c.error : Colors.primary,
            },
          ]}
        >
          <MaterialIcons
            name={locationPermissionDenied ? 'location-off' : 'my-location'}
            size={14}
            color={locationPermissionDenied ? c.error : Colors.primary}
          />
          <Text
            style={[
              styles.gpsBannerText,
              { color: locationPermissionDenied ? c.error : Colors.primary },
            ]}
          >
            {'  '}
            {locationPermissionDenied ? t('gpsPermissionDenied') : t('gpsSharing')}
          </Text>
          {isLocationSharing && (
            <View style={[styles.gpsLiveDot, { backgroundColor: Colors.primary }]} />
          )}
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {displayOrder && (
          <>
            {/* Map */}
            <MockMap
              pickupLabel={displayOrder.restaurantName}
              dropoffLabel={displayOrder.customerName}
              height={240}
              showRoute
            />

            {/* Status Bar */}
            <View style={{ marginTop: Spacing.md }}>
              <DeliveryStatusBar currentStatus={displayOrder.status} />
            </View>

            {/* Proof photo thumbnail if captured */}
            {displayOrder.proofPhotoUri ? (
              <View style={[styles.proofBadgeRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Image
                  source={{ uri: displayOrder.proofPhotoUri }}
                  style={styles.proofThumb}
                  contentFit="cover"
                  transition={200}
                />
                <View style={[styles.proofTextBlock, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
                  <Text style={[styles.proofLabel, { color: '#4CAF50' }]}>{t('proofPhotoSuccess')}</Text>
                  <Text style={[styles.proofSub, { color: c.textMuted }]}>{t('orderID')}{displayOrder.orderNumber}</Text>
                </View>
                <MaterialIcons name="verified" size={20} color="#4CAF50" />
              </View>
            ) : null}

            {/* Order Info Card */}
            <View style={[styles.infoCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={[styles.infoRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[styles.orderIdLabel, { color: c.textSecondary }]}>{t('orderID')}</Text>
                <Text style={[styles.orderId, { color: Colors.primary }]}>#{displayOrder.orderNumber}</Text>
              </View>
              <View style={[styles.divider, { backgroundColor: c.border }]} />

              {/* Pickup */}
              <View style={[styles.locationRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.locationDot, { backgroundColor: '#4CAF50' }]} />
                <View style={[styles.locationInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
                  <Text style={[styles.locationLabel, { color: c.textMuted }]}>{t('pickupAddress')}</Text>
                  <Text style={[styles.locationValue, { color: c.text }]}>{displayOrder.restaurantName}</Text>
                  <Text style={[styles.locationAddress, { color: c.textSecondary }]}>{displayOrder.restaurantAddress}</Text>
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
                  <Text style={[styles.locationValue, { color: c.text }]}>{displayOrder.customerName}</Text>
                  <Text style={[styles.locationAddress, { color: c.textSecondary }]}>{displayOrder.deliveryAddress}</Text>
                </View>
                <Pressable style={[styles.navBtn, { backgroundColor: Colors.primary + '22' }]}>
                  <MaterialIcons name="call" size={20} color={Colors.primary} />
                </Pressable>
              </View>
            </View>

            {/* Earnings Preview */}
            <View style={[styles.earningsRow, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: c.card, borderColor: c.border }]}>
              <View style={styles.earningItem}>
                <Text style={[styles.earningValue, { color: Colors.primary }]}>{displayOrder.earnings} {t('egp')}</Text>
                <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('basePay')}</Text>
              </View>
              <View style={[styles.earningDivider, { backgroundColor: c.border }]} />
              <View style={styles.earningItem}>
                <Text style={[styles.earningValue, { color: '#4CAF50' }]}>{displayOrder.tip} {t('egp')}</Text>
                <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('tips')}</Text>
              </View>
              <View style={[styles.earningDivider, { backgroundColor: c.border }]} />
              <View style={styles.earningItem}>
                <Text style={[styles.earningValue, { color: c.text }]}>{displayOrder.distance} {t('km')}</Text>
                <Text style={[styles.earningLabel, { color: c.textMuted }]}>{t('totalDistance')}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Pressable
                style={({ pressed }) => [styles.cancelBtn, { backgroundColor: c.card, borderColor: c.border, opacity: pressed ? 0.7 : 1 }]}
                onPress={() => handleCancel(displayOrder.id)}
              >
                <MaterialIcons name="close" size={20} color={c.error} />
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.mainActionBtn, { backgroundColor: Colors.primary, ...Shadow.lg, opacity: pressed ? 0.85 : 1 }]}
                onPress={() => handleStatusUpdate(displayOrder.id)}
              >
                <MaterialIcons
                  name={showPickupAction(displayOrder.status) ? 'inventory' : 'check-circle'}
                  size={22}
                  color="#1A1A1A"
                />
                <Text style={styles.mainActionText}>{getActionLabel(displayOrder)}</Text>
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>

      {/* Proof photo modal */}
      <ProofPhotoCapture
        visible={proofModalVisible}
        orderId={pendingPickupOrderId ?? ''}
        orderNumber={activeOrders.find((o) => o.id === pendingPickupOrderId)?.orderNumber ?? ''}
        onConfirm={handleProofConfirm}
        onSkip={handleProofSkip}
        onClose={() => { setProofModalVisible(false); setPendingPickupOrderId(null); }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
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
  orderTabsScroll: {
    borderBottomWidth: 1,
    maxHeight: 56,
  },
  orderTabsContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  orderTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  orderTabText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  gpsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  gpsBannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    flex: 1,
  },
  gpsLiveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  proofBadgeRow: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: '#4CAF5011',
    borderWidth: 1,
    borderColor: '#4CAF5033',
  },
  proofThumb: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
  },
  proofTextBlock: {
    flex: 1,
    gap: 2,
  },
  proofLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  proofSub: {
    fontSize: FontSize.xs,
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
  orderIdLabel: { fontSize: FontSize.sm },
  orderId: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  divider: { height: 1, marginBottom: Spacing.md },
  locationRow: { alignItems: 'flex-start', gap: Spacing.sm },
  locationDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  locationInfo: { flex: 1 },
  locationLabel: { fontSize: FontSize.xs, marginBottom: 1 },
  locationValue: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  locationAddress: { fontSize: FontSize.sm, marginTop: 1 },
  navBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
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
  earningItem: { alignItems: 'center', flex: 1 },
  earningValue: { fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  earningLabel: { fontSize: FontSize.xs, marginTop: 2 },
  earningDivider: { width: 1, height: 36 },
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
