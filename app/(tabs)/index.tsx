import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';
import { useAlert } from '@/template';
import { OrderCard, Header } from '@/components';
import { Order } from '@/services/mockData';

export default function OrdersScreen() {
  const { theme, t, isRTL } = useApp();
  const { pendingOrders, activeOrder, acceptOrder, declineOrder, isOnline } = useOrders();
  const { showAlert } = useAlert();
  const c = theme.colors;

  const handleAccept = (id: string) => {
    if (activeOrder) {
      showAlert(t('newOrder'), 'You already have an active delivery. Complete it first.', [
        { text: t('ok'), style: 'default' },
      ]);
      return;
    }
    acceptOrder(id);
  };

  const handleDecline = (id: string) => {
    showAlert(t('decline'), 'Are you sure you want to decline this order?', [
      { text: t('cancel'), style: 'cancel' },
      { text: t('decline'), style: 'destructive', onPress: () => declineOrder(id) },
    ]);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={[styles.emptyIcon, { backgroundColor: c.card }]}>
        <MaterialIcons name="receipt-long" size={44} color={c.textMuted} />
      </View>
      <Text style={[styles.emptyTitle, { color: c.text }]}>{t('noOrders')}</Text>
      <Text style={[styles.emptySubtitle, { color: c.textSecondary }]}>{t('noOrdersSubtitle')}</Text>
    </View>
  );

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} backgroundColor={c.surface} />
      <Header showOnlineToggle />

      {/* Online status banner */}
      {!isOnline && (
        <View style={[styles.offlineBanner, { backgroundColor: c.error + '22', borderColor: c.error }]}>
          <MaterialIcons name="wifi-off" size={16} color={c.error} />
          <Text style={[styles.offlineText, { color: c.error }]}>  {t('offline_status')} — {t('goOnline')} to receive orders</Text>
        </View>
      )}

      {/* Active order banner */}
      {activeOrder && (
        <View style={[styles.activeBanner, { backgroundColor: Colors.primary + '22', borderColor: Colors.primary }]}>
          <MaterialIcons name="directions-bike" size={16} color={Colors.primary} />
          <Text style={[styles.activeBannerText, { color: Colors.primary }]}>
            {'  '}{t('activeDelivery')}: {t('orderID')}{activeOrder.orderNumber}
          </Text>
        </View>
      )}

      {/* Section Header */}
      <View style={[styles.sectionHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.sectionTitle, { color: c.text }]}>{t('availableOrders')}</Text>
        {pendingOrders.length > 0 && (
          <View style={[styles.countBadge, { backgroundColor: Colors.primary }]}>
            <Text style={styles.countText}>{pendingOrders.length}</Text>
          </View>
        )}
      </View>

      <FlatList
        data={isOnline ? pendingOrders : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onAccept={handleAccept}
            onDecline={handleDecline}
          />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  offlineText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  activeBannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  countBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  list: {
    paddingBottom: Spacing.xxl,
    paddingTop: Spacing.sm,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  emptySubtitle: {
    fontSize: FontSize.md,
    textAlign: 'center',
  },
});
