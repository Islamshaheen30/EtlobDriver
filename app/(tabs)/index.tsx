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
  const { pendingOrders, activeOrders, adminConfig, acceptOrder, declineOrder, isOnline, canAcceptOrder } = useOrders();
  const { showAlert } = useAlert();
  const c = theme.colors;

  const limitReached = !canAcceptOrder();

  const handleAccept = (id: string) => {
    if (limitReached) {
      const msg = t('orderLimitMessage').replace('{limit}', String(adminConfig.max_simultaneous_orders));
      showAlert(t('orderLimitReached'), msg, [{ text: t('ok'), style: 'default' }]);
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

      {/* Offline banner */}
      {!isOnline && (
        <View style={[styles.banner, { backgroundColor: c.error + '18', borderColor: c.error }]}>
          <MaterialIcons name="wifi-off" size={15} color={c.error} />
          <Text style={[styles.bannerText, { color: c.error }]}>
            {'  '}{t('offline_status')} — {t('goOnline')} to receive orders
          </Text>
        </View>
      )}

      {/* Dynamic order limit indicator */}
      <View style={[styles.limitBar, { backgroundColor: c.surface, borderBottomColor: c.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.limitLeft, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <MaterialIcons name="layers" size={15} color={limitReached ? c.error : Colors.primary} />
          <Text style={[styles.limitLabel, { color: limitReached ? c.error : c.textSecondary }]}>
            {'  '}{t('activeOrders')}: {activeOrders.length}/{adminConfig.max_simultaneous_orders}
          </Text>
        </View>
        {/* Progress dots */}
        <View style={[styles.limitDots, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {Array.from({ length: adminConfig.max_simultaneous_orders }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.limitDot,
                { backgroundColor: i < activeOrders.length ? (limitReached ? c.error : Colors.primary) : c.border },
              ]}
            />
          ))}
        </View>
      </View>

      {/* Limit reached warning */}
      {limitReached && (
        <View style={[styles.banner, { backgroundColor: c.error + '18', borderColor: c.error }]}>
          <MaterialIcons name="block" size={15} color={c.error} />
          <Text style={[styles.bannerText, { color: c.error }]}>
            {'  '}{t('orderLimitReached')} — {t('maxOrders')}: {adminConfig.max_simultaneous_orders}
          </Text>
        </View>
      )}

      {/* Active orders mini-strip */}
      {activeOrders.length > 0 && (
        <View style={[styles.activeStrip, { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: Colors.primary + '18', borderColor: Colors.primary }]}>
          <MaterialIcons name="directions-bike" size={15} color={Colors.primary} />
          <Text style={[styles.activeBannerText, { color: Colors.primary }]}>
            {'  '}{activeOrders.length} {t('activeDelivery')}{activeOrders.length > 1 ? 's' : ''}: {activeOrders.map((o) => `#${o.orderNumber}`).join(', ')}
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
            disabled={limitReached}
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
  screen: { flex: 1 },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    marginBottom: 0,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  limitBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  limitLeft: {
    alignItems: 'center',
  },
  limitLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  limitDots: {
    gap: 6,
    alignItems: 'center',
  },
  limitDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
  },
  activeBannerText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    flex: 1,
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
