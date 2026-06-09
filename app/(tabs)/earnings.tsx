import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Shadow } from '@/constants/theme';
import { useApp } from '@/hooks/useApp';
import { useOrders } from '@/hooks/useOrders';
import { mockEarningsHistory } from '@/services/mockData';

type Period = 'today' | 'week' | 'month';

export default function EarningsScreen() {
  const { theme, t, isRTL } = useApp();
  const { driver } = useOrders();
  const insets = useSafeAreaInsets();
  const c = theme.colors;
  const [period, setPeriod] = useState<Period>('today');

  const todayData = mockEarningsHistory[0];
  const weekTotal = mockEarningsHistory.reduce((s, e) => s + e.total, 0);
  const weekDeliveries = mockEarningsHistory.reduce((s, e) => s + e.orders, 0);
  const weekDistance = mockEarningsHistory.reduce((s, e) => s + e.distance, 0);

  const currentData = period === 'today' ? todayData : {
    total: period === 'week' ? weekTotal : weekTotal * 4,
    basePay: period === 'week'
      ? mockEarningsHistory.reduce((s, e) => s + e.basePay, 0)
      : mockEarningsHistory.reduce((s, e) => s + e.basePay, 0) * 4,
    tips: period === 'week'
      ? mockEarningsHistory.reduce((s, e) => s + e.tips, 0)
      : mockEarningsHistory.reduce((s, e) => s + e.tips, 0) * 4,
    bonus: period === 'week'
      ? mockEarningsHistory.reduce((s, e) => s + e.bonus, 0)
      : mockEarningsHistory.reduce((s, e) => s + e.bonus, 0) * 4,
    orders: period === 'week' ? weekDeliveries : weekDeliveries * 4,
    distance: period === 'week' ? weekDistance : weekDistance * 4,
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('todayEarnings') },
    { key: 'week', label: t('weeklyEarnings') },
    { key: 'month', label: t('monthlyEarnings') },
  ];

  return (
    <View style={[styles.screen, { backgroundColor: c.background }]}>
      <StatusBar barStyle={theme.isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm, backgroundColor: c.surface, borderBottomColor: c.border }]}>
        <Text style={[styles.headerTitle, { color: c.text }]}>{t('earnings')}</Text>
        <View style={[styles.balancePill, { backgroundColor: Colors.primary + '22' }]}>
          <MaterialIcons name="account-balance-wallet" size={14} color={Colors.primary} />
          <Text style={[styles.balanceText, { color: Colors.primary }]}>  {driver.availableBalance} {t('egp')}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* Hero Earnings Card */}
        <View style={[styles.heroCard, { backgroundColor: Colors.primary }]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>
                {period === 'today' ? t('todayEarnings') : period === 'week' ? t('weeklyEarnings') : t('monthlyEarnings')}
              </Text>
              <Text style={styles.heroAmount}>{currentData.total} <Text style={styles.heroUnit}>{t('egp')}</Text></Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: '#1A1A1A22' }]}>
              <MaterialIcons name="local-fire-department" size={18} color="#1A1A1A" />
              <Text style={styles.streakText}>{driver.streakDays} {t('streakDays')}</Text>
            </View>
          </View>

          <View style={styles.heroStats}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{currentData.orders}</Text>
              <Text style={styles.heroStatLabel}>{t('totalDeliveries')}</Text>
            </View>
            <View style={[styles.heroStatDivider]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{currentData.distance.toFixed(1)}</Text>
              <Text style={styles.heroStatLabel}>{t('km')}</Text>
            </View>
            <View style={[styles.heroStatDivider]} />
            <View style={styles.heroStat}>
              <Text style={styles.heroStatValue}>{driver.rating}</Text>
              <Text style={styles.heroStatLabel}>{t('avgRating')}</Text>
            </View>
          </View>
        </View>

        {/* Period Selector */}
        <View style={styles.periodRow}>
          {periods.map((p) => (
            <Pressable
              key={p.key}
              style={[
                styles.periodBtn,
                { backgroundColor: period === p.key ? Colors.primary : c.card, borderColor: period === p.key ? Colors.primary : c.border },
              ]}
              onPress={() => setPeriod(p.key)}
            >
              <Text style={[styles.periodText, { color: period === p.key ? '#1A1A1A' : c.textSecondary }]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Breakdown */}
        <View style={[styles.breakdownCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Breakdown</Text>
          {[
            { label: t('basePay'), value: currentData.basePay, icon: 'payments', color: c.text },
            { label: t('tips'), value: currentData.tips, icon: 'favorite', color: '#4CAF50' },
            { label: t('bonus'), value: currentData.bonus, icon: 'local-fire-department', color: Colors.primary },
          ].map((item, i) => (
            <View key={i}>
              {i > 0 && <View style={[styles.breakdownDivider, { backgroundColor: c.border }]} />}
              <View style={[styles.breakdownRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[styles.breakdownIcon, { backgroundColor: item.color + '22' }]}>
                  <MaterialIcons name={item.icon as any} size={18} color={item.color} />
                </View>
                <Text style={[styles.breakdownLabel, { color: c.textSecondary, marginLeft: isRTL ? 0 : Spacing.sm, marginRight: isRTL ? Spacing.sm : 0 }]}>
                  {item.label}
                </Text>
                <Text style={[styles.breakdownValue, { color: item.color }]}>+{item.value} {t('egp')}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Balance Cards */}
        <View style={[styles.balanceRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <View style={[styles.balanceCard, { backgroundColor: c.card, borderColor: c.border, flex: 1 }]}>
            <MaterialIcons name="hourglass-empty" size={20} color={Colors.primaryDark} />
            <Text style={[styles.balanceAmount, { color: c.text }]}>{driver.pendingBalance}</Text>
            <Text style={[styles.balanceLabel, { color: c.textMuted }]}>{t('pendingBalance')}</Text>
          </View>
          <View style={[styles.balanceCard, { backgroundColor: Colors.primary, flex: 1 }]}>
            <MaterialIcons name="account-balance-wallet" size={20} color="#1A1A1A" />
            <Text style={[styles.balanceAmountDark]}>{driver.availableBalance}</Text>
            <Text style={[styles.balanceLabelDark]}>{t('availableBalance')}</Text>
          </View>
        </View>

        {/* Withdraw Button */}
        <Pressable
          style={({ pressed }) => [styles.withdrawBtn, { ...Shadow.lg, opacity: pressed ? 0.85 : 1 }]}
        >
          <MaterialIcons name="account-balance" size={22} color="#1A1A1A" />
          <Text style={styles.withdrawText}>{t('withdrawNow')} {driver.availableBalance} {t('egp')}</Text>
        </Pressable>

        {/* Recent Deliveries */}
        <Text style={[styles.sectionTitle2, { color: c.text }]}>{t('recentDeliveries')}</Text>
        {mockEarningsHistory.map((record) => (
          <View key={record.id} style={[styles.historyItem, { backgroundColor: c.card, borderColor: c.border, flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[styles.historyDateBadge, { backgroundColor: Colors.primary + '22' }]}>
              <Text style={[styles.historyDateText, { color: Colors.primary }]}>
                {record.date.getDate()}
              </Text>
              <Text style={[styles.historyMonthText, { color: Colors.primaryDark }]}>
                {record.date.toLocaleDateString('en', { month: 'short' })}
              </Text>
            </View>
            <View style={[styles.historyInfo, { marginLeft: isRTL ? 0 : Spacing.md, marginRight: isRTL ? Spacing.md : 0, alignItems: isRTL ? 'flex-end' : 'flex-start' }]}>
              <Text style={[styles.historyDate, { color: c.text }]}>{formatDate(record.date)}</Text>
              <Text style={[styles.historySubtitle, { color: c.textMuted }]}>
                {record.orders} orders · {record.distance.toFixed(1)} km
              </Text>
            </View>
            <Text style={[styles.historyTotal, { color: Colors.primary }]}>+{record.total} {t('egp')}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
  },
  balanceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  content: {
    paddingBottom: Spacing.xxl,
  },
  heroCard: {
    margin: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  heroLabel: {
    fontSize: FontSize.sm,
    color: '#1A1A1Acc',
    marginBottom: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  heroAmount: {
    fontSize: FontSize.hero,
    fontWeight: FontWeight.heavy,
    color: '#1A1A1A',
  },
  heroUnit: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    gap: 4,
  },
  streakText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A22',
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  heroStat: {
    alignItems: 'center',
  },
  heroStatValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  heroStatLabel: {
    fontSize: FontSize.xs,
    color: '#1A1A1Aaa',
    marginTop: 2,
  },
  heroStatDivider: {
    width: 1,
    backgroundColor: '#1A1A1A33',
  },
  periodRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: Radius.full,
    alignItems: 'center',
    borderWidth: 1,
  },
  periodText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },
  sectionTitle2: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  breakdownCard: {
    marginHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  breakdownRow: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  breakdownIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breakdownLabel: {
    flex: 1,
    fontSize: FontSize.md,
  },
  breakdownValue: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  breakdownDivider: {
    height: 1,
    marginVertical: Spacing.xs,
  },
  balanceRow: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  balanceCard: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  balanceAmount: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
  },
  balanceAmountDark: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.heavy,
    color: '#1A1A1A',
  },
  balanceLabel: {
    fontSize: FontSize.sm,
  },
  balanceLabelDark: {
    fontSize: FontSize.sm,
    color: '#1A1A1Aaa',
  },
  withdrawBtn: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
    height: 56,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  withdrawText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#1A1A1A',
  },
  historyItem: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  historyDateBadge: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyDateText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  historyMonthText: {
    fontSize: FontSize.xs,
  },
  historyInfo: {
    flex: 1,
    gap: 2,
  },
  historyDate: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  historySubtitle: {
    fontSize: FontSize.sm,
  },
  historyTotal: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
});
