import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { Order } from '@/services/mockData';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

interface OrderCardProps {
  order: Order;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  disabled?: boolean;
}

export function OrderCard({ order, onAccept, onDecline, disabled = false }: OrderCardProps) {
  const { theme, t, isRTL } = useApp();
  const c = theme.colors;
  const [expanded, setExpanded] = useState(false);

  return (
    <Pressable
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }, Shadow.md]}
      onPress={() => setExpanded((p) => !p)}
    >
      {/* Header */}
      <View style={[styles.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <View style={[styles.restaurantIcon, { backgroundColor: Colors.primary + '22' }]}>
          <MaterialIcons name="store" size={22} color={Colors.primary} />
        </View>
        <View style={[styles.headerInfo, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
          <Text style={[styles.restaurantName, { color: c.text }]} numberOfLines={1}>
            {order.restaurantName}
          </Text>
          <Text style={[styles.addressText, { color: c.textSecondary }]} numberOfLines={1}>
            {order.restaurantAddress}
          </Text>
        </View>
        <View style={[styles.earningsTag, { backgroundColor: Colors.primary }]}>
          <Text style={styles.earningsText}>{order.earnings + order.tip} {t('egp')}</Text>
        </View>
      </View>

      {/* Stats Row */}
      <View style={[styles.statsRow, { flexDirection: isRTL ? 'row-reverse' : 'row', borderTopColor: c.border }]}>
        <View style={styles.stat}>
          <MaterialIcons name="near-me" size={14} color={Colors.primary} />
          <Text style={[styles.statText, { color: c.textSecondary }]}> {order.distance} {t('km')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: c.border }]} />
        <View style={styles.stat}>
          <MaterialIcons name="schedule" size={14} color={Colors.primary} />
          <Text style={[styles.statText, { color: c.textSecondary }]}> {order.estimatedTime} {t('minutes')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: c.border }]} />
        <View style={styles.stat}>
          <MaterialIcons name="shopping-bag" size={14} color={Colors.primary} />
          <Text style={[styles.statText, { color: c.textSecondary }]}> {order.items} {t('items')}</Text>
        </View>
        <View style={[styles.statDivider, { backgroundColor: c.border }]} />
        <Badge
          label={order.paymentMethod === 'cod' ? t('cod') : t('online')}
          type={order.paymentMethod === 'cod' ? 'warning' : 'info'}
          small
        />
      </View>

      {/* Expanded Details */}
      {expanded && (
        <View style={[styles.details, { borderTopColor: c.border }]}>
          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.dotGreen]} />
            <View style={[styles.detailTextBlock, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{t('pickupAddress')}</Text>
              <Text style={[styles.detailValue, { color: c.text }]}>{order.restaurantAddress}</Text>
            </View>
          </View>
          <View style={[styles.routeLine, { backgroundColor: c.border }]} />
          <View style={[styles.detailRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.dotYellow]} />
            <View style={[styles.detailTextBlock, { alignItems: isRTL ? 'flex-end' : 'flex-start', marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
              <Text style={[styles.detailLabel, { color: c.textMuted }]}>{t('dropoffAddress')}</Text>
              <Text style={[styles.detailValue, { color: c.text }]}>{order.deliveryAddress}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={[styles.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Button
          label={t('decline')}
          onPress={() => onDecline(order.id)}
          variant="ghost"
          size="md"
          style={styles.declineBtn}
        />
        <Button
          label={disabled ? t('orderLimitReached') : t('accept')}
          onPress={() => onAccept(order.id)}
          variant="primary"
          size="md"
          style={[styles.acceptBtn, disabled && { opacity: 0.5 }]}
          fullWidth
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  restaurantIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  restaurantName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  addressText: {
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  earningsTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.sm,
  },
  earningsText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  statsRow: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: FontSize.sm,
  },
  statDivider: {
    width: 1,
    height: 14,
    marginHorizontal: Spacing.sm,
  },
  details: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  detailRow: {
    alignItems: 'flex-start',
    marginVertical: 4,
  },
  dotGreen: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginTop: 4,
  },
  dotYellow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
    marginTop: 4,
  },
  routeLine: {
    width: 1,
    height: 16,
    marginLeft: 4.5,
  },
  detailTextBlock: {
    flex: 1,
  },
  detailLabel: {
    fontSize: FontSize.xs,
    marginBottom: 1,
  },
  detailValue: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  actions: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  declineBtn: {
    width: 90,
  },
  acceptBtn: {
    flex: 1,
  },
});
